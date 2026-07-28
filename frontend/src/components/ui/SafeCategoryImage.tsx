import { useState, useEffect } from 'react';
import { FolderTree, Package } from 'lucide-react';
import { getFileUrl } from '@/lib/utils';

export interface SafeCategoryImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  iconSize?: string;
  type?: 'category' | 'product';
}

export function SafeCategoryImage({
  src,
  alt,
  className = '',
  iconSize = 'w-5 h-5',
  type = 'product',
}: SafeCategoryImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const finalSrc = getFileUrl(src);

  if (!finalSrc || hasError) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 ${className}`}>
        {type === 'category' ? (
          <FolderTree className={`${iconSize} text-primary-500/70`} />
        ) : (
          <Package className={`${iconSize} opacity-60 text-slate-400`} />
        )}
      </div>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

export default SafeCategoryImage;
