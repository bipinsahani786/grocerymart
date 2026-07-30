import { Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SafeCategoryImage } from '@/components/ui/SafeCategoryImage';
import type { MasterProduct } from '../schemas/catalogSchemas';

interface ProductGridCardProps {
  product: MasterProduct;
  onEdit: (product: MasterProduct) => void;
  onDelete: (product: MasterProduct) => void;
}

export function ProductGridCard({ product, onEdit, onDelete }: ProductGridCardProps) {
  const imageUrl = Array.isArray(product.imageUrls) ? product.imageUrls[0] : (typeof product.imageUrls === 'string' ? product.imageUrls : '');
  const discountPercent =
    product.mrp && product.mrp > product.basePrice
      ? Math.round(((product.mrp - product.basePrice) / product.mrp) * 100)
      : null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary-500/40 transition-all flex flex-col justify-between space-y-3 group">
      <div className="space-y-3">
        {/* Top Header Image & Badges */}
        <div className="relative w-full h-36 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 overflow-hidden flex items-center justify-center">
          <SafeCategoryImage
            src={product.imageUrls}
            alt={product.name}
            type="product"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            iconSize="w-8 h-8"
          />

          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 dark:bg-zinc-900/90 text-slate-700 dark:text-slate-200 backdrop-blur-md border border-slate-200/80 dark:border-zinc-700/80 shadow-xs uppercase tracking-wider">
              {product.productType}
            </span>
          </div>

          {discountPercent && (
            <span className="absolute top-2 right-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1">
          {product.brand && (
            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest block">
              {product.brand}
            </span>
          )}
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
            <Tag className="w-3 h-3 shrink-0 text-slate-400" />
            <span>{product.category?.name || 'Unassigned'}</span>
            {product.unit && (
              <span className="text-[10px] text-slate-400">({product.unit})</span>
            )}
          </p>
        </div>
      </div>

      {/* Footer Pricing & Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
        <div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
            ₹{product.basePrice}
          </div>
          {product.mrp && product.mrp > product.basePrice ? (
            <div className="text-[11px] text-slate-400 line-through">
              ₹{product.mrp}
            </div>
          ) : (
            <div className="text-[10px] text-slate-400">Base Price</div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 border-slate-200 dark:border-zinc-800 cursor-pointer"
            title="Edit Product"
            onClick={() => onEdit(product)}
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-slate-200 dark:border-zinc-800 cursor-pointer"
            title="Delete Product"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductGridCard;
