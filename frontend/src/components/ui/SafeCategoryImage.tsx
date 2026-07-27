import { FolderTree } from 'lucide-react';

export interface SafeCategoryImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  iconSize?: string;
}

export function SafeCategoryImage({
  src,
  alt,
  className,
  iconSize = 'w-5 h-5',
}: SafeCategoryImageProps) {
  // If no image src was provided by user, render clean category FolderTree icon
  if (!src || typeof src !== 'string' || !src.trim()) {
    return <FolderTree className={`${iconSize} text-primary-500/70`} />;
  }

  const cleanUrl = src.trim();
  let finalSrc = cleanUrl;

  // Resolve relative backend paths if not already absolute/data/blob
  if (
    !cleanUrl.startsWith('http://') &&
    !cleanUrl.startsWith('https://') &&
    !cleanUrl.startsWith('data:') &&
    !cleanUrl.startsWith('blob:')
  ) {
    const backendOrigin = (
      import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    ).replace(/\/api\/?$/, '');
    finalSrc = `${backendOrigin}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
    />
  );
}

export default SafeCategoryImage;
