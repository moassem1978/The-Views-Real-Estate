import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  Move, 
  Edit3, 
  Check, 
  AlertTriangle,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoData {
  filename: string;
  originalName: string;
  altText: string;
  uploadedAt: string;
  fileSize: number;
  mimeType: string;
  order: number;
  url?: string;
}

interface PhotoManagerProps {
  propertyId?: number;
  initialPhotos?: PhotoData[];
  onPhotosChange?: (photos: PhotoData[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export default function PhotoManager({ 
  propertyId, 
  initialPhotos = [], 
  onPhotosChange,
  maxPhotos = 20,
  disabled = false
}: PhotoManagerProps) {
  const [photos, setPhotos] = useState<PhotoData[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAltText, setEditAltText] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;
    
    if (photos.length + acceptedFiles.length > maxPhotos) {
      toast({
        title: "Too many photos",
        description: `Maximum ${maxPhotos} photos allowed`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('photos', file);
      });

      const endpoint = propertyId 
        ? `/api/photos/upload/${propertyId}`
        : '/api/photos/upload';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const newPhotos = result.photos.map((photo: PhotoData, index: number) => ({
          ...photo,
          url: `/uploads/properties/${photo.filename}`,
          order: photos.length + index
        }));

        const updatedPhotos = [...photos, ...newPhotos];
        setPhotos(updatedPhotos);
        onPhotosChange?.(updatedPhotos);

        toast({
          title: "Upload successful",
          description: `${result.totalUploaded} photos uploaded`
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [photos, propertyId, maxPhotos, disabled, onPhotosChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: maxPhotos - photos.length,
    disabled: disabled || uploading
  });

  const deletePhoto = async (index: number) => {
    if (disabled) return;

    const photo = photos[index];
    
    try {
      if (propertyId && photo.filename) {
        const response = await fetch(`/api/photos/property/${propertyId}/photo/${photo.filename}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to delete photo');
        }
      }

      const updatedPhotos = photos.filter((_, i) => i !== index);
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);

      toast({
        title: "Photo deleted",
        description: "Photo removed successfully"
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const updateAltText = async (index: number, newAltText: string) => {
    if (disabled) return;

    const photo = photos[index];
    
    try {
      if (propertyId && photo.filename) {
        const response = await fetch(`/api/photos/property/${propertyId}/photo/${photo.filename}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ altText: newAltText }),
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to update photo');
        }
      }

      const updatedPhotos = [...photos];
      updatedPhotos[index] = { ...photo, altText: newAltText };
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);

      toast({
        title: "Photo updated",
        description: "Alt text updated successfully"
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const reorderPhotos = async (fromIndex: number, toIndex: number) => {
    if (disabled) return;

    const updatedPhotos = [...photos];
    const [movedPhoto] = updatedPhotos.splice(fromIndex, 1);
    updatedPhotos.splice(toIndex, 0, movedPhoto);

    // Update order indices
    const reorderedPhotos = updatedPhotos.map((photo, index) => ({
      ...photo,
      order: index
    }));

    setPhotos(reorderedPhotos);
    onPhotosChange?.(reorderedPhotos);

    if (propertyId) {
      try {
        const photoOrder = reorderedPhotos.map(photo => photo.filename);
        const response = await fetch(`/api/photos/property/${propertyId}/reorder`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ photoOrder }),
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to reorder photos');
        }

        toast({
          title: "Photos reordered",
          description: "Photo order updated successfully"
        });
      } catch (error) {
        toast({
          title: "Reorder failed",
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: "destructive"
        });
      }
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderPhotos(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditAltText(photos[index].altText);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      updateAltText(editingIndex, editAltText);
      setEditingIndex(null);
      setEditAltText('');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditAltText('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Photo Management
          <Badge variant="outline">
            {photos.length}/{maxPhotos}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        {photos.length < maxPhotos && (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop photos here' : 'Upload Photos'}
            </p>
            <p className="text-gray-500">
              Drag and drop or click to select photos
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Supports: JPEG, PNG, WebP, GIF (max 25MB each)
            </p>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading photos...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Photos Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.filename}
                draggable={!disabled}
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  relative group border rounded-lg overflow-hidden bg-white
                  ${draggedIndex === index ? 'opacity-50' : ''}
                  ${!disabled ? 'cursor-move' : ''}
                `}
              >
                {/* Photo */}
                <div className="aspect-square bg-gray-100">
                  <img loading="lazy"
                    src={photo.url || `/uploads/properties/${photo.filename}`}
                    alt={photo.altText}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.svg';
                    }}
                  />
                </div>

                {/* Order Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {index + 1}
                  </Badge>
                </div>

                {/* Actions */}
                {!disabled && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => startEditing(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePhoto(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Alt Text */}
                <div className="p-2">
                  {editingIndex === index ? (
                    <div className="space-y-2">
                      <Input
                        value={editAltText}
                        onChange={(e) => setEditAltText(e.target.value)}
                        placeholder="Alt text"
                        className="text-xs"
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          className="h-6 px-2 text-xs"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="h-6 px-2 text-xs"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 truncate">
                      {photo.altText}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {photos.length === 0 && !uploading && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No photos uploaded yet. Add photos to showcase this property.
            </AlertDescription>
          </Alert>
        )}

        {/* Photo Management Instructions */}
        {photos.length > 0 && (
          <Alert>
            <Move className="h-4 w-4" />
            <AlertDescription>
              Drag photos to reorder them. The first photo will be the main display image.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}