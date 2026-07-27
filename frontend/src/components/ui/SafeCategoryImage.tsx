import { useState } from 'react';
import { FolderTree } from 'lucide-react';

export interface SafeCategoryImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  iconSize?: string;
}

export function SafeCategoryImage({ src, alt, className, iconSize = "w-5 h-5" }: SafeCategoryImageProps) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return <FolderTree className={`${iconSize} text-primary-500/70`} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
    />
  );
}

export default SafeCategoryImage;
