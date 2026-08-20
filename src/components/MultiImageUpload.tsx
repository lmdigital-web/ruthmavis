import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { ImagePlus, X, Loader2, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MultiImageUploadProps {
  images: string[];
  onChange: (urls: string[]) => void;
  productId?: string;
}

export function MultiImageUpload({ images, onChange, productId }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    const newUrls: string[] = [...images];

    for (const file of acceptedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // Removed "products/" prefix to keep it simple

      try {
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Supabase storage upload error:", uploadError);
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (!data?.publicUrl) throw new Error("Could not get public URL");
        
        // Ensure we use a clean public URL without extra tokens
        const cleanUrl = data.publicUrl.split('?')[0]?.replace('/object/sign/', '/object/public/') || data.publicUrl;
        newUrls.push(cleanUrl);
      } catch (error: any) {
        console.error("Upload error details:", error);
        toast.error(`Error uploading ${file.name}: ${error.message || 'Unknown error'}`);
      }
    }

    onChange(newUrls);
    setUploading(false);
  }, [images, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    disabled: uploading
  });

  const removeImage = (index: number) => {
    const newUrls = [...images];
    newUrls.splice(index, 1);
    onChange(newUrls);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={url + index} className="relative group aspect-square rounded-xl overflow-hidden border border-gold/20 bg-secondary/10 flex items-center justify-center">
            <img 
              src={url} 
              alt="" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/400x400?text=Image+Error';
                console.error("Image failed to load:", url);
              }}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 p-1 bg-burgundy/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute bottom-0 inset-x-0 bg-black/40 text-[10px] text-white py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
              {index === 0 ? 'Primary' : `Image ${index + 1}`}
            </div>
          </div>
        ))}
        
        <div 
          {...getRootProps()} 
          className={cn(
            "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
            isDragActive ? "border-gold bg-gold/5" : "border-gold/20 hover:border-gold/40 bg-secondary/20",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          ) : (
            <>
              <ImagePlus className="w-6 h-6 text-gold mb-1" />
              <span className="text-[10px] text-muted-foreground font-medium px-2 text-center">Add Images</span>
            </>
          )}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        * First image will be used as the main thumbnail. Drag and drop supported.
      </p>
    </div>
  );
}
