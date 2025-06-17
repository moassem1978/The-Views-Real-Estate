import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadManagerProps {
  existingImages?: string[];
  onImagesChange: (images: string[], imagesToRemove: string[]) => void;
  maxImages?: number;
  propertyId?: number;
}

export default function ImageUploadManager({ 
  existingImages = [], 
  onImagesChange, 
  maxImages = 20,
  propertyId 
}: ImageUploadManagerProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDeleteImage = useCallback(async (imageUrl: string) => {
    // Immediately remove from state (optimistic update)
    const newImages = images.filter(img => img !== imageUrl);
    setImages(newImages);
    onImagesChange(newImages, imagesToRemove);

    // Make API call if property exists
    if (propertyId) {
      try {
        const encodedUrl = encodeURIComponent(imageUrl);
        await fetch(`/api/properties/${propertyId}/images/${encodedUrl}`, {
          method: "DELETE",
        });
        toast.success("Image deleted successfully");
      } catch (error) {
        console.error("Failed to delete image:", error);
        // Revert on failure
        setImages(images);
        onImagesChange(images, imagesToRemove);
        toast.error("Failed to delete image");
      }
    } else {
      // For new properties, just track for removal
      const newImagesToRemove = [...imagesToRemove, imageUrl];
      setImagesToRemove(newImagesToRemove);
      onImagesChange(newImages, newImagesToRemove);
    }
  }, [images, imagesToRemove, onImagesChange, propertyId]);

  const handleRemoveImage = useCallback((urlToRemove: string) => {
    handleDeleteImage(urlToRemove);
  }, [handleDeleteImage]);

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

  const handleReplaceImage = useCallback((index: number, newFile: File) => {
    const previewUrl = URL.createObjectURL(newFile);
    
    const updatedImages = [...images];
    const oldImageUrl = updatedImages[index];
    updatedImages[index] = previewUrl;
    
    setImages(updatedImages);
    onImagesChange(updatedImages, imagesToRemove);
    
    // Add old image to removal list if it exists
    if (oldImageUrl && !oldImageUrl.startsWith('blob:')) {
      const newImagesToRemove = [...imagesToRemove, oldImageUrl];
      setImagesToRemove(newImagesToRemove);
      onImagesChange(updatedImages, newImagesToRemove);
    }
    
    // Upload the new file
    const formData = new FormData();
    formData.append('images', newFile);
    
    fetch('/api/upload/images', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(result => {
      if (result.imageUrls && result.imageUrls[0]) {
        const finalImages = [...updatedImages];
        finalImages[index] = result.imageUrls[0];
        setImages(finalImages);
        onImagesChange(finalImages, imagesToRemove);
        URL.revokeObjectURL(previewUrl); // Clean up
      }
    })
    .catch(error => {
      console.error('Replace upload failed:', error);
      toast.error('Failed to replace image');
    });
  }, [images, imagesToRemove, onImagesChange]);

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
          {images.map((img) => (
            <div key={img} className="relative">
              <img 
                src={img} 
                className="w-full h-48 object-cover rounded-md" 
                alt="Property image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(img)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
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