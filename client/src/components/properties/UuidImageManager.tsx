
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, GripVertical, Upload, RotateCcw } from 'lucide-react';

interface ImageMapping {
  imageId: string;
  originalFilename: string;
  currentFilename: string;
  altText: string;
  order: number;
  propertyId: number;
  uploadedAt: string;
  fileSize?: number;
  mimeType?: string;
}

interface UuidImageManagerProps {
  propertyId: number;
  onImagesChange?: (imageUrls: string[]) => void;
}

export function UuidImageManager({ propertyId, onImagesChange }: UuidImageManagerProps) {
  const [mappings, setMappings] = useState<ImageMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Load image mappings
  const loadMappings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${propertyId}/image-mappings`);
      const data = await response.json();
      
      if (data.success) {
        setMappings(data.mappings);
        onImagesChange?.(data.imageUrls);
      } else {
        setError('Failed to load image mappings');
      }
    } catch (err) {
      setError('Error loading image mappings');
      console.error('Error loading mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      loadMappings();
    }
  }, [propertyId]);

  // Upload new images
  const handleImageUpload = async (files: FileList) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/upload/property-images/${propertyId}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok && data.imageMappings) {
        await loadMappings(); // Reload to get updated mappings
        setError(null);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Error uploading images');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${propertyId}/images/${imageId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        await loadMappings();
      } else {
        setError(data.message || 'Delete failed');
      }
    } catch (err) {
      setError('Error deleting image');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reorder images
  const handleReorder = async (newOrder: string[]) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${propertyId}/reorder-images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: newOrder })
      });

      const data = await response.json();
      
      if (data.success) {
        setMappings(data.mappings);
      } else {
        setError(data.message || 'Reorder failed');
      }
    } catch (err) {
      setError('Error reordering images');
      console.error('Reorder error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Migrate legacy images
  const handleMigration = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${propertyId}/migrate-images`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        await loadMappings();
        setError(null);
      } else {
        setError(data.message || 'Migration failed');
      }
    } catch (err) {
      setError('Error migrating images');
      console.error('Migration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newMappings = [...mappings];
    const draggedItem = newMappings[draggedIndex];
    
    // Remove dragged item
    newMappings.splice(draggedIndex, 1);
    
    // Insert at new position
    newMappings.splice(dropIndex, 0, draggedItem);
    
    // Update order
    const reorderedIds = newMappings.map(mapping => mapping.imageId);
    handleReorder(reorderedIds);
    
    setDraggedIndex(null);
  };

  const getImageUrl = (mapping: ImageMapping) => {
    return `/uploads/properties/${mapping.propertyId}/${mapping.currentFilename}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          UUID Image Manager
          <div className="flex gap-2">
            <Button
              onClick={handleMigration}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Migrate Legacy
            </Button>
            <Button
              onClick={() => document.getElementById('image-upload')?.click()}
              disabled={loading}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
          className="hidden"
        />

        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        <div className="grid gap-4">
          {mappings.map((mapping, index) => (
            <div
              key={mapping.imageId}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`flex items-center gap-4 p-4 border rounded-lg cursor-move hover:bg-gray-50 ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
              
              <img
                src={getImageUrl(mapping)}
                alt={mapping.altText}
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-property.svg';
                }}
              />
              
              <div className="flex-1">
                <div className="font-medium">Image {mapping.order + 1}</div>
                <div className="text-sm text-gray-500">
                  ID: {mapping.imageId.substring(0, 8)}...
                </div>
                <div className="text-xs text-gray-400">
                  {mapping.originalFilename}
                </div>
              </div>
              
              <Input
                value={mapping.altText}
                onChange={(e) => {
                  const newMappings = [...mappings];
                  newMappings[index].altText = e.target.value;
                  setMappings(newMappings);
                }}
                placeholder="Alt text"
                className="w-48"
              />
              
              <Button
                onClick={() => handleDeleteImage(mapping.imageId)}
                variant="destructive"
                size="sm"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {mappings.length === 0 && !loading && (
          <div className="text-center p-8 text-gray-500">
            No images found. Upload some images to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
