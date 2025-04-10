import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Property, Announcement } from "../types";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("properties");
  const [propertyFormOpen, setPropertyFormOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Add New Property");
  const [logoFormOpen, setLogoFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPropertyId, setCurrentPropertyId] = useState<number | null>(null);

  // Announcement-related state
  const [announcementFormOpen, setAnnouncementFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState<number | null>(null);
  const [announcementImage, setAnnouncementImage] = useState<File | null>(null);
  const [announcementImagePreview, setAnnouncementImagePreview] = useState<string | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    imageUrl: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    isActive: true,
    isHighlighted: false
  });

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "", // Added zip code field to match the schema requirement
    price: 0,
    downPayment: 0,
    installmentAmount: 0,
    installmentPeriod: 0,
    isFullCash: false,
    listingType: "Primary", // Required field "Primary" or "Resale"
    projectName: "",
    developerName: "",
    bedrooms: 0,
    bathrooms: 0,
    builtUpArea: 0,
    plotSize: 0,
    gardenSize: 0,
    floor: 0,
    isGroundUnit: false,
    propertyType: "House",
    isFeatured: false,
    isHighlighted: false,
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
  const { data: propertiesResponse, isLoading } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    }
  });

  // Extract the properties data array from the paginated response
  const properties = propertiesResponse?.data;

  // Fetch announcements
  const { data: announcementsResponse, isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: ['/api/announcements'],
    queryFn: async () => {
      const response = await fetch('/api/announcements');
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      return response.json();
    }
  });

  // Extract the announcements data array from the paginated response
  const announcements = announcementsResponse?.data;

  // Create property mutation
  const createProperty = useMutation({
    mutationFn: async (newProperty: any) => {
      try {
        // Log the full property data being sent
        console.log("Creating property with data:", JSON.stringify(newProperty, null, 2));

        // Verify required fields
        const requiredFields = ['title', 'description', 'price', 'city', 'zipCode', 'bedrooms', 'bathrooms', 'builtUpArea', 'propertyType', 'images'];
        const missingFields = requiredFields.filter(field => {
          // Check if field is missing or empty
          const value = newProperty[field];
          if (field === 'images') {
            return !value || (Array.isArray(value) && value.length === 0);
          }
          return value === undefined || value === null || 
                (typeof value === 'string' && value.trim() === '') || 
                (typeof value === 'number' && (isNaN(value) || value <= 0));
        });

        if (missingFields.length > 0) {
          console.error(`Missing required fields: ${missingFields.join(', ')}`);
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        console.log("All required fields validated, sending request to server");
        
        // Add timeout to prevent immediate responses
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await apiRequest('POST', '/api/properties', newProperty);
        console.log("Server response received:", response.status);

        if (!response.ok) {
          let errorText = '';
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = 'Could not read server response';
          }
          
          console.error('Property creation failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error(`Server error: ${response.status} - ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log("Property created successfully:", data);
        return data;
      } catch (err) {
        console.error('Property creation error (detailed):', err);
        // Include more details in the error
        throw new Error(err instanceof Error ? err.message : 'Failed to create property - check console for details');
      }
    },
    onSuccess: (data) => {
      console.log("Property creation mutation succeeded with ID:", data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Success",
        description: "Property created successfully",
      });
      // Use setTimeout to prevent immediate closing
      setTimeout(() => {
        setPropertyFormOpen(false);
        resetForm();
      }, 1000);
    },
    onError: (error: any) => {
      // Extract the error message for a better user experience
      const errorMessage = error.message || "Failed to create property. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error creating property (final):", error);
      // Don't close the form on error
    }
  });

  // Update property mutation
  const updateProperty = useMutation({
    mutationFn: async ({ id, property }: { id: number; property: any }) => {
      try {
        console.log(`Updating property ${id} with data:`, JSON.stringify(property, null, 2));
        
        // Add timeout to prevent immediate responses
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await apiRequest('PUT', `/api/properties/${id}`, property);
        
        if (!response.ok) {
          let errorText = '';
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = 'Could not read server response';
          }
          
          console.error('Property update failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error(`Server error: ${response.status} - ${errorText || response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Property updated successfully:", data);
        return data;
      } catch (err) {
        console.error('Property update error (detailed):', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("Property update mutation succeeded with ID:", data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      // Use setTimeout to prevent immediate closing
      setTimeout(() => {
        setPropertyFormOpen(false);
        resetForm();
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating property (final):", error);
      // Don't close the form on error
    }
  });

  // Delete property mutation
  const deleteProperty = useMutation({
    mutationFn: async (id: number) => {
      // For DELETE requests, we don't need to parse JSON as the server returns 204 No Content
      await apiRequest('DELETE', `/api/properties/${id}`);
      return true; // Just return true for success
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

  // Create announcement mutation
  const createAnnouncement = useMutation({
    mutationFn: async (newAnnouncement: any) => {
      const response = await apiRequest('POST', '/api/announcements', newAnnouncement);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      setAnnouncementFormOpen(false);
      resetAnnouncementForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating announcement:", error);
    }
  });

  // Update announcement mutation
  const updateAnnouncement = useMutation({
    mutationFn: async ({ id, announcement }: { id: number; announcement: any }) => {
      const response = await apiRequest('PUT', `/api/announcements/${id}`, announcement);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
      setAnnouncementFormOpen(false);
      resetAnnouncementForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update announcement. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating announcement:", error);
    }
  });

  // Delete announcement mutation
  const deleteAnnouncement = useMutation({
    mutationFn: async (id: number) => {
      // For DELETE requests, we don't need to parse JSON as the server returns 204 No Content
      await apiRequest('DELETE', `/api/announcements/${id}`);
      return true; // Just return true for success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting announcement:", error);
    }
  });

  // Upload announcement image mutation
  const uploadAnnouncementImage = useMutation({
    mutationFn: async (file: File) => {
      try {
        // Create a fresh FormData object
        const formData = new FormData();

        // Add the file with the exact name expected by the server
        formData.append('image', file, file.name);

        console.log('Starting announcement image upload');
        console.log('File details:', file.name, file.type, `${(file.size / 1024).toFixed(2)}KB`);

        // Enhanced fetch request with improved error handling and authentication
        const response = await fetch('/api/upload/announcement-image', {
          method: 'POST',
          body: formData,
          // Add cache-busting headers to prevent caching issues
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          // Explicitly include credentials to ensure session cookies are sent
          credentials: 'include'
        });

        // Handle non-success responses
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed with status:', response.status, response.statusText);
          console.error('Error response body:', errorText);
          throw new Error(`Server error: ${response.status} - ${errorText || response.statusText}`);
        }

        // Parse and return the response data
        const data = await response.json();
        console.log('Announcement image upload successful:', data);
        return data;
      } catch (err) {
        console.error('Announcement image upload error:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      // Set the image URL in the announcement form
      setAnnouncementForm(prev => ({
        ...prev,
        imageUrl: data.imageUrl
      }));

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again with a smaller file or different format.",
        variant: "destructive",
      });
      console.error("Error uploading announcement image:", error);
    }
  });

  // Upload logo mutation
  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      try {
        // Create a fresh FormData object
        const formData = new FormData();

        // Add the file with the exact name expected by the server
        formData.append('logo', file, file.name);

        console.log('Starting improved logo upload with fetch API');
        console.log('File details:', file.name, file.type, `${(file.size / 1024).toFixed(2)}KB`);

        // Enhanced fetch request with improved error handling and authentication
        const response = await fetch('/api/upload/logo', {
          method: 'POST',
          body: formData,
          // Important: Do not set Content-Type header, browser will set it with boundary
          // Add cache-busting parameter to prevent caching issues
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          // Explicitly include credentials to ensure session cookies are sent
          credentials: 'include'
        });

        // Handle non-success responses
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed with status:', response.status, response.statusText);
          console.error('Error response body:', errorText);
          throw new Error(`Server error: ${response.status} - ${errorText || response.statusText}`);
        }

        // Parse and return the response data
        const data = await response.json();
        console.log('Logo upload successful with response:', data);
        return data;
      } catch (err) {
        console.error('Logo upload error (detailed):', err);
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

    // Validate required fields first
    const requiredFields = [
      { field: 'title', label: 'Title' },
      { field: 'description', label: 'Description' },
      { field: 'city', label: 'City' },
      { field: 'zipCode', label: 'ZIP/Postal Code' },
      { field: 'price', label: 'Price' },
      { field: 'bedrooms', label: 'Bedrooms' },
      { field: 'bathrooms', label: 'Bathrooms' },
      { field: 'builtUpArea', label: 'Built-up Area' },
      { field: 'propertyType', label: 'Property Type' },
    ];

    const missingFields = requiredFields.filter(field => {
      const value = formData[field.field as keyof typeof formData];
      return value === undefined || value === null || value === '' || 
             (typeof value === 'number' && (isNaN(value) || value <= 0));
    });

    if (missingFields.length > 0) {
      const fieldLabels = missingFields.map(f => f.label).join(', ');
      toast({
        title: "Form Incomplete",
        description: `Please fill in the following required fields: ${fieldLabels}`,
        variant: "destructive",
      });
      return;
    }

    // Verify images array has content
    if (!formData.images || formData.images.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one image for the property",
        variant: "destructive",
      });
      return;
    }

    // Make sure the form data is complete
    const currentDate = new Date().toISOString();

    // Create a clean version of the form data with proper typing
    const propertyData = {
      ...formData,
      amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
      images: Array.isArray(formData.images) ? formData.images : [],
      price: Number(formData.price), // Ensure these are proper numbers
      downPayment: Number(formData.downPayment),
      installmentAmount: Number(formData.installmentAmount),
      installmentPeriod: Number(formData.installmentPeriod),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      builtUpArea: Number(formData.builtUpArea),
      createdAt: currentDate,
      agentId: user?.id || 1, // Use logged in user's ID as agent ID, fallback to 1
      createdBy: user?.id,
      status: user?.role === 'user' ? 'pending_approval' : 'published'
    };

    console.log('Submitting property data:', JSON.stringify(propertyData, null, 2));

    // Show a pending toast to indicate submission is in progress
    toast({
      title: "Processing...",
      description: isEditing ? "Updating property..." : "Creating property...",
    });

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

  const handleLogoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (logoFile) {
      try {
        console.log("Submitting logo file directly from form...");

        // Create the form data
        const formData = new FormData();
        formData.append('logo', logoFile);

        // Show upload in progress
        toast({
          title: "Uploading logo...",
          description: "Please wait while your logo is being uploaded.",
        });

        // Trigger the upload mutation
        uploadLogo.mutate(logoFile);
      } catch (error) {
        console.error("Error in form submission:", error);
        toast({
          title: "Error",
          description: "Failed to process logo upload. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditProperty = (property: Property) => {
    setFormData({
      title: property.title,
      description: property.description,
      address: property.address || "",
      city: property.city,
      state: property.state || "",
      zipCode: property.zipCode || "", // Added this field to match the schema
      price: property.price,
      downPayment: property.downPayment || 0,
      installmentAmount: property.installmentAmount || 0,
      installmentPeriod: property.installmentPeriod || 0,
      isFullCash: property.isFullCash || false,
      listingType: property.listingType || "Primary",
      projectName: property.projectName || "",
      developerName: property.developerName || "",
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      builtUpArea: property.builtUpArea || 0,
      plotSize: property.plotSize || 0,
      gardenSize: property.gardenSize || 0,
      floor: property.floor || 0,
      isGroundUnit: property.isGroundUnit || false,
      propertyType: property.propertyType,
      isFeatured: property.isFeatured,
      isHighlighted: property.isHighlighted || false,
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

  // Property images upload mutation with improved reliability
  // Track upload progress separately from the mutation state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadPropertyImages = useMutation({
    mutationFn: async (files: File[]) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);

        // Split large files into smaller batches for more reliable uploading
        const MAX_BATCH_SIZE = 1; // Send just 1 file at a time for maximum reliability
        const batches: File[][] = [];

        // Create batches of files
        for (let i = 0; i < files.length; i += MAX_BATCH_SIZE) {
          batches.push(files.slice(i, i + MAX_BATCH_SIZE));
        }

        console.log(`Split ${files.length} files into ${batches.length} batches for more reliable upload`);

        // Track all image URLs across batches
        const allImageUrls: string[] = [];

        // Process each batch sequentially
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          
          // Create a fresh FormData for each attempt
          let formData = new FormData();

          // Add each file in this batch to FormData
          batch.forEach(file => {
            // Rename file for better compatibility if necessary
            let safeFileName = file.name.replace(/[^\w.-]/g, '_');
            
            // Add timestamp to filename to avoid conflicts
            const fileExt = safeFileName.split('.').pop() || 'jpg';
            const baseName = safeFileName.split('.')[0] || 'image';
            const uniqueFileName = `${baseName}_${Date.now()}.${fileExt}`;
            
            // Add file to FormData with safe name
            const modifiedFile = new File([file], uniqueFileName, { type: file.type });
            formData.append('images', modifiedFile);
            
            console.log(`Batch ${i+1}/${batches.length}: Adding file to upload: ${uniqueFileName} (${file.type}, ${(file.size / 1024).toFixed(2)}KB)`);
          });

          console.log(`Uploading batch ${i+1} of ${batches.length} (${batch.length} files)`);

          // Update progress based on which batch we're on
          setUploadProgress(Math.floor((i / batches.length) * 100));

          // Retry logic for each batch
          let retries = 0;
          const MAX_RETRIES = 3; // Increase max retries
          let success = false;

          while (!success && retries <= MAX_RETRIES) {
            try {
              // Create fresh FormData for each retry attempt
              if (retries > 0) {
                formData = new FormData();
                batch.forEach(file => {
                  // Rename file for each retry with timestamp
                  const fileExt = file.name.split('.').pop() || 'jpg';
                  const baseName = file.name.split('.')[0] || 'image';
                  const uniqueFileName = `${baseName}_${Date.now()}_retry${retries}.${fileExt}`;
                  
                  const modifiedFile = new File([file], uniqueFileName, { type: file.type });
                  formData.append('images', modifiedFile);
                  
                  console.log(`Retry ${retries}: Adding file with new name: ${uniqueFileName}`);
                });
              }

              // Use our new simplified endpoint that has better error handling
              const response = await fetch('/api/upload/property-images-simple', {
                method: 'POST',
                body: formData,
                // Add cache-busting headers to prevent caching issues
                headers: {
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                },
                // Explicitly include credentials to ensure session cookies are sent
                credentials: 'include'
              });

              // Better error handling
              if (!response.ok) {
                let errorText = '';
                try {
                  errorText = await response.text();
                } catch (e) {
                  errorText = 'Could not read error response';
                }
                
                console.error(`Batch ${i+1} upload failed (attempt ${retries+1}): Status ${response.status}`);
                console.error('Error response body:', errorText);

                if (retries < MAX_RETRIES) {
                  retries++;
                  // Add exponential backoff with jitter
                  const baseDelay = 1000 * Math.pow(2, retries);
                  const jitter = Math.random() * 1000;
                  const delay = baseDelay + jitter;
                  console.log(`Retrying batch ${i+1} in ${delay.toFixed(0)}ms...`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                  throw new Error(`Server error: ${response.status} - ${errorText || response.statusText}`);
                }
              } else {
                // Batch succeeded
                const data = await response.json();
                console.log(`Batch ${i+1} upload successful:`, data);
                
                if (data.imageUrls && data.imageUrls.length > 0) {
                  allImageUrls.push(...data.imageUrls);
                  success = true;
                } else {
                  console.warn(`Batch ${i+1} succeeded but returned no image URLs`);
                  if (retries < MAX_RETRIES) {
                    retries++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  } else {
                    throw new Error('Upload succeeded but server returned no image URLs');
                  }
                }
              }
            } catch (err) {
              console.error(`Batch ${i+1} upload error (attempt ${retries+1}):`, err);
              if (retries < MAX_RETRIES) {
                retries++;
                // Add exponential backoff with jitter
                const baseDelay = 1000 * Math.pow(2, retries);
                const jitter = Math.random() * 1000;
                const delay = baseDelay + jitter;
                console.log(`Retrying batch ${i+1} in ${delay.toFixed(0)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
              } else {
                throw err;
              }
            }
          }

          // Add a small delay between batches to let the server catch up
          if (i < batches.length - 1) {
            // Update progress for the current batch - increment by a small amount to show activity
            setUploadProgress(Math.floor(((i + 0.5) / batches.length) * 100));
            console.log(`Batch ${i+1} complete. Adding delay before next batch. Progress: ${Math.floor(((i + 0.5) / batches.length) * 100)}%`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay
          }
        }

        // Upload completed
        setUploadProgress(100);
        setIsUploading(false);

        // Log the final result
        console.log(`Upload complete! Total images uploaded: ${allImageUrls.length}`);
        console.log(`Image URLs:`, allImageUrls);

        return { imageUrls: allImageUrls, count: allImageUrls.length };
      } catch (err) {
        setIsUploading(false);
        console.error('Property images upload error (detailed):', err);
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

  // Handle announcement form input changes
  const handleAnnouncementInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAnnouncementForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setAnnouncementForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle announcement image selection
  const handleAnnouncementImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log(`Selected announcement image: ${file.name}, type: ${file.type}, size: ${(file.size / 1024).toFixed(2)}KB`);

      setAnnouncementImage(file);

      // For Adobe Illustrator files, show a placeholder preview
      if (file.name.toLowerCase().endsWith('.ai') || 
          file.type === 'application/postscript' || 
          file.type === 'application/illustrator') {
        console.log('Adobe Illustrator file detected, using placeholder preview');
        setAnnouncementImagePreview('/uploads/ai-placeholder.svg');
      } else {
        // Create preview for regular image files
        const reader = new FileReader();
        reader.onloadend = () => {
          setAnnouncementImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle announcement image upload
  const handleUploadAnnouncementImage = () => {
    if (announcementImage) {
      uploadAnnouncementImage.mutate(announcementImage);
    }
  };

  // Handle announcement form submission
  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Make sure the form data is complete
    const currentDate = new Date().toISOString();

    const announcementData = {
      ...announcementForm,
      createdAt: currentDate
    };

    console.log('Submitting announcement data:', announcementData);

    if (editingAnnouncement && currentAnnouncementId) {
      updateAnnouncement.mutate({ id: currentAnnouncementId, announcement: announcementData });
    } else {
      createAnnouncement.mutate(announcementData);
    }
  };

  // Handle editing an announcement
  const handleEditAnnouncement = (announcement: Announcement) => {
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      imageUrl: announcement.imageUrl || "",
      startDate: announcement.startDate.split('T')[0],
      endDate: announcement.endDate ? announcement.endDate.split('T')[0] : "",
      isActive: announcement.isActive,
      isHighlighted: announcement.isHighlighted || false
    });
    setEditingAnnouncement(true);
    setCurrentAnnouncementId(announcement.id);

    // If there's an image, set the preview
    if (announcement.imageUrl) {
      setAnnouncementImagePreview(announcement.imageUrl);
    } else {
      setAnnouncementImagePreview(null);
    }

    setAnnouncementFormOpen(true);
  };

  // Handle deleting an announcement
  const handleDeleteAnnouncement = (id: number) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      deleteAnnouncement.mutate(id);
    }
  };

  // Reset announcement form
  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: "",
      content: "",
      imageUrl: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      isActive: true,
      isHighlighted: false
    });
    setEditingAnnouncement(false);
    setCurrentAnnouncementId(null);
    setAnnouncementImage(null);
    setAnnouncementImagePreview(null);
  };

  // Open announcement form
  const openAnnouncementForm = () => {
    resetAnnouncementForm();
    setAnnouncementFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zipCode: "", // Added zip code field to match schema requirements
      price: 0,
      downPayment: 0,
      installmentAmount: 0,
      installmentPeriod: 0,
      isFullCash: false,
      listingType: "Primary", // Required field
      projectName: "",
      developerName: "",
      bedrooms: 0,
      bathrooms: 0,
      builtUpArea: 0,
      plotSize: 0,
      gardenSize: 0,
      floor: 0,
      isGroundUnit: false,
      propertyType: "House",
      isFeatured: false,
      isHighlighted: false,
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

  // Handler for adding a new project
  const addProjectHandler = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      listingType: "Primary",
      propertyType: "Apartment",
      projectName: "", // Empty but required for projects
      developerName: "", // Developer name is important for projects
    }));
    setDialogTitle("Add New Project");
    setPropertyFormOpen(true);
  };

  // Handler for adding an international property
  const addInternationalPropertyHandler = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      city: "Dubai", // Default to Dubai for international properties
      listingType: "Primary", // Usually primary for international
    }));
    setDialogTitle("Add International Property");
    setPropertyFormOpen(true);
  };

  const openPropertyForm = () => {
    resetForm();
    setDialogTitle("Add New Property");
    setPropertyFormOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back to Website button at the top */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          className="border-copper text-copper hover:bg-cream"
          onClick={() => window.location.href = '/'}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Back to Website
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex space-x-3">
          <Button onClick={() => setLogoFormOpen(true)} variant="outline">
            Upload Logo
          </Button>
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
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="international">International</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <TabsTrigger value="users" asChild>
              <Link href="/user-management">User Management</Link>
            </TabsTrigger>
          )}
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
                    <TableHead>Highlighted</TableHead>
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
                      <TableCell>{property.isHighlighted ? "Yes" : "No"}</TableCell>
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

        <TabsContent value="projects">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Manage Projects</h2>
            <Button onClick={addProjectHandler}>Add New Project</Button>
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
                    <TableHead>Project Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Developer</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Highlighted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties?.filter((property: Property) => property.listingType === "Primary" && property.projectName)
                    .map((property: Property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.projectName}</TableCell>
                      <TableCell>{property.city}, {property.state}</TableCell>
                      <TableCell>{property.developerName || "N/A"}</TableCell>
                      <TableCell>{1}</TableCell>
                      <TableCell>{property.isFeatured ? "Yes" : "No"}</TableCell>
                      <TableCell>{property.isHighlighted ? "Yes" : "No"}</TableCell>
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

        <TabsContent value="international">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Manage International Properties</h2>
            <Button onClick={addInternationalPropertyHandler}>Add International Property</Button>
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
                  {properties?.filter((property: Property) => property.city === "Dubai" || property.city === "London")
                    .map((property: Property) => (
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

        <TabsContent value="announcements">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Manage Announcements</h2>
            <Button onClick={openAnnouncementForm}>Add New Announcement</Button>
          </div>

          {isLoadingAnnouncements ? (
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
          ) : announcements && announcements.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Highlighted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement: Announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell>{new Date(announcement.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {announcement.endDate ? new Date(announcement.endDate).toLocaleDateString() : 'No End Date'}
                      </TableCell>
                      <TableCell>
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {announcement.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            announcement.isHighlighted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {announcement.isHighlighted ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditAnnouncement(announcement)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="rounded-full bg-blue-50 p-3 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-blue-500"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-center">No Announcements Found</h3>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Create your first announcement to engage with your customers.
                </p>
                <Button onClick={openAnnouncementForm} className="mt-4">
                  Create Announcement
                </Button>
              </CardContent>
            </Card>
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
              {isEditing ? "Edit Property" : dialogTitle}
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
                    <SelectItem value="Duplex">Duplex</SelectItem>
                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                    <SelectItem value="Chalet">Chalet</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Twin house">Twin house</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Administrative office">Administrative office</SelectItem>
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
                        <SelectItem value="Sheikh Zayed">Sheikh Zayed</SelectItem>
                        <SelectItem value="North Coast">North Coast</SelectItem>
                        <SelectItem value="Gouna">Gouna</SelectItem>
                        <SelectItem value="Red Sea">Red Sea</SelectItem>
                        <SelectItem value="Dubai">Dubai</SelectItem>
                        <SelectItem value="London">London</SelectItem>
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
                    <label htmlFor="zipCode" className="text-sm font-medium flex items-center">
                      ZIP/Postal Code
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="projectName" className="text-sm font-medium flex items-center">
                      Project Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter the project name instead of address"
                    />
                  </div>

                </div>
              </div>

              <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium mb-3 text-blue-800">Property Details</h3>

                {/* Listing Type - Mandatory field */}
                <div className="mb-4">
                  <div className="space-y-2">
                    <label htmlFor="listingType" className="text-sm font-medium flex items-center">
                      Listing Type
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Select
                      value={formData.listingType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, listingType: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select listing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Primary">Primary</SelectItem>
                        <SelectItem value="Resale">Resale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Primary Market - Two price fields */}
                  {formData.listingType === "Primary" && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="price" className="text-sm font-medium flex items-center">
                          Total Price (EGP)
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
                        <label htmlFor="downPayment" className="text-sm font-medium flex items-center">
                          Down Payment (EGP)
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Input
                          id="downPayment"
                          name="downPayment"
                          type="number"
                          value={formData.downPayment?.toString() || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="installmentAmount" className="text-sm font-medium">
                          Monthly Installment (EGP)
                        </label>
                        <Input
                          id="installmentAmount"
                          name="installmentAmount"
                          type="number"
                          value={formData.installmentAmount?.toString() || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  )}

                  {/* Resale Market - Single price field */}
                  {formData.listingType === "Resale" && (
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
                  )}

                  <div className="space-y-2">
                    <label htmlFor="builtUpArea" className="text-sm font-medium flex items-center">
                      Built-Up Area (m²)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      id="builtUpArea"
                      name="builtUpArea"
                      type="number"
                      value={formData.builtUpArea?.toString() || ""}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="text-xs text-gray-500">Built-Up Area in square meters</span>
                  </div>

                  {/* Is Ground Unit Toggle */}
                  <div className="space-y-2">
                    <label htmlFor="isGroundUnit" className="text-sm font-medium">Ground Unit</label>
                    <Select
                      value={formData.isGroundUnit ? "true" : "false"}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, isGroundUnit: value === "true" }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Is this a ground unit?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-gray-500">Ground units typically have gardens instead of plot sizes</span>
                  </div>

                  {/* Floor field - only for vertical building units */}
                  {['Apartment', 'Studio', 'Penthouse', 'Chalet'].includes(formData.propertyType) && !formData.isGroundUnit && (
                    <div className="space-y-2">
                      <label htmlFor="floor" className="text-sm font-medium flex items-center">
                        Floor
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Input
                        id="floor"
                        name="floor"
                        type="number"
                        value={formData.floor?.toString() || ""}
                        onChange={handleInputChange}
                        required
                      />
                      <span className="text-xs text-gray-500">Floor number (1, 2, etc.)</span>
                    </div>
                  )}

                  {/* Plot Size - for non-ground units */}
                  {!formData.isGroundUnit && (
                    <div className="space-y-2">
                      <label htmlFor="plotSize" className="text-sm font-medium flex items-center">
                        Plot Size (m²)
                        {!['Apartment', 'Studio', 'Chalet', 'Penthouse'].includes(formData.propertyType) && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <Input
                        id="plotSize"
                        name="plotSize"
                        type="number"
                        value={formData.plotSize?.toString() || ""}
                        onChange={handleInputChange}
                        required={!['Apartment', 'Studio', 'Chalet', 'Penthouse'].includes(formData.propertyType) && !formData.isGroundUnit}
                      />
                      <span className="text-xs text-gray-500">Plot Size in square meters</span>
                    </div>
                  )}

                  {/* Garden Size - only for ground units */}
                  {formData.isGroundUnit && (
                    <div className="space-y-2">
                      <label htmlFor="gardenSize" className="text-sm font-medium flex items-center">
                        Garden Size (m²)
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Input
                        id="gardenSize"
                        name="gardenSize"
                        type="number"
                        value={formData.gardenSize?.toString() || ""}
                        onChange={handleInputChange}
                        required={formData.isGroundUnit}
                      />
                      <span className="text-xs text-gray-500">Garden Size in square meters</span>
                    </div>
                  )}

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
                            disabled={uploadPropertyImages.isPending || isUploading}
                          >
                            Clear All
                          </Button>
                          <Button 
                            type="button" 
                            size="sm" 
                            onClick={handleUploadPropertyImages}
                            disabled={uploadPropertyImages.isPending || isUploading}
                          >
                            {uploadPropertyImages.isPending || isUploading ? 'Uploading...' : 'Upload Selected'}
                          </Button>
                        </div>
                      </div>

                      {/* Upload progress bar */}
                      {isUploading && (
                        <div className="mt-2 mb-4">
                          <div className="text-xs text-gray-500 flex justify-between mb-1">
                            <div className="flex items-center">
                              <Loader2 className="animate-spin h-3 w-3 mr-1" />
                              <span>Uploading in batches for better reliability...</span>
                            </div>
                            <span className="font-medium">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-amber-600">Please do not close this window during upload</p>
                        </div>
                      )}

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

              {/* Featured and Highlighted Switches */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-center gap-2">
                  <Switch
                    id="property-featured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isFeatured: checked }))
                    }
                  />
                  <label htmlFor="property-featured" className="text-sm font-medium">
                    Featured Property <span className="text-xs text-gray-500">(Shows on main page)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="property-highlighted"
                    name="isHighlighted"
                    checked={formData.isHighlighted}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isHighlighted: checked }))
                    }
                  />
                  <label htmlFor="property-highlighted" className="text-sm font-medium">
                    Highlighted Property <span className="text-xs text-gray-500">(Shows in main carousel)</span>
                  </label>
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

      {/* Announcement Form Dialog */}
      <Dialog open={announcementFormOpen} onOpenChange={setAnnouncementFormOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? "Edit Announcement" : "Add New Announcement"}
            </DialogTitle>
            <DialogDescription>
              Create announcements to display important information to your customers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  name="title"
                  value={announcementForm.title}
                  onChange={handleAnnouncementInputChange}
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="content"
                  name="content"
                  value={announcementForm.content}
                  onChange={handleAnnouncementInputChange}
                  placeholder="Enter announcement content"
                  rows={5}
                  required
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="space-y-2 flex-1">
                  <label htmlFor="startDate" className="text-sm font-medium">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={announcementForm.startDate}
                    onChange={handleAnnouncementInputChange}
                    required
                  />
                </div>

                <div className="space-y-2 flex-1">
                  <label htmlFor="endDate" className="text-sm font-medium">
                    End Date <span className="text-muted-foreground text-xs">(Optional)</span>
                  </label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={announcementForm.endDate}
                    onChange={handleAnnouncementInputChange}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={announcementForm.isActive}
                    onChange={(e) => setAnnouncementForm(prev => ({
                      ...prev,
                      isActive: e.target.checked
                    }))}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active (visible to users)
                  </label>
                </div>



                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isHighlighted"
                    name="isHighlighted"
                    checked={announcementForm.isHighlighted}
                    onChange={(e) => setAnnouncementForm(prev => ({
                      ...prev,
                      isHighlighted: e.target.checked
                    }))}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isHighlighted" className="text-sm font-medium">
                    Highlighted (appears in main carousel)
                  </label>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium">
                  Announcement Image <span className="text-muted-foreground text-xs">(Optional)</span>
                </label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Input
                      id="announcementImage"
                      type="file"
                      accept="image/*"
                      onChange={handleAnnouncementImageChange}
                    />
                    {announcementImage && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={handleUploadAnnouncementImage}
                      >
                        Upload Image
                      </Button>
                    )}
                  </div>

                  <div className="flex justify-center">
                    {/* Image preview */}
                    {(announcementImagePreview || announcementForm.imageUrl) && (
                      <div className="relative rounded border overflow-hidden w-full max-h-[150px] flex items-center justify-center bg-gray-50">
                        <img 
                          src={announcementImagePreview || announcementForm.imageUrl} 
                          alt="Announcement image preview" 
                          className="max-h-[150px] max-w-full object-contain" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAnnouncementFormOpen(false);
                  resetAnnouncementForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingAnnouncement ? "Update" : "Create"} Announcement
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

          {/* Use encType="multipart/form-data" to properly handle file uploads */}
          <form onSubmit={handleLogoSubmit} className="space-y-6" encType="multipart/form-data">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="logo" className="text-sm font-medium">
                  Select Logo (Any Image Format)
                </label>
                <Input
                  id="logo"
                  name="logo" 
                  type="file"
                  accept="image/*,.ai,application/postscript,application/illustrator"
                  onChange={handleLogoChange}
                  required
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF, SVG, WebP, and other image types.
                  Max file size: 10MB.
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