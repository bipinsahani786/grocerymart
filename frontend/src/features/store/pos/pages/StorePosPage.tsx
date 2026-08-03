import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SafeCategoryImage } from '@/components/ui/SafeCategoryImage';
import { type ColumnDef } from '@/components/ui/data-table';
import { useAuthStore } from '@/store/authStore';
import {
  useStoreInventory,
  useAllStoreCategories,
  useStoreCustomers,
  useStoreOrders,
  useStoreStaff,
  useCreatePosOrder,
  useCreateStoreCustomer
} from '@/features/store/api/useStorePanel';
import { getFileUrl } from '@/lib/utils';
import { toast } from 'sonner';

// Modular POS Subcomponents
import { PosHeaderBar } from '../components/PosHeaderBar';
import { PosCatalogPanel } from '../components/PosCatalogPanel';
import { PosCartPanel, type CartItem } from '../components/PosCartPanel';
import { PosNewCustomerModal } from '../components/PosNewCustomerModal';
import { PosSuccessModal } from '../components/PosSuccessModal';

export default function StorePosPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id || (user as any)?.storeId || (user as any)?.managedStore?.id;
  const managerName = user?.name || (user as any)?.fullName || 'Store Manager';

  // Persisted Staff Selection in LocalStorage
  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    return localStorage.getItem('grocerymart_pos_selected_staff_id') || '';
  });

  const handleSelectStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
    if (staffId) {
      localStorage.setItem('grocerymart_pos_selected_staff_id', staffId);
    } else {
      localStorage.removeItem('grocerymart_pos_selected_staff_id');
    }
  };

  // Data Queries directly from products, store_customers, and staff backend tables
  const { data: inventoryData, isLoading: isInventoryLoading } = useStoreInventory(storeId);
  const { data: categoriesData } = useAllStoreCategories(storeId);
  const { data: customersData } = useStoreCustomers(storeId);
  const { data: staffData } = useStoreStaff(storeId);
  const { data: todayOrdersData } = useStoreOrders(storeId, { type: 'POS' });

  const inventory = Array.isArray(inventoryData)
    ? inventoryData
    : (Array.isArray(inventoryData?.data) ? inventoryData.data : []);

  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : (Array.isArray(categoriesData?.data) ? categoriesData.data : []);

  const customers = Array.isArray(customersData)
    ? customersData
    : (Array.isArray(customersData?.data) ? customersData.data : []);

  const staffList = Array.isArray(staffData)
    ? staffData
    : (Array.isArray(staffData?.data) ? staffData.data : []);

  const todayPosOrders = Array.isArray(todayOrdersData?.orders)
    ? todayOrdersData.orders
    : (Array.isArray(todayOrdersData)
      ? todayOrdersData
      : (Array.isArray(todayOrdersData?.data) ? todayOrdersData.data : []));

  // Cashier Dropdown Options (STRICTLY CASHIER ROLE ONLY)
  const staffOptions = useMemo(() => {
    if (!staffList || staffList.length === 0) {
      return [{ value: '', label: 'No registered cashiers found' }];
    }

    const cashiers = staffList.filter((s: any) => {
      const r = String(s.role || s.designation || s.user?.role?.name || s.user?.role || '').toUpperCase();
      return r === 'CASHIER' || r.includes('CASHIER');
    });

    const displayList = cashiers.length > 0 ? cashiers : staffList;

    return [
      { value: '', label: 'Select Cashier Name' },
      ...displayList.map((s: any) => ({
        value: s.id || s.userId,
        label: `🧑‍💼 ${s.name || s.user?.name || 'Cashier'}`,
      })),
    ];
  }, [staffList]);



  // Mutations
  const createPosOrderMutation = useCreatePosOrder();
  const createCustomerMutation = useCreateStoreCustomer();

  // POS State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI' | 'CREDIT'>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Modals State
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustForm, setNewCustForm] = useState({ name: '', phone: '', email: '' });

  // Map products directly from products table API response
  const products = useMemo(() => {
    return inventory.map((prod: any) => {
      // Stock quantity from StoreInventory
      const availableQty = Array.isArray(prod.inventory) && prod.inventory.length > 0
        ? prod.inventory.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0)
        : (prod.quantity ?? 0);

      // Tax rate from product or tax class
      const taxRate = prod.taxRate ||
        prod.taxClass?.rates?.[0]?.components?.reduce((sum: number, c: any) => sum + (c.rate || 0), 0) || 0;

      const taxSplit = prod.taxClass?.rates?.[0]?.components?.reduce((acc: any, c: any) => {
        acc[c.name] = c.rate;
        return acc;
      }, {}) || null;

      return {
        id: prod.id,
        name: prod.name || 'Unnamed Product',
        sku: prod.sku,
        barcode: prod.barcode,
        price: prod.basePrice ?? prod.sellingPrice ?? prod.price ?? 0,
        mrp: prod.mrp,
        unit: prod.unit || 'pcs',
        taxRate: taxRate,
        taxSplit: taxSplit,
        categoryId: prod.categoryId,
        categoryName: prod.category?.name || 'General',
        availableQty: availableQty,
        imageUrl: prod.imageUrls || prod.imageUrl || prod.images || prod.masterProduct?.imageUrls || prod.masterProduct?.imageUrl || null,
        rawProduct: prod,
      };
    });
  }, [inventory]);

  // Customer options directly from store_customers table
  const customerOptions = useMemo(() => {
    return [
      { value: '', label: '👤 Walk-in Counter Customer' },
      ...customers.map((c: any) => ({
        value: c.userId || c.user?.id || c.id,
        label: `${c.user?.name || c.name || 'Customer'} - 📞 ${c.user?.phone || c.phone} ${c.dueAmount > 0 ? `(Khata Due: ₹${c.dueAmount})` : ''}`,
      })),
    ];
  }, [customers]);

  // Selected customer object from store_customers
  const selectedCustomerObj = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find((c: any) => (c.userId || c.user?.id || c.id) === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Filter Products by Cascading Category & Search Term
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      let matchCat = true;
      if (selectedCategory && selectedCategory !== 'ALL') {
        const catIds = new Set<string>([selectedCategory]);
        const addChildren = (parentId: string) => {
          categories.forEach((c: any) => {
            if (c.parentId === parentId && !catIds.has(c.id)) {
              catIds.add(c.id);
              addChildren(c.id);
            }
          });
        };
        addChildren(selectedCategory);
        matchCat = catIds.has(p.categoryId);
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.barcode || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q);

      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, categories, searchQuery]);

  // DataTable Column Definitions for Product Catalog
  const columns: ColumnDef<any>[] = [
    {
      header: 'Product Details',
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
            <SafeCategoryImage
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
              iconSize="w-4 h-4"
              type="product"
            />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-foreground truncate max-w-[170px]">{item.name}</h4>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
              {item.barcode && <span>Bar: {item.barcode}</span>}
              {item.sku && <span>SKU: {item.sku}</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (item) => (
        <Badge variant="outline" className="text-[10px] font-bold">
          {item.categoryName}
        </Badge>
      ),
    },
    {
      header: 'Price / Unit',
      cell: (item) => (
        <div>
          <span className="font-mono font-black text-xs text-foreground">₹{item.price}</span>
          <span className="text-[10px] text-muted-foreground font-medium"> / {item.unit}</span>
          {item.mrp && item.mrp > item.price && (
            <div className="text-[9px] text-muted-foreground line-through">MRP: ₹{item.mrp}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Stock Status',
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <Badge
            variant={item.availableQty > 10 ? 'success' : item.availableQty > 0 ? 'warning' : 'destructive'}
            className="font-mono text-[9px] px-1.5 py-0.2 uppercase font-bold w-fit"
          >
            {item.availableQty > 0 ? `${item.availableQty} ${item.unit}` : 'OUT OF STOCK'}
          </Badge>
          {item.taxRate > 0 && (
            <span className="text-[9px] font-bold text-amber-500">{item.taxRate}% GST</span>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      cell: (item) => (
        <Button
          size="sm"
          variant="brand"
          disabled={item.availableQty <= 0}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(item);
          }}
          className="h-7 px-2.5 font-extrabold text-xs gap-1 shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      ),
    },
  ];

  // Add Item to POS Cart
  const handleAddToCart = (product: any) => {
    if (product.availableQty <= 0) {
      toast.error(`"${product.name}" is Out of Stock!`);
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === product.id);
      if (existingIdx > -1) {
        const item = prev[existingIdx];
        if (item.quantity >= product.availableQty) {
          toast.error(`Cannot add more. Available stock: ${product.availableQty}`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIdx] = { ...item, quantity: item.quantity + 1 };
        return updated;
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          price: product.price,
          mrp: product.mrp,
          unit: product.unit,
          taxRate: product.taxRate || 0,
          taxSplit: product.taxSplit || null,
          quantity: 1,
          availableQty: product.availableQty,
        },
      ];
    });
  };

  // Update Item Quantity in Cart
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.availableQty) {
              toast.error(`Max stock available: ${item.availableQty}`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Barcode Form Submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matchedProduct = products.find(
      (p: any) =>
        (p.barcode && p.barcode.toLowerCase() === searchQuery.trim().toLowerCase()) ||
        (p.sku && p.sku.toLowerCase() === searchQuery.trim().toLowerCase())
    );

    if (matchedProduct) {
      handleAddToCart(matchedProduct);
      setSearchQuery('');
    } else {
      toast.error(`No product found with barcode/SKU: "${searchQuery}"`);
    }
  };

  // Cart Totals Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const totalTaxAmount = useMemo(() => {
    return cart.reduce((sum, item) => {
      const lineSubtotal = item.price * item.quantity;
      return sum + (lineSubtotal * item.taxRate) / 100;
    }, 0);
  }, [cart]);

  const grandTotal = useMemo(() => {
    const discountAmt = (cartSubtotal * (discountValue || 0)) / 100;
    return Math.max(0, cartSubtotal + totalTaxAmount - discountAmt);
  }, [cartSubtotal, totalTaxAmount, discountValue]);

  const cashChangeDue = useMemo(() => {
    const tendered = parseFloat(cashTendered) || 0;
    return Math.max(0, tendered - grandTotal);
  }, [cashTendered, grandTotal]);

  // Auto-fill cash received (cashTendered) with grandTotal by default
  useEffect(() => {
    if (paymentMethod === 'CASH') {
      setCashTendered(grandTotal > 0 ? grandTotal.toFixed(2) : '');
    } else {
      setCashTendered('');
    }
  }, [grandTotal, paymentMethod]);

  // Submit POS Order Checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Sales cart is empty. Add products to proceed.');
      return;
    }

    if (!selectedStaffId) {
      toast.error('Please choose a cashier.');
      return;
    }

    if (!selectedCustomerId) {
      toast.error('Please select or register a customer.');
      return;
    }

    if (paymentMethod === 'CASH') {
      const tendered = parseFloat(cashTendered);
      if (!cashTendered.trim() || isNaN(tendered) || tendered <= 0) {
        toast.error('Please enter the cash amount received.');
        return;
      }
      const roundedTendered = Math.round(tendered * 100);
      const roundedGrandTotal = Math.round(grandTotal * 100);
      if (roundedTendered < roundedGrandTotal) {
        toast.error(`Cash received (₹${tendered.toFixed(2)}) is less than total amount (₹${grandTotal.toFixed(2)}).`);
        return;
      }
    }

    createPosOrderMutation.mutate(
      {
        storeId,
        staffId: selectedStaffId,
        customerId: selectedCustomerId,
        discount: (cartSubtotal * (discountValue || 0)) / 100,
        paymentMethod,
        notes: orderNotes || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          taxRate: item.taxRate,
          taxSplit: item.taxSplit,
        })),
      },
      {
        onSuccess: (res: any) => {
          setCompletedOrder(res.data);
          setCart([]);
          setDiscountValue(0);
          setCashTendered('');
          setOrderNotes('');
          // Success Modal opens automatically via setCompletedOrder
        },
      }
    );
  };

  // Download PDF Invoice helper function
  const handleDownloadInvoicePdf = () => {
    if (!completedOrder) return;
    const pdfUrl = completedOrder.invoicePdfUrl;
    const orderId = completedOrder.id;
    const token = useAuthStore.getState().token;

    const targetUrl = pdfUrl
      ? getFileUrl(pdfUrl)
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/store/orders/${orderId}/pdf`;

    fetch(targetUrl, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((pdfRes) => {
        if (!pdfRes.ok) throw new Error('PDF download failed');
        return pdfRes.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      })
      .catch((err) => {
        console.error('Invoice PDF fetch failed:', err);
        if (orderId && token) {
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          window.open(`${apiBase}/store/orders/${orderId}/pdf?token=${encodeURIComponent(token)}`, '_blank');
        } else {
          toast.error('Failed to download invoice PDF.');
        }
      });
  };

  // Open New Customer Modal with prefilled phone/name from search term
  const handleOpenNewCustomerModal = (initialSearchTerm?: string) => {
    let name = '';
    let phone = '';
    if (initialSearchTerm && typeof initialSearchTerm === 'string') {
      const trimmed = initialSearchTerm.trim();
      const digitsOnly = trimmed.replace(/\D/g, '');
      const nonDigits = trimmed.replace(/[0-9]/g, '').trim();

      if (digitsOnly.length >= 7) {
        phone = digitsOnly.slice(0, 10);
        name = nonDigits;
      } else {
        name = trimmed;
      }
    }
    setNewCustForm({ name, phone, email: '' });
    setShowNewCustomerModal(true);
  };

  // Create Quick Customer Submit
  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    if (!newCustForm.name?.trim() || !newCustForm.phone?.trim()) {
      toast.error('Customer name and 10-digit phone number are required.');
      return;
    }
    if (!/^\d{10}$/.test(newCustForm.phone.trim())) {
      toast.error('Valid 10-digit mobile phone number is required.');
      return;
    }

    createCustomerMutation.mutate(
      {
        storeId,
        name: newCustForm.name.trim(),
        phone: newCustForm.phone.trim(),
        email: newCustForm.email?.trim() || undefined,
      },
      {
        onSuccess: (res: any) => {
          toast.success(`Customer "${newCustForm.name}" registered successfully`);
          setShowNewCustomerModal(false);
          setNewCustForm({ name: '', phone: '', email: '' });
          if (res?.data?.userId || res?.data?.id) {
            setSelectedCustomerId(res.data.userId || res.data.id);
          }
        },
      }
    );
  };

  // Today POS total sales sum
  const todayTotalSalesVolume = useMemo(() => {
    return todayPosOrders.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
  }, [todayPosOrders]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-3 pb-6">

      {/* ── STORE MANAGER BRANDING BAR ── */}
      <PosHeaderBar managerName={managerName} storeName={user?.store?.name} />

      {/* ── MAIN POS WORKSPACE SPLIT VIEW ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1600px] w-full mx-auto px-4 sm:px-6">

        {/* ── LEFT PANEL: Catalog DataTable Component ── */}
        <PosCatalogPanel
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          filteredProducts={filteredProducts}
          columns={columns}
          isInventoryLoading={isInventoryLoading}
          handleAddToCart={handleAddToCart}
          handleBarcodeSubmit={handleBarcodeSubmit}
        />

        {/* ── RIGHT PANEL: Sales Cart & Checkout Component ── */}
        <PosCartPanel
          todayTotalSalesVolume={todayTotalSalesVolume}
          todayPosOrdersCount={todayPosOrders.length}
          staffOptions={staffOptions}
          selectedStaffId={selectedStaffId}
          handleSelectStaff={handleSelectStaff}
          customerOptions={customerOptions}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
          setShowNewCustomerModal={setShowNewCustomerModal}
          handleOpenNewCustomerModal={handleOpenNewCustomerModal}
          selectedCustomerObj={selectedCustomerObj}
          cart={cart}
          handleUpdateQuantity={handleUpdateQuantity}
          handleRemoveFromCart={handleRemoveFromCart}
          cartSubtotal={cartSubtotal}
          totalTaxAmount={totalTaxAmount}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          grandTotal={grandTotal}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          cashTendered={cashTendered}
          setCashTendered={setCashTendered}
          cashChangeDue={cashChangeDue}
          handleCheckout={handleCheckout}
          setCart={setCart}
          isCheckoutPending={createPosOrderMutation.isPending}
        />

      </div>

      {/* ── QUICK ADD CUSTOMER MODAL ── */}
      <PosNewCustomerModal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        newCustForm={newCustForm}
        setNewCustForm={setNewCustForm}
        handleCreateCustomerSubmit={handleCreateCustomerSubmit}
        isLoading={createCustomerMutation.isPending}
      />

      {/* ── POS SALE COMPLETED SUCCESS POPUP MODAL ── */}
      <PosSuccessModal
        isOpen={Boolean(completedOrder)}
        onClose={() => setCompletedOrder(null)}
        completedOrder={completedOrder}
        onDownloadPdf={handleDownloadInvoicePdf}
      />

    </div>
  );
}
