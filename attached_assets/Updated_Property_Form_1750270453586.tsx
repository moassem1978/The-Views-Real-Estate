
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUploader from './ImageUploader';
import { Switch } from '@/components/ui/switch';

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
    listingType: '',
    downPaymentPercent: '',
    downPaymentValue: '',
    quarterlyInstallments: '',
    gardenSize: '',
    highlight: false,
    featured: false
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
    const newForm = { ...formData, [field]: value };
    if (field === 'downPaymentPercent' && newForm.price) {
      newForm.downPaymentValue = ((parseFloat(newForm.price) || 0) * (parseFloat(value) || 0) / 100).toFixed(2);
    }
    setFormData(newForm);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || images.length === 0) {
      toast.error('Please fill in required fields and add at least one image');
      return;
    }

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      images.forEach((img) => submitData.append("images", img));

      const response = await fetch("/api/properties", {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        toast.success('Property added successfully!');
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
          listingType: '',
          downPaymentPercent: '',
          downPaymentValue: '',
          quarterlyInstallments: '',
          gardenSize: '',
          highlight: false,
          featured: false
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
          <div><Label>Property Title *</Label><Input value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} /></div>
          <div><Label>Price *</Label><Input value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} /></div>
          <div>
            <Label>Location *</Label>
            <Select value={formData.location} onValueChange={(v) => handleInputChange('location', v)}>
              <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Select --</SelectItem>
                <SelectItem value="Cairo">Cairo</SelectItem>
                <SelectItem value="Sheikh Zayed">Sheikh Zayed</SelectItem>
                <SelectItem value="North Coast">North Coast</SelectItem>
                <SelectItem value="Red Sea">Red Sea</SelectItem>
                <SelectItem value="Dubai">Dubai</SelectItem>
                <SelectItem value="London">London</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Unit Type *</Label>
            <Select value={formData.propertyType} onValueChange={(v) => handleInputChange('propertyType', v)}>
              <SelectTrigger><SelectValue placeholder="Select unit type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Select --</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Penthouse">Penthouse</SelectItem>
                <SelectItem value="Chalet">Chalet</SelectItem>
                <SelectItem value="Townhouse">Townhouse</SelectItem>
                <SelectItem value="Twinhouse">Twinhouse</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Mansion">Mansion</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Bedrooms</Label><Input value={formData.bedrooms} onChange={(e) => handleInputChange('bedrooms', e.target.value)} /></div>
          <div><Label>Bathrooms</Label><Input value={formData.bathrooms} onChange={(e) => handleInputChange('bathrooms', e.target.value)} /></div>
          <div><Label>Area (m²)</Label><Input value={formData.area} onChange={(e) => handleInputChange('area', e.target.value)} /></div>
          <div>
            <Label>Listing Type *</Label>
            <Select value={formData.listingType} onValueChange={(v) => handleInputChange('listingType', v)}>
              <SelectTrigger><SelectValue placeholder="Primary or Resale" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Select --</SelectItem>
                <SelectItem value="Primary">Primary</SelectItem>
                <SelectItem value="Resale">Resale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Down Payment (%)</Label><Input value={formData.downPaymentPercent} onChange={(e) => handleInputChange('downPaymentPercent', e.target.value)} /></div>
          <div><Label>Down Payment Value</Label><Input disabled value={formData.downPaymentValue} /></div>
          <div><Label>Quarterly Installments</Label><Input value={formData.quarterlyInstallments} onChange={(e) => handleInputChange('quarterlyInstallments', e.target.value)} /></div>
          {formData.propertyType === "Apartment" && (
            <div><Label>Garden Size (m²)</Label><Input value={formData.gardenSize} onChange={(e) => handleInputChange('gardenSize', e.target.value)} /></div>
          )}
        </div>
        <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} /></div>
        <ImageUploader images={images} onUpload={handleImageUpload} onDelete={handleImageDelete} />
        <div className="flex items-center gap-4">
          <Label>Highlight</Label><Switch checked={formData.highlight} onCheckedChange={(v) => handleInputChange('highlight', v ? 'true' : 'false')} />
          <Label>Featured</Label><Switch checked={formData.featured} onCheckedChange={(v) => handleInputChange('featured', v ? 'true' : 'false')} />
        </div>
        <Button onClick={handleSubmit}>Submit</Button>
      </CardContent>
    </Card>
  );
}
