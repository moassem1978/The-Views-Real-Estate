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
      developerName: "",
      propertyType: "",
      listingType: "Primary",
      // Removed reference field
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

  // Update form when property data is loaded
  useEffect(() => {
    if (isEditing && propertyData) {
      // CRITICAL FIX: Enhanced handling of existing images
      console.log("Checking existing images in property data:", propertyData.images);

      if (propertyData.images) {
        try {
          // Try to handle various image field formats
          if (Array.isArray(propertyData.images)) {
            // Already an array, use it directly
            console.log(`Found ${propertyData.images.length} images as array`);
            setExistingImages(propertyData.images);
          } else if (typeof propertyData.images === 'string') {
            // String format could be JSON or comma-separated
            if (propertyData.images.includes('[') || propertyData.images.includes('{')) {
              // Likely JSON string, try to parse
              try {
                const parsedImages = JSON.parse(propertyData.images);
                if (Array.isArray(parsedImages)) {
                  console.log(`Parsed ${parsedImages.length} images from JSON string`);
                  setExistingImages(parsedImages);
                } else {
                  // Parsed but not an array - might be an object with image values
                  console.log("Parsed JSON but got non-array result:", parsedImages);
                  const imageValues = typeof parsedImages === 'object' ? 
                                     Object.values(parsedImages).filter(Boolean) : 
                                     [parsedImages].filter(Boolean);
                  console.log(`Extracted ${imageValues.length} images from parsed JSON`);
                  setExistingImages(imageValues);
                }
              } catch (e) {
                console.error("Failed to parse image JSON:", e);
                // Fallback - treat as comma-separated
                if (propertyData.images.includes(',')) {
                  const imageArray = propertyData.images.split(',').map(img => img.trim()).filter(Boolean);
                  console.log(`Split string into ${imageArray.length} comma-separated images`);
                  setExistingImages(imageArray);
                } else {
                  // Single image string
                  console.log("Using single image string");
                  setExistingImages([propertyData.images.trim()]);
                }
              }
            } else if (propertyData.images.includes(',')) {
              // Simple comma-separated list
              const imageArray = propertyData.images.split(',').map(img => img.trim()).filter(Boolean);
              console.log(`Split string into ${imageArray.length} comma-separated images`);
              setExistingImages(imageArray);
            } else if (propertyData.images.trim()) {
              // Single image URL
              console.log("Using single image URL");
              setExistingImages([propertyData.images.trim()]);
            }
          }
        } catch (error) {
          console.error("Error processing existing images:", error);
          setExistingImages([]);
        }
      } else {
        console.log("No existing images found");
        setExistingImages([]);
      }

      // Update form values with property data
      console.log("Loading property data for editing:", propertyData);

      form.reset({
        title: propertyData.title || "",
        description: propertyData.description || "",
        city: propertyData.city || "",
        state: propertyData.state || "",
        projectName: propertyData.projectName || "",
        developerName: propertyData.developerName || "",
        propertyType: propertyData.propertyType || "",
        listingType: propertyData.listingType || "Primary",
        // Reference field completely removed
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

  // Create/Update property mutation
  const mutation = useMutation({
    mutationFn: async (data: Partial<Property>) => {
      console.log(`Submitting ${isEditing ? 'update' : 'create'} for property:`, data);
      if (isEditing) {
        return await apiRequest("PATCH", `/api/properties/${propertyId}`, data);
      } else {
        return await apiRequest("POST", "/api/properties", data);
      }
    },
    onSuccess: () => {
      console.log(`Property ${isEditing ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}`] });
      }
    },
    onError: (error) => {
      console.error("Property mutation error:", error);
    }
  });

  // Handle form submission
  const onSubmit = async (data: any) => {
    
    try {
      console.log("Form submission started for property:", propertyId || "new");
      
      // Clean data and set defaults
      const cleanData = {
        ...data,
        city: data.city === "none" ? "" : data.city,
        country: data.country === "none" ? "Egypt" : data.country,
        propertyType: data.propertyType === "none" ? "apartment" : data.propertyType?.toLowerCase(),
        listingType: data.listingType === "none" ? "Primary" : data.listingType,
        projectName: data.projectName === "none" ? "" : data.projectName,
        state: data.state || data.city,
        address: data.address || data.projectName
      };

      console.log("Submitting cleaned property data:", cleanData);

      // Step 1: Save/update property
      const response = await mutation.mutateAsync(cleanData);
      const propertyResult = await response.json();
      const savedPropertyId = isEditing ? propertyId : propertyResult.id;

      console.log(`Property ${isEditing ? 'updated' : 'created'} with ID:`, savedPropertyId);

      // Step 2: Handle images if any
      let finalImageUrls = [...(existingImages || [])];

      if (images.length > 0) {
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append('propertyId', savedPropertyId.toString());
          images.forEach(image => formData.append('images', image));

          const uploadResponse = await fetch('/api/upload/property-images-direct', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status}`);
          }

          const uploadResult = await uploadResponse.json();
          const newImageUrls = uploadResult.fileUrls || uploadResult.imageUrls || [];
          finalImageUrls = [...finalImageUrls, ...newImageUrls];
          
          console.log(`Uploaded ${newImageUrls.length} new images`);
        } finally {
          setUploading(false);
        }
      }

      // Step 3: Update property with final image list
      if (finalImageUrls.length > 0) {
        await apiRequest("PATCH", `/api/properties/${savedPropertyId}`, {
          images: finalImageUrls
        });
        console.log(`Updated property with ${finalImageUrls.length} images`);
      }

      // Success
      toast({
        title: isEditing ? "Property updated" : "Property created",
        description: "Property saved successfully"
      });

      if (onSuccess) {
        setTimeout(onSuccess, 500);
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
        <div className="text-destructive text-center">
          <h3 className="text-lg font-medium">Error Loading Property</h3>
          <p>{propertyError instanceof Error ? propertyError.message : "Failed to load property details"}</p>
        </div>
        <Button variant="outline" onClick={onCancel}>Go Back</Button>
      </div>
    );
  }

  // Custom form submit handler to prevent page reloads
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit(onSubmit)();
  };

  // Render form
  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-8 overflow-y-auto max-h-[80vh]">
        {/* Form header with buttons */}
        <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-4 border-b">
          <h2 className="text-xl font-semibold">{isEditing ? "Edit Property" : "Add New Property"}</h2>
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={mutation.isPending || uploading}
              className="bg-[#B87333] hover:bg-[#9e612c] text-white"
            >
              {(mutation.isPending || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Property" : "Create Property"}
            </Button>
          </div>
        </div>

        {/* Main form content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
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

            {/* Reference number field removed */}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter property description" 
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
                        <SelectItem value="Zayed">Zayed/6th October</SelectItem>
                        <SelectItem value="North coast">North Coast</SelectItem>
                        <SelectItem value="Red Sea">Red Sea</SelectItem>
                        <SelectItem value="Dubai">Dubai</SelectItem>
                        <SelectItem value="London">London</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                        <SelectItem value="none">Select a country</SelectItem>
                        <SelectItem value="Egypt">Egypt</SelectItem>
                        <SelectItem value="UAE">UAE</SelectItem>
                        <SelectItem value="UK">UK</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
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
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} required />
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
                      <Input placeholder="Enter developer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="none">Select a property type</SelectItem>
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
                        <SelectItem value="none">Select a listing type</SelectItem>
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
                      <Input type="number" {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))} 
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
                      <Input type="number" {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))} 
                        required 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (L.E)*</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))} 
                        required 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="builtUpArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Built-up Area (m²)*</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))} 
                        required 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Show payment details for Primary properties */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="downPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Down Payment (L.E)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      For primary listings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installmentPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installment Period (months)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      For primary listings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plotSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plot Size (m²)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      For villas and townhouses
                    </FormDescription>
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
                      <Input type="number" {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      For ground floor units
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor Number</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      For apartments
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Property flags section */}
            <Card className="mt-4">
              <CardContent className="pt-4 grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Property</FormLabel>
                        <FormDescription>
                          Show on homepage
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
                  name="isNewListing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>New Listing</FormLabel>
                        <FormDescription>
                          Mark as newly added
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Highlighted</FormLabel>
                        <FormDescription>
                          Priority in listings
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
                  name="isGroundUnit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Ground Unit</FormLabel>
                        <FormDescription>
                          Has garden access
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
                  name="isFullCash"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Full Cash</FormLabel>
                        <FormDescription>
                          No installments
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
              </CardContent>
            </Card>

            {/* Image Upload Section */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Property Images</h3>

              {/* Image upload button */}
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer hover:border-gray-400 transition-colors" onClick={() => document.getElementById('image-upload')?.click()}>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <div className="flex flex-col items-center text-gray-500">
                  <Upload className="h-10 w-10 mb-2" />
                  <p className="text-sm">Click or drag images here to upload</p>
                  <p className="text-xs mt-1">Maximum 10 images, 25MB each</p>
                </div>
              </div>

              {/* Preview of selected images */}
              {images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">New Images to Upload:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((image, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`Preview ${index}`} 
                          className="w-full h-24 object-cover rounded-md"
                          onClick={() => handlePreview(URL.createObjectURL(image))}
                        />
                        <button 
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          onClick={() => removeSelectedImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing images (when editing) */}
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Existing Images:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((image, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img 
                          src={image} 
                          alt={`Existing ${index}`} 
                          className="w-full h-24 object-cover rounded-md"
                          onClick={() => handlePreview(image)}
                        />
                        <button 
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          onClick={() => removeExistingImage(index)}
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
        </div>
      </form>
    </Form>
  );
}