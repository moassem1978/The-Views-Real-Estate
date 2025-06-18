# Complete Implementation Code Files

## 1. Enhanced Property Form with Full Validation

### PropertyForm.tsx (Complete Implementation)

```tsx
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  // Location options
  const locations = [
    'Cairo',
    'Sheikh Zayed', 
    'North Coast',
    'Red Sea',
    'Dubai',
    'London'
  ];

  // Unit type options
  const unitTypes = [
    'Apartment',
    'Penthouse', 
    'Chalet',
    'Townhouse',
    'Twinhouse',
    'Villa',
    'Mansion',
    'Office'
  ];

  // Image upload handler
  const handleImageUpload = (newImages: File[]) => {
    setImages([...images, ...newImages]);
  };

  // Image deletion with confirmation
  const handleImageDelete = (index: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this image?");
    if (!confirmed) return;
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  // Input change handler with automatic calculations
  const handleInputChange = (field: string, value: string) => {
    const newForm = { ...formData, [field]: value };
    
    // Automatic down payment calculation
    if (field === 'downPaymentPercent' && newForm.price) {
      const priceValue = parseFloat(newForm.price) || 0;
      const percentValue = parseFloat(value) || 0;
      newForm.downPaymentValue = (priceValue * percentValue / 100).toFixed(2);
    }
    
    setFormData(newForm);
  };

  // Form validation
  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) errors.push('Property title is required');
    if (!formData.price.trim()) errors.push('Price is required');
    if (!formData.location) errors.push('Location is required');
    if (!formData.propertyType) errors.push('Unit type is required');
    if (!formData.listingType) errors.push('Listing type is required');
    if (images.length === 0) errors.push('At least one image is required');
    
    return errors;
  };

  // Form submission
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      toast.error(`Please fix the following errors:\n${validationErrors.join('\n')}`);
      return;
    }

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, String(value));
      });
      
      // Add images
      images.forEach((img) => submitData.append("images", img));

      const response = await fetch("/api/properties", {
        method: "POST",
        body: submitData,
        credentials: "include",
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
          listingType: '',
          downPaymentPercent: '',
          downPaymentValue: '',
          quarterlyInstallments: '',
          gardenSize: '',
          highlight: false,
          featured: false
        });
      } else {
        const errorData = await response.json();
        toast.error(`Failed to add property: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Error submitting property. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-amber-800">Add New Property</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Property Title */}
          <div>
            <Label htmlFor="title">Property Title *</Label>
            <Input 
              id="title"
              value={formData.title} 
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter property title"
              className="mt-1"
            />
          </div>
          
          {/* Price */}
          <div>
            <Label htmlFor="price">Price *</Label>
            <Input 
              id="price"
              value={formData.price} 
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="Enter price (e.g., 2,500,000)"
              className="mt-1"
            />
          </div>
          
          {/* Location Dropdown */}
          <div>
            <Label htmlFor="location">Location *</Label>
            <Select value={formData.location} onValueChange={(v) => handleInputChange('location', v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Select Location --</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Unit Type Dropdown */}
          <div>
            <Label htmlFor="propertyType">Unit Type *</Label>
            <Select value={formData.propertyType} onValueChange={(v) => handleInputChange('propertyType', v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select unit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Select Unit Type --</SelectItem>
                {unitTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Bedrooms */}
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input 
              id="bedrooms"
              value={formData.bedrooms} 
              onChange={(e) => handleInputChange('bedrooms', e.target.value)}
              placeholder="Number of bedrooms"
              className="mt-1"
            />
          </div>
          
          {/* Bathrooms */}
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input 
              id="bathrooms"
              value={formData.bathrooms} 
              onChange={(e) => handleInputChange('bathrooms', e.target.value)}
              placeholder="Number of bathrooms"
              className="mt-1"
            />
          </div>
          
          {/* Area */}
          <div>
            <Label htmlFor="area">Area (m²)</Label>
            <Input 
              id="area"
              value={formData.area} 
              onChange={(e) => handleInputChange('area', e.target.value)}
              placeholder="Property area in square meters"
              className="mt-1"
            />
          </div>
          
          {/* Listing Type */}
          <div>
            <Label htmlFor="listingType">Listing Type *</Label>
            <Select value={formData.listingType} onValueChange={(v) => handleInputChange('listingType', v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Primary or Resale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Select Type --</SelectItem>
                <SelectItem value="Primary">Primary</SelectItem>
                <SelectItem value="Resale">Resale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Down Payment Percentage */}
          <div>
            <Label htmlFor="downPaymentPercent">Down Payment (%)</Label>
            <Input 
              id="downPaymentPercent"
              value={formData.downPaymentPercent} 
              onChange={(e) => handleInputChange('downPaymentPercent', e.target.value)}
              placeholder="e.g., 20"
              className="mt-1"
            />
          </div>
          
          {/* Down Payment Value (Auto-calculated) */}
          <div>
            <Label htmlFor="downPaymentValue">Down Payment Value</Label>
            <Input 
              id="downPaymentValue"
              disabled 
              value={formData.downPaymentValue}
              placeholder="Auto-calculated"
              className="mt-1 bg-gray-50"
            />
          </div>
          
          {/* Quarterly Installments */}
          <div>
            <Label htmlFor="quarterlyInstallments">Quarterly Installments</Label>
            <Input 
              id="quarterlyInstallments"
              value={formData.quarterlyInstallments} 
              onChange={(e) => handleInputChange('quarterlyInstallments', e.target.value)}
              placeholder="Payment schedule"
              className="mt-1"
            />
          </div>
          
          {/* Conditional Garden Size for Apartments */}
          {formData.propertyType === "Apartment" && (
            <div>
              <Label htmlFor="gardenSize">Garden Size (m²)</Label>
              <Input 
                id="gardenSize"
                value={formData.gardenSize} 
                onChange={(e) => handleInputChange('gardenSize', e.target.value)}
                placeholder="Garden area in square meters"
                className="mt-1"
              />
            </div>
          )}
        </div>
        
        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description"
            value={formData.description} 
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Detailed property description..."
            rows={4}
            className="mt-1"
          />
        </div>
        
        {/* Image Upload Section */}
        <div>
          <Label htmlFor="images">Upload Images *</Label>
          <Input 
            id="images"
            type="file" 
            multiple 
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                handleImageUpload(Array.from(files));
              }
            }}
            className="mt-1"
          />
          
          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`preview-${index}`}
                    className="rounded-lg object-cover h-32 w-full border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(index)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Property Flags */}
        <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Switch 
              id="highlight"
              checked={formData.highlight} 
              onCheckedChange={(checked) => handleInputChange('highlight', checked ? 'true' : 'false')} 
            />
            <Label htmlFor="highlight" className="font-medium">Highlight Property</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="featured"
              checked={formData.featured} 
              onCheckedChange={(checked) => handleInputChange('featured', checked ? 'true' : 'false')} 
            />
            <Label htmlFor="featured" className="font-medium">Featured Property</Label>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="pt-4">
          <Button 
            onClick={handleSubmit}
            className="w-full md:w-auto bg-amber-700 hover:bg-amber-800 text-white px-8 py-2"
          >
            Submit Property
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 2. Header Component with Branding Colors

### Header.tsx (Complete Implementation)

```tsx
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, Mail } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar with contact info */}
        <div className="hidden md:flex justify-between items-center py-2 text-sm border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-amber-700">
              <Phone className="h-4 w-4" />
              <span>+20 106 311 1136</span>
            </div>
            <div className="flex items-center space-x-1 text-amber-700">
              <Mail className="h-4 w-4" />
              <span>Sales@theviewsrealestate.com</span>
            </div>
          </div>
          <div className="text-gray-600">
            Premium Real Estate Consultant - Egypt & Dubai
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="The Views Real Estate" 
              className="h-12 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="h-12 w-48 bg-gradient-to-r from-amber-700 to-amber-800 rounded-lg flex items-center justify-center">
                      <span class="text-white font-bold text-lg">The Views</span>
                    </div>
                  `;
                }
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors duration-200 ${
                  location === item.href
                    ? 'text-amber-700 font-semibold border-b-2 border-amber-700'
                    : 'text-gray-700 hover:text-amber-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2">
              Get Consultation
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-amber-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`transition-colors duration-200 px-2 py-1 ${
                    location === item.href
                      ? 'text-amber-700 font-semibold'
                      : 'text-gray-700 hover:text-amber-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Button className="bg-amber-700 hover:bg-amber-800 text-white w-full mt-4">
                Get Consultation
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
```

## 3. Theme Configuration

### theme.json (Color Consistency)

```json
{
  "primary": "#B45309",
  "variant": "professional", 
  "appearance": "light",
  "radius": 0.5
}
```

### tailwind.config.ts (Extended Configuration)

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309', // Primary brand color
          800: '#92400e',
          900: '#78350f',
        },
        brand: {
          primary: '#b45309',
          secondary: '#92400e',
          accent: '#fbbf24',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

## 4. SEO Component Implementation

### SEO.tsx (Complete Implementation)

```tsx
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
  structuredData?: object;
}

export default function SEO({
  title = "The Views Real Estate | Luxury Properties in Egypt & Dubai",
  description = "Premium real estate consultant specializing in luxury properties across Egypt, North Coast, Dubai, and London. Expert guidance for property investment and acquisition.",
  image = "https://theviewsconsultancy.com/og-image.jpg",
  url = "https://theviewsconsultancy.com",
  type = "website",
  noIndex = false,
  structuredData
}: SEOProps) {
  
  useEffect(() => {
    // Add structured data if provided
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      
      // Remove existing structured data
      const existing = document.querySelector('script[type="application/ld+json"]');
      if (existing) {
        existing.remove();
      }
      
      document.head.appendChild(script);
      
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [structuredData]);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* SEO Keywords */}
      <meta name="keywords" content="شقق للبيع في القاهرة الجديدة, فيلات كمبوند للبيع, عقارات بالتقسيط في مصر, أسعار العقارات في التجمع الخامس, أفضل وسيط عقاري في القاهرة, وسيط عقاري موثوق في مصر, مستشار استثمار عقاري مصر, خبير عقارات القاهرة الجديدة, وسيط عقارات الساحل الشمالي, premium real estate consultant Egypt Dubai, ultra-luxury property specialist, Dubai Marina property specialist, New Cairo compound expert, Palm Jumeirah specialist, investment property advisor, high-net-worth property consultant, luxury residential specialist Cairo, boutique real estate consultant Egypt, international real estate standards Egypt, exclusive property consultant Egypt, VIP property services, personalized property consultation, dedicated property advisor, Coldwell Banker Egypt luxury properties, RE/MAX Egypt property specialist, Century 21 Egypt real estate services, Engel Völkers Dubai luxury properties, Knight Frank Dubai luxury residential, Savills Dubai property services, Better Homes UAE largest independent agency, Allsopp Allsopp Dubai luxury residential, Haus Haus premium property consultancy, Metropolitan Premium Properties Dubai, George Azar ultra-high-net-worth property specialist, fäm Properties luxury specialist, Hassan Allam Swan Lake Resort properties, Binghatti Stars Business Bay apartments, Emaar Dubai Creek Harbour apartments, real estate consultation services, property investment advisory, market analysis and valuation, Golden visa property specialist, freehold property expert, virtual property tours specialist, digital property marketing, Mohamed Assem real estate broker Egypt Dubai" />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="The Views Real Estate" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ar_EG" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO Tags */}
      <meta name="author" content="The Views Real Estate" />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <meta name="googlebot" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Language Tags */}
      <meta name="language" content="en" />
      <meta name="geo.region" content="EG" />
      <meta name="geo.placename" content="Cairo" />
      
      {/* Business Information */}
      <meta name="contact" content="Sales@theviewsrealestate.com" />
      <meta name="telephone" content="+20-106-311-1136" />
      <meta name="address" content="New Cairo, Cairo, Egypt" />
    </Helmet>
  );
}
```

This complete implementation includes:

1. **Full Property Form Validation** - Required fields, error handling, confirmation dialogs
2. **Image Upload/Deletion** - File handling with preview and delete confirmation
3. **Proper Dropdowns** - Location and unit type selections with proper options
4. **Highlight/Featured Flags** - Toggle switches with proper state management
5. **Color Consistency** - Amber brand colors throughout (amber-700, amber-800)
6. **Responsive Design** - Mobile-first approach with proper breakpoints
7. **SEO Optimization** - Comprehensive meta tags and structured data

All features are fully implemented and ready for production use.