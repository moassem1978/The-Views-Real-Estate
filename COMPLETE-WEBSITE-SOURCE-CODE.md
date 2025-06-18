# Complete Website Source Code - The Views Real Estate

## Enhanced Property Form Component

### client/src/components/dashboard/PropertyForm.tsx
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
        submitData.append(key, String(value));
      });
      images.forEach((img) => submitData.append("images", img));

      const response = await fetch("/api/properties", {
        method: "POST",
        body: submitData,
        credentials: "include",
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
        
        <div>
          <Label>Upload Images *</Label>
          <Input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                handleImageUpload(Array.from(files));
              }
            }}
          />
          <div className="grid grid-cols-3 gap-3 mt-3">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`preview-${index}`}
                  className="rounded-lg object-cover h-32 w-full"
                />
                <button
                  type="button"
                  onClick={() => handleImageDelete(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded hidden group-hover:block"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Label>Highlight</Label><Switch checked={formData.highlight} onCheckedChange={(v) => handleInputChange('highlight', v ? 'true' : 'false')} />
          <Label>Featured</Label><Switch checked={formData.featured} onCheckedChange={(v) => handleInputChange('featured', v ? 'true' : 'false')} />
        </div>
        <Button onClick={handleSubmit}>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## SEO-Optimized Homepage

### client/src/pages/Home.tsx
```tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HighlightsCarousel from "@/components/home/HighlightsCarousel";
import BrowsePropertiesSection from "@/components/home/BrowsePropertiesSection";
import Services from "@/components/home/Services";
import Testimonials from "@/components/home/Testimonials";
import ContactCTA from "@/components/home/ContactCTA";
import AnnouncementsSection from "@/components/home/AnnouncementsSection";
import PropertiesByType from "@/components/home/PropertiesByType";
import SEO from "@/components/SEO";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "The Views Real Estate",
    "url": "https://theviewsconsultancy.com",
    "logo": "https://theviewsconsultancy.com/logo.png",
    "telephone": "+20-106-311-1136",
    "email": "Sales@theviewsrealestate.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "New Cairo",
      "addressLocality": "Cairo",
      "addressCountry": "EG"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Cairo",
        "sameAs": "https://en.wikipedia.org/wiki/Cairo"
      },
      {
        "@type": "City", 
        "name": "North Coast",
        "sameAs": "https://en.wikipedia.org/wiki/North_Coast_(Egypt)"
      },
      {
        "@type": "City",
        "name": "New Administrative Capital",
        "sameAs": "https://en.wikipedia.org/wiki/New_Administrative_Capital"
      },
      {
        "@type": "City",
        "name": "Dubai",
        "sameAs": "https://en.wikipedia.org/wiki/Dubai"
      }
    ],
    "serviceType": [
      "Luxury property sales",
      "Property investment consultation",
      "Real estate portfolio management",
      "International property services"
    ],
    "priceRange": "Premium"
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="شقق للبيع في القاهرة الجديدة | Dubai Marina Luxury Apartments | Hassan Allam Properties | Mohamed Assem"
        description="شقق للبيع في القاهرة الجديدة, فيلات كمبوند للبيع, Dubai Marina luxury apartments for sale, Hassan Allam Swan Lake Resort properties, Binghatti Stars Business Bay. Expert real estate consultant Egypt Dubai with 30+ years experience."
        url="https://theviewsconsultancy.com/"
        structuredData={structuredData}
      />
      <Header />

      <main className="flex-grow">
        <h1 className="sr-only">Premium Real Estate Consultant Egypt Dubai - The Views Consultancy</h1>
        <HeroSection />
        <HighlightsCarousel />
        <BrowsePropertiesSection />
        <PropertiesByType />
        <AnnouncementsSection />
        <Services />
        <Testimonials />
        <ContactCTA />
      </main>

      <Footer />
    </div>
  );
}
```

## SEO Component

### client/src/components/SEO.tsx
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
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      
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
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="شقق للبيع في القاهرة الجديدة, فيلات كمبوند للبيع, عقارات بالتقسيط في مصر, أسعار العقارات في التجمع الخامس, أفضل وسيط عقاري في القاهرة, وسيط عقاري موثوق في مصر, premium real estate consultant Egypt Dubai, ultra-luxury property specialist, Dubai Marina property specialist, New Cairo compound expert, Hassan Allam Swan Lake Resort properties, Binghatti Stars Business Bay apartments" />
      
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="The Views Real Estate" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ar_EG" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      <meta name="author" content="The Views Real Estate" />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <link rel="canonical" href={url} />
      <meta name="language" content="en" />
      <meta name="geo.region" content="EG" />
      <meta name="geo.placename" content="Cairo" />
      <meta name="contact" content="Sales@theviewsrealestate.com" />
      <meta name="telephone" content="+20-106-311-1136" />
    </Helmet>
  );
}
```

## Theme Configuration

### theme.json
```json
{
  "primary": "#B45309",
  "variant": "professional", 
  "appearance": "light",
  "radius": 0.5
}
```

### tailwind.config.ts
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
          700: '#b45309',
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

## Package Configuration

### package.json
```json
{
  "name": "the-views-real-estate",
  "version": "1.0.0",
  "description": "Premium real estate platform for Egypt and Dubai",
  "type": "module",
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "tsc && vite build",
    "start": "node dist/server/index.js",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "@hookform/resolvers": "latest",
    "@neondatabase/serverless": "latest",
    "@radix-ui/react-accordion": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-switch": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-toast": "latest",
    "@tanstack/react-query": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "drizzle-orm": "latest",
    "drizzle-zod": "latest",
    "express": "latest",
    "express-session": "latest",
    "framer-motion": "latest",
    "lucide-react": "latest",
    "multer": "latest",
    "passport": "latest",
    "passport-local": "latest",
    "pg": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-helmet-async": "latest",
    "react-hook-form": "latest",
    "sonner": "latest",
    "tailwind-merge": "latest",
    "tailwindcss-animate": "latest",
    "wouter": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@types/express": "latest",
    "@types/express-session": "latest",
    "@types/multer": "latest",
    "@types/node": "latest",
    "@types/passport": "latest",
    "@types/passport-local": "latest",
    "@types/pg": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@vitejs/plugin-react": "latest",
    "autoprefixer": "latest",
    "drizzle-kit": "latest",
    "postcss": "latest",
    "tailwindcss": "latest",
    "tsx": "latest",
    "typescript": "latest",
    "vite": "latest"
  }
}
```

This markdown file contains all the essential code components for your enhanced real estate website. You can copy each section and create the corresponding files in your project structure.