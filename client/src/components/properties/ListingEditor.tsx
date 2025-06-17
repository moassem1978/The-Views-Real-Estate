
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Trash2, 
  Upload, 
  X, 
  Image as ImageIcon,
  Edit3,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PhotoManager from './PhotoManager';

interface PhotoData {
  filename: string;
  originalName?: string;
  altText: string;
  uploadedAt?: string;
  fileSize?: number;
  mimeType?: string;
  order: number;
  url?: string;
}

interface ListingProps {
  id: number;
  title: string;
  description: string;
  price: number;
  photos: string[] | PhotoData[]; // Support both legacy and new format
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface ListingEditorProps {
  listing: ListingProps;
  onSave?: (updatedListing: Partial<ListingProps>) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

const ListingEditor: React.FC<ListingEditorProps> = ({ 
  listing, 
  onSave, 
  onCancel,
  disabled = false 
}) => {
  const [formData, setFormData] = useState({
    title: listing.title,
    description: listing.description,
    price: listing.price,
    propertyType: listing.propertyType || '',
    bedrooms: listing.bedrooms || 0,
    bathrooms: listing.bathrooms || 0,
    address: listing.address || '',
    city: listing.city || '',
    state: listing.state || '',
    country: listing.country || '',
  });

  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  // Convert legacy photos format to PhotoData format
  useEffect(() => {
    if (listing.photos && listing.photos.length > 0) {
      const convertedPhotos: PhotoData[] = listing.photos.map((photo, index) => {
        if (typeof photo === 'string') {
          // Legacy format - just filename or URL
          const filename = photo.includes('/') ? photo.split('/').pop() || photo : photo;
          return {
            filename,
            altText: `${listing.title} - Image ${index + 1}`,
            order: index,
            url: photo.startsWith('/') ? photo : `/uploads/properties/${filename}`
          };
        } else {
          // New PhotoData format
          return {
            ...photo,
            url: photo.url || `/uploads/properties/${photo.filename}`
          };
        }
      });
      setPhotos(convertedPhotos);
    }
  }, [listing.photos, listing.title]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotosChange = (updatedPhotos: PhotoData[]) => {
    setPhotos(updatedPhotos);
  };

  const openImagePreview = (photoUrl: string) => {
    setPreviewImage(photoUrl);
    setShowPreview(true);
  };

  const closeImagePreview = () => {
    setShowPreview(false);
    setPreviewImage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disabled) return;

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        photos: JSON.stringify(photos.map(photo => ({
          filename: photo.filename,
          altText: photo.altText,
          order: photo.order,
          url: photo.url
        })))
      };

      const response = await fetch(`/api/properties/${listing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Listing updated",
          description: "Your property listing has been updated successfully"
        });

        if (onSave) {
          onSave({ ...formData, photos });
        }
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Listing: {listing.title}
            <Badge variant="outline">ID: {listing.id}</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Property Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter property title"
                  disabled={disabled}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="Enter price"
                  disabled={disabled}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter property description"
                rows={4}
                disabled={disabled}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Input
                  id="propertyType"
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  placeholder="e.g., apartment, villa"
                  disabled={disabled}
                />
              </div>
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                  placeholder="Number of bedrooms"
                  disabled={disabled}
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                  placeholder="Number of bathrooms"
                  disabled={disabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter street address"
                  disabled={disabled}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state or province"
                  disabled={disabled}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Enter country"
                  disabled={disabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Management */}
        <PhotoManager
          propertyId={listing.id}
          initialPhotos={photos}
          onPhotosChange={handlePhotosChange}
          disabled={disabled}
          maxPhotos={20}
        />

        {/* Photo Preview Grid */}
        {photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Current Photos
                <Badge variant="outline">{photos.length} photos</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {photos.map((photo, index) => (
                  <div key={photo.filename} className="relative group">
                    <div 
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImagePreview(photo.url || `/uploads/properties/${photo.filename}`)}
                    >
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
                    <Badge variant="secondary" className="absolute top-1 left-1 text-xs">
                      {index + 1}
                    </Badge>
                    <div className="absolute bottom-1 left-1 right-1">
                      <p className="text-xs text-white bg-black bg-opacity-50 px-1 py-0.5 rounded truncate">
                        {photo.altText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-end">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={disabled || isLoading}
                className="min-w-32"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Image Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-4xl max-h-4xl p-4">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={closeImagePreview}
            >
              <X className="h-4 w-4" />
            </Button>
            <img loading="lazy"
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No photos available for this listing. Use the Photo Management section above to add photos.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ListingEditor;
