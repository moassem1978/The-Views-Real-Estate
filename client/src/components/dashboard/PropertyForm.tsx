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
import { Loader2, Upload } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
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

  // Form setup
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
      address: "",
      bedrooms: 0,
      bathrooms: 0,
      builtUpArea: 0,
      isFeatured: false,
      isHighlighted: false,
      isNewListing: true,
      country: "Egypt", // Default to Egypt
      references: "", // Added default value for references
    },
  });

  // Set form values when property data is loaded
  useEffect(() => {
    if (property && isEditing) {
      console.log("Setting form data for property:", property);
      
      // Handle both camelCase and snake_case property names
      const formData = {
        title: property.title,
        description: property.description,
        propertyType: property.propertyType || property.property_type,
        listingType: property.listingType || property.listing_type,
        price: property.price,
        downPayment: property.downPayment || property.down_payment,
        installmentAmount: property.installmentAmount || property.installment_amount,
        installmentPeriod: property.installmentPeriod || property.installment_period,
        isFullCash: property.isFullCash || property.is_full_cash,
        city: property.city,
        projectName: property.projectName || property.project_name,
        developerName: property.developerName || property.developer_name,
        address: property.address,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        builtUpArea: property.builtUpArea || property.built_up_area,
        isFeatured: property.isFeatured || property.is_featured,
        isHighlighted: property.isHighlighted || property.is_highlighted,
        isNewListing: property.isNewListing || property.is_new_listing,
        country: property.country,
        references: property.references,
        yearBuilt: property.yearBuilt || property.year_built,
        images: property.images
      };
      
      console.log("Form data being set:", formData);
      form.reset(formData);
    }
  }, [property, isEditing, form]);

  // Create or update property mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        // First try to refresh the auth session
        try {
          await apiRequest("POST", "/api/auth/refresh");
          console.log("Authentication refreshed successfully");
        } catch (authError) {
          console.warn("Authentication refresh failed, will try request anyway", authError);
        }
        
        const url = isEditing ? `/api/properties/${propertyId}` : '/api/properties';
        const method = isEditing ? 'PUT' : 'POST';

        // Then, create or update the property
        const response = await apiRequest(method, url, data);
        const result = await response.json();

        // Finally, if there are images to upload, upload them
        if (images.length > 0) {
          await uploadImages(result.id);
        }

        return result;
      } catch (error: any) {
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
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Handle image upload
  const uploadImages = async (propertyId: number) => {
    try {
      setUploading(true);
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await fetch(`/api/upload/property-images/${propertyId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      return await response.json();
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      console.log("Submitting form data:", data);
      // Ensure all numeric fields are parsed as numbers
      const formattedData = {
        ...data,
        price: typeof data.price === 'string' ? parseInt(data.price) : data.price,
        downPayment: typeof data.downPayment === 'string' ? parseInt(data.downPayment) : data.downPayment,
        installmentAmount: typeof data.installmentAmount === 'string' ? parseInt(data.installmentAmount) : data.installmentAmount,
        installmentPeriod: typeof data.installmentPeriod === 'string' ? parseInt(data.installmentPeriod) : data.installmentPeriod,
        bedrooms: typeof data.bedrooms === 'string' ? parseInt(data.bedrooms) : data.bedrooms,
        bathrooms: typeof data.bathrooms === 'string' ? parseInt(data.bathrooms) : data.bathrooms,
        builtUpArea: typeof data.builtUpArea === 'string' ? parseInt(data.builtUpArea) : data.builtUpArea,
      };

      console.log("Formatted data for submission:", formattedData);
      await mutation.mutateAsync(formattedData);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error saving property",
        description: error instanceof Error ? error.message : "Failed to save property data",
        variant: "destructive"
      });
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
                        onValueChange={field.onChange} 
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
                          <SelectItem value="North coast">North Coast</SelectItem>
                          <SelectItem value="Red Sea">Red Sea</SelectItem>
                          <SelectItem value="Dubai">Dubai</SelectItem>
                          <SelectItem value="London">London</SelectItem>
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
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
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
                    {images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">{images.length} file(s) selected</p>
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