import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SimpleWindowsUploaderProps {
  propertyId: number;
  onSuccess?: (imageUrls: string[]) => void;
}

/**
 * A simplified Windows-specific file uploader using native DOM manipulations
 * instead of React-specific features to maximize compatibility.
 */
export default function SimpleWindowsUploader({ propertyId, onSuccess }: SimpleWindowsUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  // Handle the core upload functionality
  const handleUpload = async (files: FileList) => {
    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    console.log(`Windows upload: Starting upload of ${files.length} files for property ID ${propertyId}`);
    
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Append all files to the form data
      Array.from(files).forEach(file => {
        console.log(`Windows upload: Adding file: ${file.name} (${file.size} bytes)`);
        formData.append('files', file);
      });
      
      // Add the property ID in multiple places for redundancy
      formData.append('propertyId', propertyId.toString());
      
      // Show upload toast
      toast({
        title: "Uploading images...",
        description: `Uploading ${files.length} files, please wait...`,
      });
      
      // Use simple fetch with minimal headers
      const response = await fetch(`/api/upload/windows?propertyId=${propertyId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Property-Id': propertyId.toString()
        }
      });
      
      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Windows upload failed: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Windows upload response:', result);
      
      // Show success toast
      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${result.count || 0} images`,
        variant: "default"
      });
      
      // Call success callback if provided
      if (onSuccess && result.imageUrls && result.imageUrls.length) {
        onSuccess(result.imageUrls);
      }
      
      return result;
    } catch (error) {
      console.error('Windows upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="windows-uploader mb-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Windows Upload Option</h3>
        <p className="text-xs text-muted-foreground mb-3">
          This simplified option is designed for Windows users who may experience issues with the standard uploader.
        </p>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="windows-special-uploader"
            className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#B87333]/10 file:text-[#B87333] hover:file:bg-[#B87333]/20"
            multiple
            accept="image/*"
          />
          
          <Button
            type="button"
            disabled={uploading}
            onClick={() => {
              const fileInput = document.getElementById('windows-special-uploader') as HTMLInputElement;
              if (fileInput && fileInput.files && fileInput.files.length > 0) {
                handleUpload(fileInput.files);
              } else {
                toast({
                  title: "No files selected",
                  description: "Please select at least one image first",
                  variant: "destructive"
                });
              }
            }}
            className="bg-[#B87333] hover:bg-[#964B00] text-white"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Images"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}