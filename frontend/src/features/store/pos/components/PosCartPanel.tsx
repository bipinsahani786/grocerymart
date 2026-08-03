
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  QrCode,
  BookOpen,
  Banknote,
  CheckCircle,
  UserPlus,
  ShoppingBag,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

export interface CartItem {
  productId: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  mrp?: number;
  unit?: string;
  taxRate: number;
  taxSplit?: any;
  quantity: number;
  availableQty: number;
}

interface PosCartPanelProps {
  todayTotalSalesVolume: number;
  todayPosOrdersCount: number;
  staffOptions: any[];
  selectedStaffId: string;
  handleSelectStaff: (id: string) => void;
  customerOptions: any[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  setShowNewCustomerModal: (show: boolean) => void;
  handleOpenNewCustomerModal?: (initialInput?: string) => void;
  selectedCustomerObj: any;
  cart: CartItem[];
  handleUpdateQuantity: (productId: string, delta: number) => void;
  handleRemoveFromCart: (productId: string) => void;
  cartSubtotal: number;
  totalTaxAmount: number;
  discountValue: number;
  setDiscountValue: (val: number) => void;
  grandTotal: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'CREDIT';
  setPaymentMethod: (pm: 'CASH' | 'CARD' | 'UPI' | 'CREDIT') => void;
  cashTendered: string;
  setCashTendered: (val: string) => void;
  cashChangeDue: number;
  handleCheckout: () => void;
  setCart: (cart: CartItem[]) => void;
  isCheckoutPending: boolean;
}

export function PosCartPanel({
  todayTotalSalesVolume,
  todayPosOrdersCount,
  staffOptions,
  selectedStaffId,
  handleSelectStaff,
  customerOptions,
  selectedCustomerId,
  setSelectedCustomerId,
  setShowNewCustomerModal,
  handleOpenNewCustomerModal,
  selectedCustomerObj,
  cart,
  handleUpdateQuantity,
  handleRemoveFromCart,
  cartSubtotal,
  totalTaxAmount,
  discountValue,
  setDiscountValue,
  grandTotal,
  paymentMethod,
  setPaymentMethod,
  cashTendered,
  setCashTendered,
  cashChangeDue,
  handleCheckout,
  setCart,
  isCheckoutPending,
}: PosCartPanelProps) {
  return (
    <div className="lg:col-span-5 flex flex-col space-y-3.5 bg-card border border-border p-4 rounded-2xl shadow-xs">
      {/* Today POS Sales Summary & Staff Dropdown Bar */}
      <div className="space-y-2.5 bg-muted/30 p-3 rounded-xl border border-border">
        {/* Today Sales Strip */}
        <div className="flex items-center justify-between text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-lg border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-emerald-500" />
            <span>
              Today POS Sales:{' '}
              <strong className="font-mono font-black text-foreground">
                ₹{todayTotalSalesVolume.toLocaleString('en-IN')}
              </strong>
            </span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-black">
            {todayPosOrdersCount} Bills
          </span>
        </div>

        {/* Active Cashier Selection Dropdown (ONLY CASHIERS - Persisted & Searchable) */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5 text-primary-500" /> Cashier Name
          </label>
          <CustomDropdown
            options={staffOptions}
            value={selectedStaffId}
            onChange={handleSelectStaff}
            placeholder="Select Cashier Name"
            searchable
          />
        </div>
      </div>

      {/* Customer Selection Dropdown (from store_customers table) */}
      <div className="space-y-1.5 bg-muted/20 p-3 rounded-xl border border-border">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-primary-500" /> Customer Account
          </label>
          <button
            type="button"
            onClick={() => {
              if (handleOpenNewCustomerModal) {
                handleOpenNewCustomerModal();
              } else {
                setShowNewCustomerModal(true);
              }
            }}
            className="text-[11px] font-extrabold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <UserPlus className="h-3.5 w-3.5" /> Add Customer
          </button>
        </div>

        <CustomDropdown
          options={customerOptions}
          value={selectedCustomerId}
          onChange={(val) => setSelectedCustomerId(val)}
          placeholder="Search customer by name or phone..."
          searchable
          creatable
          onCreate={(searchTerm) => {
            if (handleOpenNewCustomerModal) {
              handleOpenNewCustomerModal(searchTerm);
            } else {
              setShowNewCustomerModal(true);
            }
          }}
        />

        {selectedCustomerObj && (
          <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground">
            <span>
              Loyalty Pts:{' '}
              <strong className="text-foreground font-bold">
                {selectedCustomerObj.user?.loyaltyPoints || 0} pts
              </strong>
            </span>
            <span>
              Khata Balance:{' '}
              <strong
                className={
                  selectedCustomerObj.dueAmount > 0
                    ? 'text-rose-500 font-bold'
                    : 'text-emerald-500 font-bold'
                }
              >
                ₹{selectedCustomerObj.dueAmount || 0}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Active Cart Items List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar border border-border rounded-xl divide-y divide-border min-h-[190px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
            <ShoppingCart className="h-10 w-10 opacity-30" />
            <p className="font-bold text-sm text-foreground">Sales Cart is Empty</p>
            <p className="text-xs max-w-xs">
              Click "+ Add" on any product in the DataTable on the left to start billing.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.productId}
              className="p-3 flex items-center justify-between gap-2 hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-foreground truncate">{item.name}</h4>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>
                    ₹{item.price} / {item.unit}
                  </span>
                  {item.taxRate > 0 && (
                    <span className="text-amber-500 font-semibold">{item.taxRate}% GST</span>
                  )}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-lg border border-border">
                <button
                  onClick={() => handleUpdateQuantity(item.productId, -1)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="font-mono font-black text-xs px-1 min-w-[20px] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(item.productId, 1)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Line Total & Delete */}
              <div className="text-right flex items-center gap-2 shrink-0">
                <span className="font-mono font-black text-xs text-foreground">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemoveFromCart(item.productId)}
                  className="text-rose-500 hover:text-rose-600 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Summary & Payment Section */}
      <div className="space-y-3 bg-muted/20 p-3.5 rounded-xl border border-border">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span className="font-mono font-bold text-foreground">₹{cartSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Total GST Tax (CGST + SGST)</span>
            <span className="font-mono font-bold text-foreground">₹{totalTaxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground pt-1">
            <span>Discount (%)</span>
            <div className="flex items-center gap-1.5">
              {discountValue > 0 && (
                <span className="text-[10px] text-amber-500 font-bold">
                  -₹{((cartSubtotal * discountValue) / 100).toFixed(2)}
                </span>
              )}
              <Input
                type="number"
                min={0}
                max={100}
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                placeholder="0"
                className="w-20 h-7 text-right font-mono text-xs font-bold"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border text-base font-black">
            <span className="text-foreground">Grand Total:</span>
            <span className="font-mono text-lg text-primary-600 dark:text-primary-400">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Modes */}
        <div className="space-y-1 pt-1">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
            Payment Mode
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'CASH', name: 'Cash', icon: Banknote },
              { id: 'CARD', name: 'Card', icon: CreditCard },
              { id: 'UPI', name: 'UPI', icon: QrCode },
              { id: 'CREDIT', name: 'Khata', icon: BookOpen },
            ].map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethod(pm.id as any)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === pm.id
                    ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                    : 'bg-card text-muted-foreground hover:text-foreground border-border'
                }`}
              >
                <pm.icon className="h-4 w-4 mb-1" />
                <span>{pm.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash Calculator */}
        {paymentMethod === 'CASH' && (
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase">
                Cash Received (₹)
              </label>
              <Input
                type="number"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                placeholder={grandTotal.toFixed(0)}
                className="h-8 font-mono font-bold text-xs"
              />
            </div>
            <div className="flex flex-col justify-center bg-card p-2 rounded-lg border border-border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Change Due
              </span>
              <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                ₹{cashChangeDue.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCart([])}
            disabled={cart.length === 0}
            className="w-1/3 font-bold text-xs"
          >
            Clear Cart
          </Button>
          <Button
            type="button"
            variant="brand"
            disabled={cart.length === 0 || isCheckoutPending}
            isLoading={isCheckoutPending}
            onClick={handleCheckout}
            className="w-2/3 font-extrabold text-sm gap-1.5 shadow-sm"
          >
            <CheckCircle className="h-4 w-4" /> Pay & Complete Sale
          </Button>
        </div>
      </div>
    </div>
  );
}
