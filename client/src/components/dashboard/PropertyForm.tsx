import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Property } from "../../types";
import { apiRequest } from "../../lib/queryClient";
import { Input } from "@/components/ui/input";
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
import { Loader2, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
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
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const isEditing = !!propertyId;
  
  // Form definition with default values
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      city: "",
      state: "",
      projectName: "",
      propertyType: "",
      listingType: "Primary",
      price: 0,
      downPayment: 0,
      installmentAmount: 0,
      installmentPeriod: 0,
      bedrooms: 0,
      bathrooms: 0,
      builtUpArea: 0,
      plotSize: 0,
      gardenSize: 0, 
      floor: 0,
      isFeatured: false,
      isNewListing: true,
      isHighlighted: false,
      isGroundUnit: false,
      isFullCash: false,
      country: "Egypt",
    }
  });
  
  // Fetch available projects for dropdown
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    enabled: true,
  });

  // Fetch property data if in edit mode
  const {
    data: propertyData,
    isLoading: isLoadingProperty,
    error: propertyError,
  } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId || 0}`],
    enabled: isEditing && !!propertyId,
  });

  // Set up scroll handler for modal
  useEffect(() => {
    // Ensure modal content is scrollable
    const modalContent = document.querySelector('[role="dialog"]');
    if (modalContent) {
      modalContent.classList.add('modal-scrollable');
    }
    return () => {
      if (modalContent) {
        modalContent.classList.remove('modal-scrollable');
      }
    };
  }, []);
  
  // Update form when property data is loaded
  useEffect(() => {
    if (isEditing && propertyData) {
      // Load existing images if any
      if (propertyData.images && Array.isArray(propertyData.images)) {
        setExistingImages(propertyData.images);
      }
      
      // Update form values with property data
      form.reset({
        title: propertyData.title || "",
        description: propertyData.description || "",
        city: propertyData.city || "",
        state: propertyData.state || "",
        projectName: propertyData.projectName || "",
        propertyType: propertyData.propertyType || "",
        listingType: propertyData.listingType || "Primary",
        reference: propertyData.reference || propertyData.references || "",
        price: propertyData.price || 0,
        downPayment: propertyData.downPayment || 0,
        installmentAmount: propertyData.installmentAmount || 0,
        installmentPeriod: propertyData.installmentPeriod || 0,
        bedrooms: propertyData.bedrooms || 0,
        bathrooms: propertyData.bathrooms || 0,
        builtUpArea: propertyData.builtUpArea || 0,
        plotSize: propertyData.plotSize || 0,
        gardenSize: propertyData.gardenSize || 0,
        floor: propertyData.floor || 0,
        isFeatured: propertyData.isFeatured || false,
        isNewListing: propertyData.isNewListing || false,
        isHighlighted: propertyData.isHighlighted || false,
        isGroundUnit: propertyData.isGroundUnit || false,
        isFullCash: propertyData.isFullCash || false,
        country: propertyData.country || "Egypt",
      });
    }
  }, [isEditing, propertyData, form]);
  
  // Image handlers with preview functionality
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Add new files to the existing ones instead of replacing them
      const newFiles = Array.from(e.target.files as FileList);
      setImages(prevImages => [...prevImages, ...newFiles]);
      
      // Reset the file input to allow selecting more files later
      e.target.value = '';
    }
  };
  
  // Image preview functionality
  const handlePreview = (image: string) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };
  
  // Close image preview
  const handlePreviewClose = () => {
    setPreviewVisible(false);
  };
  
  // Remove a selected image before upload with X button
  const removeSelectedImage = (index: number) => {
    setImages(prevImages => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Remove an existing image with X button
  const removeExistingImage = (index: number) => {
    setExistingImages(prevImages => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Fetch available projects for dropdown
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    enabled: true,
  });

  // Fetch property data if in edit mode - always declaring the query but conditionally enabling it
  const {
    data: propertyData,
    isLoading: isLoadingProperty,
    error: propertyError,
  } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId || 0}`], // Use 0 as fallback to avoid undefined
    enabled: isEditing && !!propertyId, // Only run query when in edit mode with valid ID
  });

  // Get initial form values based on editing mode
  const getInitialValues = () => {
    // If editing and data is available, use property data
    if (isEditing && propertyData) {
      return {
        title: propertyData.title || "",
        description: propertyData.description || "",
        city: propertyData.city || "",
        state: propertyData.state || "",
        projectName: propertyData.projectName || "",
        propertyType: propertyData.propertyType || "",
        listingType: propertyData.listingType || "Primary",
        reference: propertyData.reference || propertyData.references || "",
        price: propertyData.price || 0,
        downPayment: propertyData.downPayment || 0,
        installmentAmount: propertyData.installmentAmount || 0,
        installmentPeriod: propertyData.installmentPeriod || 0,
        bedrooms: propertyData.bedrooms || 0,
        bathrooms: propertyData.bathrooms || 0,
        builtUpArea: propertyData.builtUpArea || 0,
        plotSize: propertyData.plotSize || 0,
        gardenSize: propertyData.gardenSize || 0,
        floor: propertyData.floor || 0,
        isFeatured: propertyData.isFeatured || false,
        isNewListing: propertyData.isNewListing || false,
        isHighlighted: propertyData.isHighlighted || false,
        isGroundUnit: propertyData.isGroundUnit || false,
        isFullCash: propertyData.isFullCash || false,
        country: propertyData.country || "Egypt",
      };
    }
    // Otherwise return default values
    return {
      title: "",
      description: "",
      city: "",
      state: "",
      projectName: "",
      propertyType: "",
      listingType: "Primary",
      reference: "",
      price: 0,
      downPayment: 0,
      installmentAmount: 0,
      installmentPeriod: 0,
      bedrooms: 0,
      bathrooms: 0,
      builtUpArea: 0,
      plotSize: 0,
      gardenSize: 0,
      floor: 0,
      isFeatured: false,
      isNewListing: true,
      isHighlighted: false,
      isGroundUnit: false,
      isFullCash: false,
      country: "Egypt",
    };
  };

  // Update form with existing property data when editing
  useEffect(() => {
    if (isEditing && propertyData) {
      // Load existing images if any
      if (propertyData.images && Array.isArray(propertyData.images)) {
        setExistingImages(propertyData.images);
      }
      
      // Reset form values
      form.reset(getInitialValues());
    }
  }, [isEditing, propertyData, form]);

  // Create/Update property mutation
  const mutation = useMutation({
    mutationFn: async (data: Partial<Property>) => {
      try {
        if (isEditing && propertyId) {
          return await apiRequest("PUT", `/api/properties/${propertyId}`, data);
        } else {
          return await apiRequest("POST", "/api/properties", data);
        }
      } catch (error) {
        console.error("Mutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate properties cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      // Ensure state matches city if not already set
      if (!data.state && data.city) {
        data.state = data.city;
      }
      
      // Backend requires an address - use project name as address if not provided
      if (!data.address && data.projectName) {
        data.address = data.projectName;
      }
      
      // Map the reference field to references (which is what the backend expects)
      if (data.reference) {
        data.references = data.reference;
      }
      
      console.log("Sending property data with reference:", data.reference);
      console.log("References field value:", data.references);
      
      // Step 1: Save property data first
      const response = await mutation.mutateAsync(data);
      const property = await response.json();
      
      // Get the property ID (either from the saved property or existing ID)
      const savedPropertyId = isEditing ? propertyId : property.id;
      
      // Step 2: Handle image uploads and existing images
      if (images.length > 0) {
        try {
          setUploading(true);
          console.log(`Uploading ${images.length} images for property ${savedPropertyId}`);
          
          // Create FormData
          const formData = new FormData();
          
          // Add property ID to help the server associate images with the right property
          formData.append('propertyId', savedPropertyId.toString());
          
          // Log what we're doing
          console.log(`Uploading ${images.length} images for property ID: ${savedPropertyId}`);
          
          // Add each image to the form data
          images.forEach((image, idx) => {
            console.log(`Adding image ${idx + 1}/${images.length}: ${image.name} (${Math.round(image.size/1024)}KB)`);
            formData.append('images', image);
          });
          
          // Use direct upload endpoint which doesn't require authentication
          const response = await fetch(`/api/upload/property-images-direct`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`Image upload failed: ${response.status}`);
          }
          
          const result = await response.json();
          console.log(`Response from server:`, result);
          
          if (result.success && result.imageUrls) {
            console.log(`Successfully uploaded ${result.imageUrls.length} images`);
            
            // Get the new image URLs from the response
            const newImageUrls = result.imageUrls || [];
            console.log(`New image URLs:`, newImageUrls);
            
            // Make sure existingImages is an array
            const existingImgs = Array.isArray(existingImages) ? existingImages : [];
            console.log(`Existing images: ${existingImgs.length}`);
            
            // Combine existing images with newly uploaded ones - ensure no duplicates
            const combinedImages = [...existingImgs];
            
            // Add each new image URL if it's not already in the array
            newImageUrls.forEach((url: string) => {
              if (!combinedImages.includes(url)) {
                combinedImages.push(url);
              }
            });
            
            console.log(`Combined image count: ${combinedImages.length}`);
            
            // Ensure we're working with an actual property ID
            if (savedPropertyId && typeof savedPropertyId === 'number' && savedPropertyId > 0) {
              console.log(`Updating property ${savedPropertyId} with ${combinedImages.length} total images`);
              
              // Update the property with all images
              await apiRequest("PATCH", `/api/properties/${savedPropertyId}`, {
                images: combinedImages
              });
              
              console.log(`Successfully updated property ${savedPropertyId} with images`);
            } else {
              console.error(`Invalid property ID: ${savedPropertyId}`);
            }
          } else {
            console.error(`Image upload response did not indicate success:`, result);
          }
          
        } catch (error) {
          console.error("Error uploading images:", error);
          toast({
            title: "Warning",
            description: "Property was saved but some images failed to upload.",
            variant: "destructive"
          });
        } finally {
          setUploading(false);
        }
      } else if (isEditing) {
        // If editing with or without existing images
        try {
          // Handle the case where we're only modifying existing images (e.g., removing some)
          // or where there are no images at all
          console.log(`Editing property ${savedPropertyId}${existingImages.length > 0 ? ` with ${existingImages.length} existing images` : ' (no images)'}`);
          
          // Make sure we're not saving empty image paths
          const validImages = Array.isArray(existingImages) 
            ? existingImages.filter(img => img && typeof img === 'string' && img.trim() !== '')
            : [];
          
          // Log what we're doing
          console.log(`Saving ${validImages.length} valid image paths for property ${savedPropertyId}`);
          
          // Even if there are no images, update the property to ensure any removed images are cleared
          await apiRequest("PATCH", `/api/properties/${savedPropertyId}`, {
            images: validImages
          });
          
          console.log(`Successfully updated property ${savedPropertyId} with ${validImages.length} images`);
        } catch (error) {
          console.error("Error updating property images:", error);
          toast({
            variant: "destructive",
            title: "Error updating property images",
            description: error instanceof Error ? error.message : "Failed to update property images"
          });
          return; // Don't close the form on error
        }
      }
      
      // Success notification
      toast({
        title: isEditing ? "Property updated" : "Property created",
        description: "Your property has been saved successfully.",
        variant: "default"
      });
      
      // Only close the form after all operations have completed successfully
      if (onSuccess) {
        // Small delay to ensure toast is visible
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
      
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save property",
        variant: "destructive"
      });
    }
  };

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
          We encountered a problem loading this property information. Please try again.
        </p>
        <Button onClick={onCancel} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  // Watch listing type to conditionally render fields
  const listingType = form.watch('listingType');
  const isResale = listingType === 'Resale';
  
  // Watch city and update state field automatically
  const city = form.watch('city');
  useEffect(() => {
    if (city) {
      // Set state to match city - required for database validation
      form.setValue('state', city);
    }
  }, [city, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 modal-dialog-body">
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
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter reference number" {...field} required />
                      </FormControl>
                      <FormDescription>
                        This is your property's unique reference number
                      </FormDescription>
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
                            <SelectItem value="">Select a property type</SelectItem>
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
                            <SelectItem value="">Select a listing type</SelectItem>
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
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Select a city</SelectItem>
                          <SelectItem value="Cairo">Cairo</SelectItem>
                          <SelectItem value="Zayed">Zayed</SelectItem>
                          <SelectItem value="North coast">North Coast</SelectItem>
                          <SelectItem value="Red Sea">Red Sea</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Hidden state field that gets set based on city */}
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <Input 
                        type="hidden"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country*</FormLabel>
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
                          <SelectItem value="none">Select a country</SelectItem>
                          <SelectItem value="Egypt">Egypt</SelectItem>
                          <SelectItem value="UAE">UAE</SelectItem>
                          <SelectItem value="UK">UK</SelectItem>
                        </SelectContent>
                      </Select>
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
              </div>
            </CardContent>
          </Card>

          {/* Pricing Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Pricing</h3>

              <div className="space-y-4">
                {/* Basic price field for all listings */}
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
                
                {/* Primary listing fields */}
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
                          <FormLabel>Installment Period (years)</FormLabel>
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
                
                {/* Payment type switch */}
                <FormField
                  control={form.control}
                  name="isFullCash"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Full Cash Payment</FormLabel>
                        <FormDescription>
                          Property requires full cash payment
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

          {/* Features Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Features</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plotSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plot Size (m²)</FormLabel>
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
                    name="gardenSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Garden Size (m²)</FormLabel>
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
                </div>

                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
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
                  name="isGroundUnit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Ground Floor Unit
                        </FormLabel>
                        <FormDescription>
                          This property is on the ground floor
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Display Options</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Featured Property
                        </FormLabel>
                        <FormDescription>
                          Show in the featured properties section
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isNewListing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          New Listing
                        </FormLabel>
                        <FormDescription>
                          Show in the new properties section
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isHighlighted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Highlighted Property
                        </FormLabel>
                        <FormDescription>
                          Show in the highlighted section on homepage
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images Upload */}
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Property Images</h3>
              
              {/* Existing images display */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <Label className="mb-2 block">Existing Images</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {existingImages.map((image, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New images input using DirectUploader */}
              <div className="space-y-4">
                <div>
                  <Label>Add New Images</Label>
                  <div className="mt-2">
                    <DirectUploader
                      propertyId={propertyId}
                      onUploadComplete={(urls) => {
                        if (urls && urls.length > 0) {
                          // Combine with existing images
                          const allImages = [...existingImages, ...urls];
                          setExistingImages(allImages);
                          form.setValue('images', allImages);
                        }
                      }}
                    />
                  </div>
                  
                  {/* Selected new images preview */}
                  {images.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Selected Images</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {Array.from(images).map((image, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload preview ${index + 1}`}
                              className="h-24 w-24 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeSelectedImage(index)}
                              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-6 sticky bottom-0 pt-4 pb-2 bg-background">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
                  onCancel();
                }
              }}
              className="border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={uploading || mutation.isPending}
            className="bg-[#B87333] hover:bg-[#964B00] text-white font-medium"
          >
            {(uploading || mutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? "Update Property" : "Create Property"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
