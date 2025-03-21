import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Property } from "../types";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PropertyImage {
  file: File;
  preview: string;
}
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Define the SiteSettings interface
interface SiteSettings {
  companyName: string;
  companyLogo?: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

// CompanyLogo component to display the current logo or a placeholder
function CompanyLogo() {
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
  });
  
  if (isLoading) {
    return <Skeleton className="w-32 h-32" />;
  }
  
  if (settings?.companyLogo) {
    return (
      <img 
        src={settings.companyLogo} 
        alt={`${settings.companyName} logo`} 
        className="max-w-full max-h-full object-contain"
      />
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 text-gray-400">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-10 w-10 mb-2"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
      <span className="text-sm">No logo uploaded</span>
    </div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("properties");
  const [propertyFormOpen, setPropertyFormOpen] = useState(false);
  const [logoFormOpen, setLogoFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPropertyId, setCurrentPropertyId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    propertyType: "House",
    isFeatured: false,
    isNewListing: true,
    yearBuilt: 0,
    views: "",
    amenities: [] as string[],
    images: [] as string[],
    latitude: 0,
    longitude: 0,
    agentId: 1
  });

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Property images state
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  
  // Fetch properties
  const { data: properties, isLoading } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    }
  });

  // Create property mutation
  const createProperty = useMutation({
    mutationFn: async (newProperty: any) => {
      const response = await apiRequest('POST', '/api/properties', newProperty);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Success",
        description: "Property created successfully",
      });
      setPropertyFormOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating property:", error);
    }
  });

  // Update property mutation
  const updateProperty = useMutation({
    mutationFn: async ({ id, property }: { id: number; property: any }) => {
      const response = await apiRequest('PUT', `/api/properties/${id}`, property);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      setPropertyFormOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating property:", error);
    }
  });

  // Delete property mutation
  const deleteProperty = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/properties/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting property:", error);
    }
  });

  // Upload logo mutation
  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      try {
        // Create a simple FormData object
        const formData = new FormData();
        formData.append('logo', file);
        
        console.log('Starting direct logo upload with fetch API');
        console.log('File details:', file.name, file.type, `${(file.size / 1024).toFixed(2)}KB`);
        
        // Use fetch API for simplicity
        const response = await fetch('/api/upload/logo', {
          method: 'POST',
          body: formData,
          // Important: Do not set Content-Type header, browser will set it with boundary
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed with status:', response.status);
          console.error('Error response:', errorText);
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Logo upload successful:', data);
        return data;
      } catch (err) {
        console.error('Logo upload error:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
      console.log('Logo upload successful:', data);
      setLogoFormOpen(false);
      setLogoFile(null);
      setLogoPreview(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload logo. Please try again with a smaller file or different format.",
        variant: "destructive",
      });
      console.error("Error uploading logo:", error);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'amenities') {
      setFormData(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
    } else if (name === 'images') {
      setFormData(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "propertyType") {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (name === "isFeatured" || name === "isNewListing") {
      setFormData(prev => ({ ...prev, [name]: value === "true" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make sure the form data is complete
    const currentDate = new Date().toISOString();
    
    // Ensure amenities and images are arrays
    const propertyData = {
      ...formData,
      amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
      images: Array.isArray(formData.images) ? formData.images : [],
      createdAt: currentDate
    };
    
    console.log('Submitting property data:', propertyData);
    
    if (isEditing && currentPropertyId) {
      updateProperty.mutate({ id: currentPropertyId, property: propertyData });
    } else {
      createProperty.mutate(propertyData);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log(`Selected logo file: ${file.name}, type: ${file.type}, size: ${(file.size / 1024).toFixed(2)}KB`);
      
      setLogoFile(file);
      
      // For Adobe Illustrator files, show a placeholder preview
      if (file.name.toLowerCase().endsWith('.ai') || 
          file.type === 'application/postscript' || 
          file.type === 'application/illustrator') {
        console.log('Adobe Illustrator file detected, using placeholder preview');
        // Use a placeholder image for AI files since browsers can't preview them
        setLogoPreview('/uploads/ai-placeholder.svg');
        toast({
          title: "Adobe Illustrator file selected",
          description: "Preview not available, but file will upload correctly.",
        });
      } else {
        // Create preview for regular image files
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleLogoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (logoFile) {
      uploadLogo.mutate(logoFile);
    }
  };

  const handleEditProperty = (property: Property) => {
    setFormData({
      title: property.title,
      description: property.description,
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFeet: property.squareFeet,
      propertyType: property.propertyType,
      isFeatured: property.isFeatured,
      isNewListing: property.isNewListing,
      yearBuilt: property.yearBuilt || 0,
      views: property.views || "",
      amenities: property.amenities,
      images: property.images,
      latitude: property.latitude || 0,
      longitude: property.longitude || 0,
      agentId: property.agentId
    });
    setIsEditing(true);
    setCurrentPropertyId(property.id);
    setPropertyFormOpen(true);
  };

  const handleDeleteProperty = (id: number) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      deleteProperty.mutate(id);
    }
  };

  // Property images upload mutation
  const uploadPropertyImages = useMutation({
    mutationFn: async (files: File[]) => {
      try {
        // Create a simple FormData object
        const formData = new FormData();
        
        // Add each file directly to the FormData
        files.forEach(file => {
          formData.append('images', file);
          console.log(`Adding file to upload: ${file.name} (${file.type})`);
        });
        
        console.log('Uploading property images:', files.length, 'files');
        
        // Use fetch API for simplicity
        const response = await fetch('/api/upload/property-images', {
          method: 'POST',
          body: formData,
          // Important: Do not set Content-Type header, browser will set it with boundary
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Property images upload failed with status:', response.status);
          console.error('Error response:', errorText);
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Property images upload successful:', data);
        return data;
      } catch (err) {
        console.error('Property images upload error:', err);
        throw err;
      }
    },
    onSuccess: (data: any) => {
      // Add the uploaded image URLs to form data
      const newImageUrls = data.imageUrls || [];
      if (newImageUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImageUrls]
        }));
        
        toast({
          title: "Success",
          description: `${newImageUrls.length} image(s) uploaded successfully`,
        });
        
        // Clear the property images state
        setPropertyImages([]);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload images. Please try again with smaller files or different formats.",
        variant: "destructive",
      });
      console.error("Error uploading property images:", error);
    }
  });
  
  const handlePropertyImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: PropertyImage[] = [];
      const totalFiles = e.target.files.length;
      let processedFiles = 0;
      
      Array.from(e.target.files).forEach(file => {
        // Check if it's an Adobe Illustrator file
        if (file.name.toLowerCase().endsWith('.ai') || 
            file.type === 'application/postscript' || 
            file.type === 'application/illustrator') {
          console.log('AI file detected for property image, using placeholder');
          
          // Use placeholder for AI files
          newImages.push({
            file,
            preview: '/uploads/ai-placeholder.svg'
          });
          
          processedFiles++;
          if (processedFiles === totalFiles) {
            setPropertyImages(prev => [...prev, ...newImages]);
          }
        } else {
          // Create preview for regular image files
          const reader = new FileReader();
          reader.onloadend = () => {
            newImages.push({
              file,
              preview: reader.result as string
            });
            
            processedFiles++;
            if (processedFiles === totalFiles) {
              setPropertyImages(prev => [...prev, ...newImages]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };
  
  const handleUploadPropertyImages = () => {
    if (propertyImages.length > 0) {
      uploadPropertyImages.mutate(propertyImages.map(img => img.file));
    }
  };
  
  const removePropertyImage = (index: number) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      propertyType: "House",
      isFeatured: false,
      isNewListing: true,
      yearBuilt: 0,
      views: "",
      amenities: [],
      images: [],
      latitude: 0,
      longitude: 0,
      agentId: 1
    });
    setIsEditing(false);
    setCurrentPropertyId(null);
    setPropertyImages([]);
  };

  const openPropertyForm = () => {
    resetForm();
    setPropertyFormOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex space-x-3">
          <Button onClick={() => setLogoFormOpen(true)} variant="outline">
            Upload Logo
          </Button>
          <Link href="/">
            <Button variant="outline">Back to Website</Button>
          </Link>
        </div>
      </div>

      <Tabs 
        defaultValue="properties" 
        className="w-full" 
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Manage Properties</h2>
            <Button onClick={openPropertyForm}>Add New Property</Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties?.map((property: Property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.title}</TableCell>
                      <TableCell>{formatPrice(property.price)}</TableCell>
                      <TableCell>{property.city}, {property.state}</TableCell>
                      <TableCell>{property.propertyType}</TableCell>
                      <TableCell>{property.isFeatured ? "Yes" : "No"}</TableCell>
                      <TableCell className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditProperty(property)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
              <CardDescription>
                Manage your company information and branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Company Logo */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Company Logo</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-40 h-40 border rounded-md flex items-center justify-center overflow-hidden bg-gray-50">
                      {/* Logo Preview */}
                      <CompanyLogo />
                    </div>
                    <Button onClick={() => setLogoFormOpen(true)}>
                      Change Logo
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Account Information</h3>
                  
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="companyName">Company Name</label>
                      <Input id="companyName" value="The Views Real Estate" readOnly />
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="email">Contact Email</label>
                      <Input id="email" value="info@theviewsrealestate.com" readOnly />
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="phone">Contact Phone</label>
                      <Input id="phone" value="1-800-555-VIEWS" readOnly />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t">
              <p className="text-sm text-muted-foreground mr-auto">
                Note: Additional settings can be configured by your system administrator.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Property Form Dialog */}
      <Dialog open={propertyFormOpen} onOpenChange={setPropertyFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Property" : "Add New Property"}
            </DialogTitle>
            <DialogDescription>
              Fill in the property details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="propertyType" className="text-sm font-medium flex items-center">
                  Property Type
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => handleSelectChange("propertyType", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                    <SelectItem value="Duplex">Duplex</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Chalet">Chalet</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>
              
              <div className="md:col-span-2 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-medium mb-3 text-amber-800">Location Information (Egypt)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium flex items-center">
                      City
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cairo">Cairo</SelectItem>
                        <SelectItem value="Alexandria">Alexandria</SelectItem>
                        <SelectItem value="Giza">Giza</SelectItem>
                        <SelectItem value="Sharm El Sheikh">Sharm El Sheikh</SelectItem>
                        <SelectItem value="Hurghada">Hurghada</SelectItem>
                        <SelectItem value="El Gouna">El Gouna</SelectItem>
                        <SelectItem value="New Cairo">New Cairo</SelectItem>
                        <SelectItem value="6th of October">6th of October</SelectItem>
                        <SelectItem value="Maadi">Maadi</SelectItem>
                        <SelectItem value="Zamalek">Zamalek</SelectItem>
                        <SelectItem value="North Coast">North Coast</SelectItem>
                        <SelectItem value="Luxor">Luxor</SelectItem>
                        <SelectItem value="Aswan">Aswan</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="state" className="text-sm font-medium">District/Governorate</label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium flex items-center">
                      Address/Location
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="zipCode" className="text-sm font-medium">Postal Code</label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium mb-3 text-blue-800">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium flex items-center">
                      Price (EGP)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price.toString()}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="squareFeet" className="text-sm font-medium flex items-center">
                      Square Meters
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      id="squareFeet"
                      name="squareFeet"
                      type="number"
                      value={formData.squareFeet.toString()}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="text-xs text-gray-500">Property size in m²</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="yearBuilt" className="text-sm font-medium">Year Built</label>
                    <Input
                      id="yearBuilt"
                      name="yearBuilt"
                      type="number"
                      value={formData.yearBuilt?.toString() || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="bedrooms" className="text-sm font-medium flex items-center">
                      Bedrooms
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      value={formData.bedrooms.toString()}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="bathrooms" className="text-sm font-medium flex items-center">
                      Bathrooms
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      value={formData.bathrooms.toString()}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="views" className="text-sm font-medium">Property View</label>
                    <Select
                      value={formData.views || ""}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, views: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select view type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Garden View">Garden View</SelectItem>
                        <SelectItem value="Sea View">Sea View</SelectItem>
                        <SelectItem value="Nile View">Nile View</SelectItem>
                        <SelectItem value="City View">City View</SelectItem>
                        <SelectItem value="Pool View">Pool View</SelectItem>
                        <SelectItem value="Landmark View">Landmark View</SelectItem>
                        <SelectItem value="Mountain View">Mountain View</SelectItem>
                        <SelectItem value="Desert View">Desert View</SelectItem>
                        <SelectItem value="Golf View">Golf View</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="isFeatured" className="text-sm font-medium">Featured Listing</label>
                <Select
                  value={formData.isFeatured ? "true" : "false"}
                  onValueChange={(value) => handleSelectChange("isFeatured", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Is this a featured listing?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="isNewListing" className="text-sm font-medium">New Listing</label>
                <Select
                  value={formData.isNewListing ? "true" : "false"}
                  onValueChange={(value) => handleSelectChange("isNewListing", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Is this a new listing?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <label htmlFor="amenities" className="text-sm font-medium">
                    Amenities (comma separated)
                  </label>
                  <Textarea
                    id="amenities"
                    name="amenities"
                    value={formData.amenities.join(", ")}
                    onChange={handleInputChange}
                    placeholder="Swimming Pool, Security, Parking, Gym, etc."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">
                    Property Images
                  </label>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('propertyImagesUpload')?.click()}
                  >
                    Upload New Images
                  </Button>
                  
                  <input 
                    type="file"
                    id="propertyImagesUpload"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePropertyImagesChange}
                  />
                </div>
                
                <div className="border rounded-md p-3">
                  {/* Selected images pending upload */}
                  {propertyImages.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-blue-700">Selected Images</h4>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setPropertyImages([])}
                          >
                            Clear All
                          </Button>
                          <Button 
                            type="button" 
                            size="sm" 
                            onClick={handleUploadPropertyImages}
                            disabled={uploadPropertyImages.isPending}
                          >
                            {uploadPropertyImages.isPending ? 'Uploading...' : 'Upload Selected'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {propertyImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <div className="h-24 rounded overflow-hidden border border-gray-200">
                              <img 
                                src={img.preview} 
                                alt={`Preview ${idx+1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removePropertyImage(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-80 hover:opacity-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {img.file.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                
                  <div className="space-y-2">
                    <label htmlFor="images" className="text-sm font-medium">
                      Image URLs (comma separated)
                    </label>
                    <Input
                      id="images"
                      name="images"
                      value={formData.images.join(", ")}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-gray-500">Enter URLs for property images or use the upload button above</p>
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-blue-700 mb-2">Current Property Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative group h-24 rounded overflow-hidden border">
                            <img 
                              src={img} 
                              alt={`Property ${idx+1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Image+Not+Found';
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = [...formData.images];
                                  newImages.splice(idx, 1);
                                  setFormData(prev => ({ ...prev, images: newImages }));
                                }}
                                className="bg-red-500 text-white rounded-full p-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2 mt-2">
                <p className="text-sm text-red-500">* Required fields</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setPropertyFormOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Property" : "Add Property"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Logo Upload Dialog */}
      <Dialog open={logoFormOpen} onOpenChange={setLogoFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Company Logo</DialogTitle>
            <DialogDescription>
              Upload your logo to be displayed on the website
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogoSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="logo" className="text-sm font-medium">
                  Select Logo (Any Image Format)
                </label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*,.ai,application/postscript,application/illustrator"
                  onChange={handleLogoChange}
                  required
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF, SVG, WebP, Adobe Illustrator (.ai) and other image types.
                  File size limit: 15MB.
                </p>
              </div>
              
              {logoPreview && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Preview:</h3>
                  <div className="w-40 h-40 relative rounded border border-gray-200 overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setLogoFormOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!logoFile}>
                Upload Logo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}