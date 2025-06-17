import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadManagerProps {
  existingImages?: string[];
  onImagesChange: (images: string[], imagesToRemove: string[]) => void;
  maxImages?: number;
}

export default function ImageUploadManager({ 
  existingImages = [], 
  onImagesChange, 
  maxImages = 20 
}: ImageUploadManagerProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleRemoveImage = useCallback((urlToRemove: string) => {
    const newImages = images.filter(url => url !== urlToRemove);
    const newImagesToRemove = [...imagesToRemove, urlToRemove];
    
    setImages(newImages);
    setImagesToRemove(newImagesToRemove);
    onImagesChange(newImages, newImagesToRemove);
  }, [images, imagesToRemove, onImagesChange]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      const newImageUrls = result.imageUrls || [];
      const updatedImages = [...images, ...newImageUrls];
      
      setImages(updatedImages);
      onImagesChange(updatedImages, imagesToRemove);
      toast.success(`${newImageUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [images, imagesToRemove, maxImages, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Property Images</label>
        <span className="text-sm text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={imageUrl} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(imageUrl)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2 text-gray-500">
              <ImageIcon className="h-8 w-8" />
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Drag and drop images here, or{' '}
                <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                  browse files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                    disabled={uploading}
                  />
                </label>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Maximum {maxImages - images.length} more images
              </p>
            </div>
          </div>
        </div>
      )}

      {uploading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Uploading images...</span>
          </div>
        </div>
      )}
    </div>
  );
}