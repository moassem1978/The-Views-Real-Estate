import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Property } from "../types";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
      // In a real application, this would upload to a server or cloud storage
      // For this demo, we'll just return a success message
      return { success: true, message: "Logo uploaded successfully" };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
      setLogoFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
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
    
    if (isEditing && currentPropertyId) {
      updateProperty.mutate({ id: currentPropertyId, property: formData });
    } else {
      createProperty.mutate(formData);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
              <CardTitle>Dashboard Settings</CardTitle>
              <CardDescription>
                Manage your dashboard preferences and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Account Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your account details and preferences
                  </p>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="name">Account Name</label>
                    <Input id="name" value="Admin" readOnly />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="email">Email Address</label>
                    <Input id="email" value="admin@theviewsrealestate.com" readOnly />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" disabled>
                Save Changes
              </Button>
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
              Fill in the property details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label htmlFor="propertyType" className="text-sm font-medium">Property Type</label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => handleSelectChange("propertyType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Condo">Condo</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                    <SelectItem value="Mansion">Mansion</SelectItem>
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
              
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">Address</label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium">City</label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-medium">State</label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="zipCode" className="text-sm font-medium">Zip Code</label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">Price ($)</label>
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
                <label htmlFor="squareFeet" className="text-sm font-medium">Square Feet</label>
                <Input
                  id="squareFeet"
                  name="squareFeet"
                  type="number"
                  value={formData.squareFeet.toString()}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="bedrooms" className="text-sm font-medium">Bedrooms</label>
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
                <label htmlFor="bathrooms" className="text-sm font-medium">Bathrooms</label>
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
                <label htmlFor="yearBuilt" className="text-sm font-medium">Year Built</label>
                <Input
                  id="yearBuilt"
                  name="yearBuilt"
                  type="number"
                  value={formData.yearBuilt.toString()}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="views" className="text-sm font-medium">Views</label>
                <Input
                  id="views"
                  name="views"
                  value={formData.views}
                  onChange={handleInputChange}
                  placeholder="e.g. Ocean, Mountain, City"
                />
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
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="amenities" className="text-sm font-medium">
                  Amenities (comma separated)
                </label>
                <Input
                  id="amenities"
                  name="amenities"
                  value={formData.amenities.join(", ")}
                  onChange={handleInputChange}
                  placeholder="Pool, Garage, Garden, etc."
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="images" className="text-sm font-medium">
                  Images (comma separated URLs)
                </label>
                <Textarea
                  id="images"
                  name="images"
                  value={formData.images.join(", ")}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  required
                />
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
                  Select Logo
                </label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  required
                />
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