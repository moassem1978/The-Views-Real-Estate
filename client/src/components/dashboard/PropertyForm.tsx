import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Property } from "../../types";
import { apiRequest } from "../../lib/queryClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Info, Loader2, Upload, X } from "lucide-react";
import { useForm, useFormState } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface PropertyFormProps {
  propertyId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PropertyForm({
  propertyId,
  onSuccess,
  onCancel,
}: PropertyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // New approach: Use a single array of retained images instead of tracking removals
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const isEditing = !!propertyId;

  // Fetch available projects for dropdown
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    enabled: true,
  });

  // Fetch property data if editing
  const { data: property, isLoading: isLoadingProperty, error: propertyError } = useQuery<Property>({
    queryKey: ["/api/properties", propertyId],
    queryFn: async () => {
      try {
        if (!propertyId) {
          throw new Error("No property ID provided");
        }
        
        console.log(`Fetching property data for ID: ${propertyId}`);
        
        // Try to get property from cache first
        const propertiesCache = queryClient.getQueryData<{ data: Property[] }>(["/api/properties"]);
        if (propertiesCache?.data) {
          const cachedProperty = propertiesCache.data.find(p => p.id === propertyId);
          if (cachedProperty) {
            console.log("Found property in cache:", cachedProperty);
            return cachedProperty;
          }
        }
        
        // If not in cache, fetch from server
        const res = await apiRequest("GET", `/api/properties/${propertyId}`);
        
        // Handle 404 specifically
        if (res.status === 404) {
          console.error(`Property with ID ${propertyId} not found`);
          toast({
            title: "Property not found",
            description: `The property with ID ${propertyId} does not exist or was deleted.`,
            variant: "destructive"
          });
          
          // Return null to immediately close the form
          setTimeout(() => {
            if (onCancel) onCancel();
          }, 1500);
          
          throw new Error(`Property with ID ${propertyId} not found`);
        }
        
        if (!res.ok) {
          console.error(`Error fetching property ${propertyId}: ${res.status} ${res.statusText}`);
          throw new Error(`Failed to fetch property (Status: ${res.status})`);
        }
        
        const data = await res.json();
        console.log("Successfully fetched property data:", data);
        return data;
      } catch (error) {
        console.error("Error in property fetch query:", error);
        toast({
          title: "Error loading property",
          description: "Failed to fetch property details. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: !!propertyId,
    retry: (failureCount, error: any) => {
      // Don't retry if the property doesn't exist
      if (error?.message?.includes("not found")) {
        return false;
      }
      // Otherwise retry up to 2 times for other errors
      return failureCount < 2;
    },
  });

  // Form setup with simpler defaultValues
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      propertyType: "",
      listingType: "Resale", // Default to Resale
      price: 0,
      downPayment: 0,
      installmentAmount: 0,
      installmentPeriod: 0,
      isFullCash: false,
      city: "",
      projectName: "",
      developerName: "",
      address: "Project Address", // Default address to avoid null error
      bedrooms: 0,
      bathrooms: 0,
      builtUpArea: 0,
      isFeatured: false,
      isHighlighted: false,
      isNewListing: true,
      country: "Egypt", // Default to Egypt
      references: "", // Reference number field
      zipCode: "", // Required by server
      // Removed images and imagesToRemove from form state
    },
  });

  // Set form values when property data is loaded
  useEffect(() => {
    if (property && isEditing) {
      console.log("Setting form data for property:", property);
      
      // Create a clean form data object with consistent field names
      const formData = {
        title: property.title || '',
        description: property.description || '',
        propertyType: property.propertyType || property.property_type || '',
        listingType: property.listingType || property.listing_type || 'Primary',
        price: property.price || 0,
        downPayment: property.downPayment || property.down_payment || 0,
        installmentAmount: property.installmentAmount || property.installment_amount || 0,
        installmentPeriod: property.installmentPeriod || property.installment_period || 0,
        isFullCash: Boolean(property.isFullCash || property.is_full_cash),
        city: property.city || '',
        projectName: property.projectName || property.project_name || '',
        developerName: property.developerName || property.developer_name || '',
        address: property.address || 'Project Address', // Default to avoid null
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        builtUpArea: property.builtUpArea || property.built_up_area || 0,
        isFeatured: Boolean(property.isFeatured || property.is_featured),
        isHighlighted: Boolean(property.isHighlighted || property.is_highlighted),
        isNewListing: Boolean(property.isNewListing || property.is_new_listing),
        country: property.country || 'Egypt',
        references: property.references || property.reference_number || '',
        yearBuilt: property.yearBuilt || property.year_built || '',
        zipCode: property.zipCode || property.zip_code || "00000", // Required by server
        // Removed problematic images fields
      };
      
      // Set existing images if available
      const propertyImages = property.images || [];
      console.log("Setting existing property images:", propertyImages);
      const imagesArray = Array.isArray(propertyImages) ? propertyImages : [];
      
      // Set the master list of images
      setExistingImages(imagesArray);
      
      // Initialize the kept images with all current images
      // This is our new approach - directly track which images to keep
      console.log("INITIALIZING: Setting keptImages with all existing images:", imagesArray);
      setKeptImages([...imagesArray]);
      
      // We won't use form.setValue directly for images anymore
      // Instead, we'll rely on the keptImages state
      // and use it directly in the form submission
      
      console.log("Form data being set:", formData);
      form.reset(formData);
    }
  }, [property, isEditing, form]);

  // Create or update property mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        console.log("Starting form submission process...");
        
        // First try to refresh the auth session
        try {
          await apiRequest("POST", "/api/auth/refresh");
          console.log("Authentication refreshed successfully");
        } catch (authError) {
          console.warn("Authentication refresh failed, will try request anyway", authError);
        }
        
        const url = isEditing ? `/api/properties/${propertyId}` : '/api/properties';
        const method = isEditing ? 'PUT' : 'POST';
        
        console.log(`FORM SUBMISSION: Making ${method} request to ${url}`);
        
        // Create a clean data object with primitive values to avoid circular reference errors
        const cleanData = { ...data };
        
        // NEW APPROACH: Just set the images array directly to what we want to keep
        console.log(`USING NEW DIRECT IMAGE APPROACH: ${keptImages.length} images to keep`);
        cleanData.images = keptImages;
        
        // Log what's happening with images
        console.log(`Setting property to keep only these images:`, keptImages);
        
        // Ensure all fields are properly formatted for transmission
        // Handle zipCode (required by the server)
        if (!cleanData.zipCode && cleanData.city) {
          // Default zipCodes for common cities
          const defaultZipCodes: Record<string, string> = {
            'Cairo': '11511',
            'Dubai': '00000',
            'London': 'SW1A 1AA',
            'Zayed': '12311',
            'North coast': '23511',
            'Gouna': '84513',
            'Red Sea': '84712'
          };
          cleanData.zipCode = (defaultZipCodes[cleanData.city] || '00000');
          console.log(`Added zipCode: ${cleanData.zipCode} for city: ${cleanData.city}`);
        }
        
        // Add required fields that the server needs
        cleanData.createdAt = cleanData.createdAt || new Date().toISOString();
        cleanData.agentId = cleanData.agentId || 1; // Default agent ID is 1 (presumably the owner)
        
        // Ensure numeric fields are actually numbers
        ['price', 'downPayment', 'installmentAmount', 'installmentPeriod', 
         'bedrooms', 'bathrooms', 'builtUpArea'].forEach(field => {
          if (field in cleanData) {
            const value = cleanData[field];
            if (typeof value === 'string' && value.trim() !== '') {
              cleanData[field] = Number(value);
            } else if (value === '' || value === null || value === undefined) {
              cleanData[field] = 0;
            }
          }
        });
        
        // Handle boolean fields properly
        ['isFullCash', 'isFeatured', 'isHighlighted', 'isNewListing'].forEach(field => {
          if (field in cleanData) {
            // Ensure booleans are actual booleans
            cleanData[field] = Boolean(cleanData[field]);
          }
        });
        
        // Log the final clean data object
        try {
          console.log("FORM SUBMISSION DATA:", JSON.stringify(cleanData, null, 2));
        } catch (jsonError) {
          console.error("Error stringifying form data:", jsonError);
          console.log("Form data (partial):", Object.keys(cleanData).join(', '));
        }
        
        // Browser compatibility: use direct fetch with careful error handling
        let response;
        try {
          // Then, create or update the property
          response = await apiRequest(method, url, cleanData);
          console.log(`FORM SUBMISSION: ${method} request status:`, response.status, response.statusText);
        } catch (error) {
          const fetchError = error as Error;
          console.error("Network error during form submission:", fetchError);
          throw new Error(`Network error: ${fetchError.message || 'Connection failed'}`);
        }
        
        if (!response.ok) {
          let errorMessage = `Server error (${response.status})`;
          try {
            const errorText = await response.text();
            console.error(`FORM SUBMISSION: API Error (${response.status}):`, errorText);
            errorMessage = `API Error (${response.status}): ${errorText || response.statusText}`;
          } catch (textError) {
            console.error("Failed to get error details:", textError);
          }
          throw new Error(errorMessage);
        }
        
        let result;
        try {
          result = await response.json();
          console.log("FORM SUBMISSION: Success response:", result);
        } catch (jsonError) {
          console.error("Error parsing API response:", jsonError);
          throw new Error("Invalid response from server");
        }

        // Finally, if there are images to upload, upload them
        if (images.length > 0) {
          console.log(`FORM SUBMISSION: Uploading ${images.length} new images`);
          try {
            await uploadImages(result.id);
          } catch (uploadError) {
            console.error("Image upload failed but property was saved:", uploadError);
            toast({
              title: "Property saved but images failed",
              description: "Your property was saved but we couldn't upload the images. You can try again later.",
              variant: "destructive",
            });
          }
        }

        return result;
      } catch (error: any) {
        console.error("FORM SUBMISSION: Caught error:", error);
        
        // Handle 401 errors specifically
        if (error.message && error.message.includes('401')) {
          // Show a more specific error and redirect to login
          toast({
            title: "Authentication Required",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          
          // Redirect to login after a brief delay
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Property updated" : "Property created",
        description: isEditing 
          ? "The property has been successfully updated." 
          : "The property has been successfully created.",
      });

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ["/api/properties", propertyId] });
      }

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      // Don't reset the form on error so the user doesn't lose their data
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the property. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Enhanced image upload function with better Windows and cross-browser compatibility
  const uploadImages = async (propertyId: number | undefined) => {
    if (!propertyId) {
      console.error("Property ID is required for image upload");
      throw new Error("Property ID is required for image upload");
    }
    try {
      setUploading(true);
      console.log(`Starting image upload process for property ID ${propertyId}...`);
      
      if (images.length === 0) {
        console.log("No new images selected, skipping image upload");
        return { success: true, message: "No new images to upload" };
      }
      
      // Create a new FormData object for uploading files
      const formData = new FormData();
      
      // More thorough file validation
      const validImages = Array.from(images).filter(file => {
        if (!file) {
          console.warn(`Skipping null/undefined file`);
          return false;
        }
        
        if (!(file instanceof File)) {
          console.warn(`Skipping non-File object:`, file);
          return false;
        }
        
        if (file.size === 0) {
          console.warn(`Skipping zero-size file: ${file.name}`);
          return false;
        }
        
        // Check file type for basic validation
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        if (!validTypes.includes(file.type) && file.type !== '') {
          console.warn(`Skipping file with invalid type: ${file.type} (${file.name})`);
          return false;
        }
        
        return true;
      });
      
      if (validImages.length === 0) {
        console.warn("No valid images to upload after filtering");
        throw new Error("No valid images were selected. Please select valid image files.");
      }
      
      console.log(`Processing ${validImages.length} valid images for upload`);
      
      // More robust file appending with additional debugging
      validImages.forEach((image, index) => {
        const fileName = image.name || `image-${index}.jpg`;
        console.log(`Adding image to form: ${fileName} (${Math.round(image.size / 1024)}KB)`);
        
        try {
          // Only use a single field name for the upload - 'images'
          formData.append('images', image, fileName);
        } catch (appendError) {
          console.error(`Error appending file ${fileName} to form:`, appendError);
          // Continue despite errors - we'll handle partial uploads on server side
        }
      });
      
      // Add property ID in multiple ways to ensure it's received
      formData.append('propertyId', propertyId.toString());
      
      // Create a longer timeout for larger uploads
      const uploadTimeout = Math.max(60000, validImages.length * 15000); // Base 60s + 15s per image
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), uploadTimeout);
      
      console.log(`Sending upload request to server with ${uploadTimeout/1000}s timeout`);
      
      try {
        // Always use the cross-platform endpoint
        const endpoint = `/api/upload/property-images-simple`;
        console.log(`Using enhanced cross-platform endpoint: ${endpoint}`);
        
        // Additional headers for more consistent behavior
        const headers = new Headers();
        // Let the browser set content-type with boundary for multipart/form-data
        headers.append('X-Property-Id', propertyId.toString()); // Backup property ID
        
        // Log browser/platform details for diagnostics
        const isWindows = navigator.userAgent.indexOf('Windows') !== -1;
        const isiOS = /(iPhone|iPad|iPod)/i.test(navigator.userAgent);
        const isChrome = navigator.userAgent.indexOf('Chrome') !== -1;
        const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
        const isSafari = navigator.userAgent.indexOf('Safari') !== -1 && !isChrome;
        
        console.log(`Browser/platform diagnostics:`, { 
          isWindows, isiOS, isChrome, isFirefox, isSafari,
          userAgent: navigator.userAgent
        });
        
        // Try to do the upload with robust error handling
        let uploadResponse;
        try {
          uploadResponse = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            credentials: 'include',
            headers
          });
          
          clearTimeout(timeoutId);
          console.log(`Upload response status: ${uploadResponse.status} ${uploadResponse.statusText}`);
          
          if (!uploadResponse.ok) {
            let errorMessage;
            try {
              const errorText = await uploadResponse.text();
              console.error(`Upload failed: ${errorText}`);
              errorMessage = errorText;
            } catch (textError) {
              errorMessage = `Status ${uploadResponse.status} ${uploadResponse.statusText}`;
            }
            
            throw new Error(`Failed to upload images: ${errorMessage}`);
          }
        } catch (fetchError: any) {
          console.error('Fetch error during upload:', fetchError);
          
          // Special handling for abort errors
          if (fetchError.name === 'AbortError') {
            throw new Error('Upload timed out. Please try with fewer or smaller images.');
          }
          
          // Try to provide a meaningful error message
          const errorMsg = fetchError.message || 'Network error during upload';
          throw new Error(`Upload failed: ${errorMsg}`);
        }
        
        // Parse the response with error handling
        try {
          const result = await uploadResponse.json();
          console.log('Upload successful:', result);
          return result;
        } catch (jsonError) {
          console.log('Response was received but could not parse JSON');
          
          // Try to extract a message from the text response
          try {
            const textResponse = await uploadResponse.text();
            console.log('Text response:', textResponse);
            
            // If we have some response text, use it
            if (textResponse && textResponse.length > 0) {
              return { 
                success: true, 
                message: 'Images uploaded successfully',
                imageUrls: validImages.map((_, i) => `/uploads/properties/image-${Date.now()}-${i}.jpg`)
              };
            }
          } catch (textError) {
            console.error('Could not get text response:', textError);
          }
          
          // Last resort - create a basic success response
          return { 
            success: true, 
            message: 'Images uploaded successfully but response could not be parsed'
          };
        }
      } catch (networkError) {
        console.error('Network or processing error during upload:', networkError);
        clearTimeout(timeoutId);
        throw networkError;
      }
    } catch (error) {
      console.error('Image upload error:', error);
      
      // Show a toast with the error
      toast({
        title: "Image Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Simplified form submission using direct fetch for better reliability
  const onSubmit = async (data: any) => {
    try {
      console.log("Starting form submission process...");
      console.log("Submitting form data:", data);
      
      // Ensure required fields are present
      if (!data.createdAt) {
        data.createdAt = new Date().toISOString();
      }
      
      if (!data.agentId) {
        data.agentId = 1; // Default to admin user
      }
      
      // Set keptImages as the images array
      data.images = keptImages || [];
      console.log("USING NEW DIRECT IMAGE APPROACH:", data.images.length, "images to keep");
      
      // Ensure all numeric fields are properly parsed as numbers
      const formattedData = {
        ...data,
        price: typeof data.price === 'string' ? parseInt(data.price) : data.price,
        downPayment: typeof data.downPayment === 'string' ? parseInt(data.downPayment) : (data.downPayment || 0),
        installmentAmount: typeof data.installmentAmount === 'string' ? 
          parseInt(data.installmentAmount) : (data.installmentAmount || 0),
        installmentPeriod: typeof data.installmentPeriod === 'string' ? 
          parseInt(data.installmentPeriod) : (data.installmentPeriod || 0),
        bedrooms: typeof data.bedrooms === 'string' ? parseInt(data.bedrooms) : data.bedrooms,
        bathrooms: typeof data.bathrooms === 'string' ? parseInt(data.bathrooms) : data.bathrooms,
        builtUpArea: typeof data.builtUpArea === 'string' ? parseInt(data.builtUpArea) : data.builtUpArea,
        
        // Ensure boolean fields are properly formatted
        isFeatured: Boolean(data.isFeatured),
        isHighlighted: Boolean(data.isHighlighted),
        isNewListing: Boolean(data.isNewListing),
        isFullCash: Boolean(data.isFullCash),
        
        // Property status
        status: data.status || 'active',
        
        // For referencing/filtering
        images: data.images || [],
        amenities: data.amenities || [],
        
        // Fix for the missing state field - this is required by the database
        state: data.state || 'Cairo', // Default to Cairo if not provided
        
        // These fields help with database field mapping
        reference_number: data.references || '',
        references: data.references || '',
      };

      console.log("FORM SUBMISSION DATA:", JSON.stringify(formattedData, null, 2));
      
      setUploading(true);
      
      try {
        let response;
        
        if (isEditing) {
          // Update existing property
          console.log(`Updating property ${propertyId}`);
          response = await fetch(`/api/properties/${propertyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formattedData)
          });
        } else {
          // Create new property
          console.log("Creating new property");
          response = await fetch('/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formattedData)
          });
        }
        
        console.log(`Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          let errorMessage = `Failed to ${isEditing ? 'update' : 'create'} property`;
          
          try {
            const errorData = await response.json();
            console.error("API error response:", errorData);
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            try {
              const errorText = await response.text();
              console.error("API error text:", errorText);
              errorMessage = errorText || errorMessage;
            } catch (textError) {
              console.error("Couldn't parse error response");
            }
          }
          
          throw new Error(errorMessage);
        }
        
        const savedProperty = await response.json();
        console.log(`Property ${isEditing ? 'updated' : 'created'} successfully:`, savedProperty);
        
        // For new properties, use the returned ID; for editing, use the existing ID
        const savedPropertyId = isEditing ? Number(propertyId) : savedProperty.id;
        
        // Upload new images if any
        if (images.length > 0) {
          try {
            console.log(`Uploading ${images.length} new images for property ID ${savedPropertyId}`);
            
            const uploadResult = await uploadImages(savedPropertyId);
            console.log("Upload result:", uploadResult);
            
            if (uploadResult && uploadResult.imageUrls && uploadResult.imageUrls.length > 0) {
              // Combine current and new images
              const allImages = [
                ...(keptImages || []),
                ...(uploadResult.imageUrls || [])
              ].filter(Boolean);
              
              console.log("All images after upload:", allImages);
              
              // Update the property with the combined image list
              const updateImageResponse = await fetch(`/api/properties/${savedPropertyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ images: allImages })
              });
              
              if (!updateImageResponse.ok) {
                console.warn("Warning: Failed to update property with new images");
              } else {
                console.log("Successfully updated property with new images");
              }
            }
          } catch (uploadError) {
            console.error("Error uploading images:", uploadError);
            toast({
              title: "Warning",
              description: "Property was saved but there was an issue with uploading images",
              variant: "destructive"
            });
          }
        }
        
        // Show success message
        toast({
          title: isEditing ? "Property updated" : "Property created",
          description: "Property has been saved successfully",
          variant: "default"
        });
        
        // Reset the form for a new property
        if (!isEditing) {
          form.reset({
            title: "",
            description: "",
            propertyType: "",
            listingType: "Resale", 
            price: 0,
            downPayment: 0,
            installmentAmount: 0,
            installmentPeriod: 0,
            isFullCash: false,
            city: "",
            projectName: "",
            developerName: "",
            address: "Project Address",
            bedrooms: 0,
            bathrooms: 0,
            builtUpArea: 0,
            isFeatured: false,
            isHighlighted: false,
            isNewListing: true,
            country: "Egypt",
            references: "",
            zipCode: ""
          });
          setImages([]);
          setExistingImages([]);
          setKeptImages([]);
        }
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
      } catch (error) {
        console.error("Error saving property:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save property",
          variant: "destructive"
        });
      } finally {
        setUploading(false);
      }
      
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process form data",
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImages(Array.from(e.target.files));
    }
  };

  // Watch the listing type to conditionally render fields
  const listingType = form.watch('listingType');
  const isResale = listingType === 'Resale';

  // Show loading state
  if (isLoadingProperty && isEditing) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#B87333]" />
      </div>
    );
  }
  
  // Show error state 
  if (propertyError && isEditing) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="text-red-500 text-xl font-medium">Error Loading Property</div>
        <p className="text-center text-gray-600 max-w-md">
          We encountered a problem loading this property information. Please try again or contact support.
        </p>
        <Button onClick={onCancel} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      {/* Cross-platform compatibility notice */}
      {(
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <p className="text-amber-800 font-medium mb-1">Having trouble with this form on Windows?</p>
          <p className="text-amber-700 mb-2">Try our Universal Property Form that works on all platforms.</p>
          <div className="flex space-x-2">
            <a 
              href={`/windows-property.html${propertyId ? `?propertyId=${propertyId}` : ''}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Open Universal Property Form
            </a>
            {propertyId && (
              <a 
                href={`/windows-upload.html?propertyId=${propertyId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline ml-4"
              >
                Universal Image Uploader
              </a>
            )}
          </div>
        </div>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Details Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Basic Details</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter property title" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the property" 
                          className="min-h-[120px]" 
                          {...field} 
                          required 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="references"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter property reference number"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Unique reference number for this property
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="penthouse">Penthouse</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="twinhouse">Twinhouse</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="chalet">Chalet</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="listingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Type*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Primary">Primary</SelectItem>
                            <SelectItem value="Resale">Resale</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms*</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            required 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms*</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            required 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="builtUpArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Built Up Area (m²)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          required 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Location & Project</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City*</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Update zipCode based on city selection
                          const defaultZipCodes: Record<string, string> = {
                            'Cairo': '11511',
                            'Dubai': '00000',
                            'London': 'SW1A 1AA',
                            'Zayed': '12311',
                            'North Coast': '23511',
                            'Red Sea': '84712'
                          };
                          const zipCode = defaultZipCodes[value] || '00000';
                          form.setValue('zipCode', zipCode);
                          console.log(`City selected: ${value}, setting zipCode: ${zipCode}`);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cairo">Cairo</SelectItem>
                          <SelectItem value="Zayed">Zayed</SelectItem>
                          <SelectItem value="North Coast">North Coast</SelectItem>
                          <SelectItem value="Red Sea">Red Sea</SelectItem>
                          <SelectItem value="Dubai">Dubai</SelectItem>
                          <SelectItem value="London">London</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hidden zipCode field that's populated based on city selection */}
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Egypt">Egypt</SelectItem>
                          <SelectItem value="UAE">UAE</SelectItem>
                          <SelectItem value="UK">UK</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        International properties will be featured in the International section
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter project name" 
                          {...field} 
                          required 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="developerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Developer Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter developer name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter property address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pricing Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Pricing</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (L.E)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          required 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isResale && (
                  <>
                    <FormField
                      control={form.control}
                      name="downPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Down Payment (L.E)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="installmentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Installment Amount (L.E)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="installmentPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Installment Period (Years)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="30"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="isFullCash"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Full Cash Payment
                        </FormLabel>
                        <FormDescription>
                          Only cash payment is accepted for this property
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images & Features Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Images & Features</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="images">Property Images</Label>
                  {existingImages.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-2">
                      <p className="text-sm text-amber-800 font-medium flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        To remove images, click the red "Delete" button on each image.
                      </p>
                    </div>
                  )}
                  <div className="border rounded-md p-4">
                    {/* Existing Images Display - NEW APPROACH */}
                    {existingImages.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">
                          Current Images ({keptImages.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {existingImages.map((imageUrl, index) => {
                            // Simple approach - just don't render images that aren't in our keptImages list
                            if (!keptImages.includes(imageUrl)) {
                              return null;
                            }
                            
                            return (
                              <div 
                                key={`existing-${index}`} 
                                className="relative rounded-md overflow-hidden h-24 bg-gray-100 group"
                              >
                                <img 
                                  src={imageUrl.startsWith('http') ? imageUrl : `/uploads/properties/${imageUrl}`} 
                                  alt={`Property image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Try alternate path if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    if (!target.src.includes('/public/')) {
                                      target.src = `/public/uploads/properties/${imageUrl}`;
                                    } else {
                                      // If still fails, use a placeholder
                                      target.src = 'https://placehold.co/300x200?text=Image+Not+Found';
                                    }
                                  }}
                                />
                                {/* Large, more visible delete button */}
                                <button 
                                  type="button"
                                  onClick={() => {
                                    // Ultra-simple direct approach - just update state
                                    setKeptImages(prev => prev.filter(img => img !== imageUrl));
                                    // Show toast notification confirming removal
                                    toast({
                                      title: "Image removed",
                                      description: "The image has been removed from the property",
                                      variant: "default"
                                    });
                                  }}
                                  className="absolute top-0 right-0 bg-red-600 text-white p-2 rounded-bl-md shadow-md opacity-90 hover:opacity-100 hover:bg-red-700 transition-opacity z-20"
                                  aria-label="Remove image"
                                  style={{ fontSize: '14px', fontWeight: 'bold' }}
                                >
                                  <span className="flex items-center">
                                    <X className="h-5 w-5 mr-1" /> Delete
                                  </span>
                                </button>
                                {/* Added an overlay to make it clear this image can be interacted with */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity"></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Alternative upload section for all platforms */}
                    {isEditing && propertyId ? (
                      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">Alternative Upload Method</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Having trouble uploading images? Use our simplified uploader that works on all devices:
                        </p>
                        <a
                          href={`/windows-upload.html?propertyId=${propertyId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#B87333] hover:bg-[#964B00] text-white py-2 px-4 rounded text-sm inline-flex items-center"
                          onClick={() => {
                            // Log that the link was clicked
                            console.log(`Alternative upload link clicked for property ${propertyId}`);
                          }}
                        >
                          Open Simplified Uploader
                        </a>
                        <p className="text-xs text-muted-foreground mt-3">
                          This will open a dedicated upload page that works on all devices (Windows, iOS, Android).
                          After uploading, return to this page and refresh to see your images.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-muted/30 border rounded-lg mb-4">
                        <p className="text-sm text-muted-foreground italic">
                          Alternative upload option will be available after saving the property initially.
                        </p>
                      </div>
                    )}
                    
                    {/* Standard Upload Method */}
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">Click to upload new images</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG or JPEG (MAX. 5MB per file)
                          </p>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    
                    {/* Newly Selected Images */}
                    {images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">New Images Selected ({images.length})</p>
                        <ul className="text-xs text-muted-foreground">
                          {Array.from(images).map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured</FormLabel>
                          <FormDescription>
                            Show on featured properties carousel
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isHighlighted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Highlighted</FormLabel>
                          <FormDescription>
                            Show in highlighted section
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isNewListing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">New Listing</FormLabel>
                        <FormDescription>
                          Show in new listings section
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={mutation.isPending || uploading}
            className="bg-[#B87333] hover:bg-[#964B00]"
          >
            {(mutation.isPending || uploading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? "Update Property" : "Create Property"}
          </Button>
        </div>
      </form>
    </Form>
  );
}