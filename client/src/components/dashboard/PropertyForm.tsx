import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUploader from './ImageUploader';

export default function PropertyForm() {
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    listingType: 'Primary'
  });

  const handleImageUpload = (newImages: File[]) => {
    setImages([...images, ...newImages]);
  };

  const handleImageDelete = (index: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this image?");
    if (!confirmed) return;
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || images.length === 0) {
      toast.error('Please fill in required fields and add at least one image');
      return;
    }

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      // Add images
      images.forEach((img) => submitData.append("images", img));
      
      const response = await fetch("/api/properties", {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        toast.success('Property added successfully!');
        // Reset form
        setImages([]);
        setFormData({
          title: '',
          description: '',
          price: '',
          location: '',
          propertyType: '',
          bedrooms: '',
          bathrooms: '',
          area: '',
          listingType: 'Primary'
        });
      } else {
        toast.error('Failed to add property');
      }
    } catch (error) {
      toast.error('Error submitting property');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-amber-800">Add New Property</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Property Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter property title"
            />
          </div>
          
          <div>
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="Enter price"
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter location"
            />
          </div>
          
          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <Select onValueChange={(value) => handleInputChange('propertyType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              value={formData.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', e.target.value)}
              placeholder="Number of bedrooms"
            />
          </div>
          
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              value={formData.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', e.target.value)}
              placeholder="Number of bathrooms"
            />
          </div>
          
          <div>
            <Label htmlFor="area">Area (sqm)</Label>
            <Input
              id="area"
              value={formData.area}
              onChange={(e) => handleInputChange('area', e.target.value)}
              placeholder="Property area"
            />
          </div>
          
          <div>
            <Label htmlFor="listingType">Listing Type</Label>
            <Select onValueChange={(value) => handleInputChange('listingType', value)} defaultValue="Primary">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Primary">Primary</SelectItem>
                <SelectItem value="Resale">Resale</SelectItem>
              </SelectContent>
            </Select>
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
          />
        </div>
        
        <div>
          <Label>Property Images *</Label>
          <ImageUploader 
            images={images} 
            onUpload={handleImageUpload} 
            onDelete={handleImageDelete} 
          />
        </div>
        
        <Button 
          onClick={handleSubmit} 
          className="w-full bg-amber-700 hover:bg-amber-800 text-white"
          size="lg"
        >
          Submit Property
        </Button>
      </CardContent>
    </Card>
  );
}