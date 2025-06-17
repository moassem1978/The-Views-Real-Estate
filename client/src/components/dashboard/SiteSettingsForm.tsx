import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Interface for site settings
interface SiteSettings {
  companyName: string;
  companyLogo?: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  // Extended contact details (owner-only fields)
  businessAddress?: string;
  businessHours?: string;
  emergencyContact?: string;
  whatsappNumber?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

// Form schema for site settings
const siteSettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").optional().or(z.literal("")),
  facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
});

// Contact details form schema (only for owner)
const contactDetailsSchema = z.object({
  businessAddress: z.string().optional().or(z.literal("")),
  businessHours: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
  whatsappNumber: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof siteSettingsSchema>;
type ContactFormValues = z.infer<typeof contactDetailsSchema>;

export default function SiteSettingsForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  
  // Fetch current site settings
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
  });
  
  // Form setup for regular settings
  const form = useForm<FormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      companyName: settings?.companyName || "",
      contactEmail: settings?.contactEmail || "",
      contactPhone: settings?.contactPhone || "",
      primaryColor: settings?.primaryColor || "",
      facebook: settings?.socialLinks?.facebook || "",
      twitter: settings?.socialLinks?.twitter || "",
      instagram: settings?.socialLinks?.instagram || "",
      linkedin: settings?.socialLinks?.linkedin || "",
    },
  });
  
  // Form setup for contact details (owner only)
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: {
      businessAddress: settings?.businessAddress || "",
      businessHours: settings?.businessHours || "",
      emergencyContact: settings?.emergencyContact || "",
      whatsappNumber: settings?.whatsappNumber || "",
    },
  });
  
  // Update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        companyName: settings.companyName || "",
        contactEmail: settings.contactEmail || "",
        contactPhone: settings.contactPhone || "",
        primaryColor: settings.primaryColor || "",
        facebook: settings.socialLinks?.facebook || "",
        twitter: settings.socialLinks?.twitter || "",
        instagram: settings.socialLinks?.instagram || "",
        linkedin: settings.socialLinks?.linkedin || "",
      });
      
      // Also update contact form if owner
      if (isOwner) {
        contactForm.reset({
          businessAddress: settings.businessAddress || "",
          businessHours: settings.businessHours || "",
          emergencyContact: settings.emergencyContact || "",
          whatsappNumber: settings.whatsappNumber || "",
        });
      }
    }
  }, [settings, form, contactForm, isOwner]);
  
  // Mutation to update site settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Transform form data into the correct structure for the API
      const formattedData = {
        companyName: data.companyName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        primaryColor: data.primaryColor,
        socialLinks: {
          facebook: data.facebook,
          twitter: data.twitter,
          instagram: data.instagram,
          linkedin: data.linkedin,
        }
      };
      
      const res = await apiRequest("PATCH", "/api/site-settings", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
      toast({
        title: "Settings Updated",
        description: "Site settings have been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to update contact details (owner only)
  const updateContactDetailsMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const res = await apiRequest("PATCH", "/api/site-settings", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
      toast({
        title: "Contact Details Updated",
        description: "Company contact details have been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update contact details: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: FormValues) => {
    updateSettingsMutation.mutate(data);
  };
  
  // Handle contact form submission (owner only)
  const onContactSubmit = (data: ContactFormValues) => {
    if (!isOwner) {
      toast({
        title: "Permission Denied",
        description: "Only the owner can update contact details.",
        variant: "destructive",
      });
      return;
    }
    
    updateContactDetailsMutation.mutate(data);
  };
  
  // Enhanced logo upload with improved error handling and logging
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected for logo upload');
      return;
    }
    
    console.log('Logo upload initiated:', { fileName: file.name, fileType: file.type, fileSize: `${(file.size / 1024).toFixed(2)} KB` });
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPG, PNG, SVG, etc.).",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      console.error('File too large:', `${(file.size / 1024 / 1024).toFixed(2)} MB`);
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      setIsUploading(true);
      console.log('Starting logo upload to server...');
      
      // Upload the logo with improved error handling
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });
      
      // Check for server errors with detailed logging
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Logo upload failed:', { 
          status: response.status, 
          statusText: response.statusText,
          responseBody: errorText
        });
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Logo upload successful, received:', result);
      
      // Update site settings with new logo path
      if (result && result.logoUrl) {
        console.log('Updating site settings with new logo path:', result.logoUrl);
        
        // Update site settings with new logo path using separate API call
        const updateResponse = await apiRequest("PATCH", "/api/site-settings", {
          companyLogo: result.logoUrl
        });
        
        if (!updateResponse.ok) {
          console.error('Failed to update site settings with new logo');
          throw new Error('Failed to update settings with new logo');
        }
        
        toast({
          title: "Logo Updated",
          description: "Company logo has been successfully updated.",
        });
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
      } else {
        console.error('Missing logo URL in server response:', result);
        throw new Error('Server response missing logo URL');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#B87333]" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Company Logo</CardTitle>
          <CardDescription>
            Upload and manage your company logo that will appear across the site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative h-28 w-28 rounded-md border overflow-hidden bg-muted">
              {settings?.companyLogo ? (
                <img loading="lazy" 
                  src={getImageUrl(settings.companyLogo)}
                  alt="Company Logo" 
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    console.error('Logo failed to load:', settings.companyLogo);
                    e.currentTarget.onerror = null; // Prevent infinite error loop
                    e.currentTarget.src = '/placeholder-logo.svg';
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  No Logo
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">
                Upload New Logo
              </label>
              <div className="flex items-center">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                  className="max-w-xs"
                />
                {isUploading && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Recommended size: 200x200px. PNG or JPG.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* General Settings Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Update your company's basic information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="The Views Real Estate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input {...field} placeholder="#B87333" />
                        </FormControl>
                        <div 
                          className="h-10 w-10 rounded-md border" 
                          style={{ backgroundColor: field.value || '#B87333' }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="info@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+20 123 456 7890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Add your company's social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://facebook.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://instagram.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://twitter.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://linkedin.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={updateSettingsMutation.isPending}
              className="bg-[#B87333] hover:bg-[#964B00]"
            >
              {updateSettingsMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
      
      {/* Extended Contact Details (Owner Only) */}
      <Card className={isOwner ? "" : "opacity-70"}>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Extended Contact Details
              {!isOwner && <Lock className="h-4 w-4" />}
            </CardTitle>
            <CardDescription>
              Additional contact information for business operations
            </CardDescription>
          </div>
        </CardHeader>
        
        {!isOwner ? (
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Restricted Access</AlertTitle>
              <AlertDescription>
                Only the owner account can edit these extended contact details.
              </AlertDescription>
            </Alert>
          </CardContent>
        ) : (
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit(onContactSubmit)}>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={contactForm.control}
                  name="businessAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 Main St, Cairo, Egypt" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="businessHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Hours</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Mon-Fri: 9AM-5PM, Sat: 10AM-2PM" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+20 123 456 7890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+20 123 456 7890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="col-span-2 flex justify-end mt-4">
                  <Button 
                    type="submit" 
                    disabled={updateContactDetailsMutation.isPending}
                    className="bg-[#B87333] hover:bg-[#964B00]"
                  >
                    {updateContactDetailsMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Contact Details
                  </Button>
                </div>
              </CardContent>
            </form>
          </Form>
        )}
      </Card>
    </div>
  );
}