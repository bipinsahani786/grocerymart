import * as React from 'react';
import { cn } from '@/lib/utils';
import { uploadToR2 } from '@/lib/r2';
import { Camera, Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  /** Current image URL to display as preview */
  value?: string | null;
  /** Called when upload succeeds with { path, public_url } */
  onUpload: (result: { path: string; public_url: string }) => void;
  /** Called when image is removed */
  onRemove?: () => void;
  /** R2 folder to upload into (e.g., 'avatars', 'products') */
  folder?: string;
  /** Max file size in bytes (default 10MB) */
  maxSize?: number;
  /** Accepted MIME types */
  accept?: string[];
  /** Shape variant */
  variant?: 'circle' | 'square';
  /** Size of the preview area */
  size?: 'sm' | 'md' | 'lg';
  /** Placeholder text when no image */
  placeholder?: string;
  /** Additional className */
  className?: string;
  /** Whether upload is disabled */
  disabled?: boolean;
}

const SIZE_MAP = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
};

export function ImageUpload({
  value,
  onUpload,
  onRemove,
  folder = 'uploads',
  maxSize = 10 * 1024 * 1024,
  accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  variant = 'circle',
  size = 'md',
  placeholder,
  className,
  disabled = false,
}: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSize) {
      toast.error(`File must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate type
    if (!accept.includes(file.type)) {
      toast.error('Unsupported file format');
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadToR2(file, folder);
      onUpload(result);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col items-start gap-2', className)}>
      <div className="relative group">
        <div
          className={cn(
            'border-2 border-dashed border-primary-500 overflow-hidden relative flex items-center justify-center bg-primary-50/30 dark:bg-slate-800 transition-colors',
            variant === 'circle' ? 'rounded-full' : 'rounded-lg',
            SIZE_MAP[size],
            !disabled && 'cursor-pointer hover:border-primary-600',
          )}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        >
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-primary-600 dark:text-primary-400">
              {placeholder ? (
                <span className="text-base font-black uppercase">{placeholder}</span>
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </div>
          )}

          {/* Camera Badge on Bottom Right */}
          {!disabled && !isUploading && (
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
              <Camera className="w-2.5 h-2.5" />
            </div>
          )}

          {/* Loading spinner */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept.join(',')}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
      </div>

      {/* Remove button */}
      {value && onRemove && !disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Remove
        </button>
      )}
    </div>
  );
}
