import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface Property {
  id?: number;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  price: number;
  downPayment?: number;
  installmentAmount?: number;
  installmentPeriod?: string;
  isFullCash: boolean;
  propertyType: string;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
  builtUpArea?: number;
  plotSize?: number;
  gardenSize?: number;
  floor?: string;
  isGroundUnit: boolean;
  isFeatured: boolean;
  isNewListing: boolean;
  isHighlighted: boolean;
  projectName?: string;
  developerName?: string;
  yearBuilt?: number;
  images?: string[];
  references?: string;
}

interface PropertyFormProps {
  property?: Property;
  onSubmit: (property: Property) => void;
  onCancel: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Property>({
    title: property?.title || '',
    description: property?.description || '',
    address: property?.address || '',
    city: property?.city || '',
    state: property?.state || '',
    zipCode: property?.zipCode || '',
    country: property?.country || 'Egypt',
    price: property?.price || 0,
    downPayment: property?.downPayment || 0,
    installmentAmount: property?.installmentAmount || 0,
    installmentPeriod: property?.installmentPeriod || '',
    isFullCash: property?.isFullCash || false,
    propertyType: property?.propertyType || 'apartment',
    listingType: property?.listingType || 'Primary',
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    builtUpArea: property?.builtUpArea || 0,
    plotSize: property?.plotSize || 0,
    gardenSize: property?.gardenSize || 0,
    floor: property?.floor || '',
    isGroundUnit: property?.isGroundUnit || false,
    isFeatured: property?.isFeatured || false,
    isNewListing: property?.isNewListing || false,
    isHighlighted: property?.isHighlighted || false,
    projectName: property?.projectName || '',
    developerName: property?.developerName || '',
    yearBuilt: property?.yearBuilt || undefined,
    images: property?.images || [],
    references: property?.references || '',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]); // Added images state
  const [listing, setListing] = useState<{ id: number; images: string[] }>({ id: property?.id || 0, images: property?.images || [] }); // Added listing state

  const handleInputChange = (field: keyof Property, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 25 * 1024 * 1024; // 25MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Only image files under 25MB are allowed.');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

    // Handle image deletion
  const handleDeleteImage = async (imageToDelete: string, index: number) => {
    try {
      console.log('Deleting image:', imageToDelete, 'at index:', index);

      // Extract filename from image URL
      const filename = imageToDelete.split('/').pop() || imageToDelete;
      console.log('Extracted filename:', filename);

      const response = await fetch(`/api/properties/${listing.id}/photos/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete image');
      }

      const result = await response.json();
      console.log('Delete result:', result);

      // Update local state with remaining images from server
      const newImages = result.remainingImages || images.filter((_, i) => i !== index);
      setImages(newImages);

      // Also update the listing object
      setListing(prev => ({
        ...prev,
        images: newImages
      }));

      toast.success(`Image deleted successfully. ${result.totalImages} images remaining.`);
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.title?.trim()) {
        throw new Error("Title is required");
      }
      if (!formData.description?.trim()) {
        throw new Error("Description is required");
      }
      if (!formData.price || formData.price <= 0) {
        throw new Error("Price must be greater than 0");
      }
      if (!formData.city?.trim()) {
        throw new Error("City is required");
      }

      const processedData = {
        ...formData,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        builtUpArea: formData.builtUpArea ? Number(formData.builtUpArea) : undefined,
        plotSize: formData.plotSize ? Number(formData.plotSize) : undefined,
        downPayment: formData.downPayment ? Number(formData.downPayment) : undefined,
        installmentAmount: formData.installmentAmount ? Number(formData.installmentAmount) : undefined,
        yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
        images: uploadedImages,
        zipCode: formData.zipCode || '00000',
      };

      // Remove undefined values but keep empty strings for optional fields
      Object.keys(processedData).forEach(key => {
        if (processedData[key] === undefined) {
          delete processedData[key];
        }
      });

      console.log("Submitting property data:", processedData);

      const result = await onSubmit(processedData as Property);
      console.log("Form submission result:", result);

    } catch (error) {
      console.error("Form submission error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {property?.id ? 'Edit Property' : 'Add New Property'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="Enter property title"
              />
            </div>

            <div>
              <Label htmlFor="references">Reference Number</Label>
              <Input
                id="references"
                type="text"
                value={formData.references}
                onChange={(e) => handleInputChange('references', e.target.value)}
                placeholder="Property reference number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              rows={4}
              placeholder="Describe the property"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
                placeholder="City"
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="State/Province"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => handleInputChange('country', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Egypt">Egypt</SelectItem>
                  <SelectItem value="UAE">UAE</SelectItem>
                  <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) => handleInputChange('propertyType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="duplex">Duplex</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="chalet">Chalet</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="listingType">Listing Type</Label>
              <Select
                value={formData.listingType}
                onValueChange={(value) => handleInputChange('listingType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary">Primary</SelectItem>
                  <SelectItem value="Resale">Resale</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price and Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                required
                min="0"
                placeholder="Property price"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFullCash"
                checked={formData.isFullCash}
                onCheckedChange={(checked) => handleInputChange('isFullCash', checked)}
              />
              <Label htmlFor="isFullCash">Full Cash Payment</Label>
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                required
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                required
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="builtUpArea">Built-up Area (sqm)</Label>
              <Input
                id="builtUpArea"
                type="number"
                value={formData.builtUpArea}
                onChange={(e) => handleInputChange('builtUpArea', parseFloat(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          {/* Project Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                type="text"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                placeholder="Project/compound name"
              />
            </div>

            <div>
              <Label htmlFor="developerName">Developer</Label>
              <Input
                id="developerName"
                type="text"
                value={formData.developerName}
                onChange={(e) => handleInputChange('developerName', e.target.value)}
                placeholder="Developer/company name"
              />
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
              />
              <Label htmlFor="isFeatured">Featured Property</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNewListing"
                checked={formData.isNewListing}
                onCheckedChange={(checked) => handleInputChange('isNewListing', checked)}
              />
              <Label htmlFor="isNewListing">New Listing</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isHighlighted"
                checked={formData.isHighlighted}
                onCheckedChange={(checked) => handleInputChange('isHighlighted', checked)}
              />
              <Label htmlFor="isHighlighted">Highlighted</Label>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>Property Images</Label>

            {/* Existing Images */}
            {formData.images && formData.images.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Current Images</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Upload */}
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Select multiple images (max 25MB each)
                </p>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">New Images to Upload</h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (property?.id ? 'Updating...' : 'Creating...') 
                : (property?.id ? 'Update Property' : 'Create Property')
              }
            </Button>
          </div>
        </form>
                  {/* Existing Images */}
                  {images.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Uploaded Images</h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {images.map((image, index) => {
                    const imageUrl = typeof image === 'string' ? image : image.url || image.filename;
                    const displayUrl = imageUrl.startsWith('/') ? imageUrl : `/uploads/properties/${imageUrl}`;

                    return (
                      <div key={`${imageUrl}-${index}`} className="relative group">
                        <img 
                          src={displayUrl} 
                          alt={`Property ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-property.svg';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(imageUrl, index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Delete image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    );
                  })}
                      </div>
                    </div>
                  )}
      </CardContent>
    </Card>
  );
};

export default PropertyForm;