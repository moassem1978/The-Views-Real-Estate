import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DirectUploaderProps {
  onUploadSuccess: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
}

const DirectUploader: React.FC<DirectUploaderProps> = ({ 
  onUploadSuccess, 
  maxFiles = 10,
  label = "Upload Images" 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);

      if (selectedFiles.length > maxFiles) {
        toast({
          title: "Too Many Files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive",
        });
        return;
      }

      setFiles(selectedFiles);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch('/api/upload/bypass', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.imageUrls?.[0]) {
      throw new Error('No URL returned from server');
    }

    return result.imageUrls[0];
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const urls: string[] = [];
    let failedUploads = 0;

    try {
      for (const file of files) {
        try {
          const url = await uploadFile(file);
          urls.push(url);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          failedUploads++;
        }
      }

      if (urls.length > 0) {
        onUploadSuccess(urls);
        setFiles([]);

        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${urls.length} files${failedUploads ? ` (${failedUploads} failed)` : ''}`,
          variant: failedUploads ? "warning" : "default",
        });
      } else {
        throw new Error("All uploads failed");
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-2">{label}</h3>

      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {files.length > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            {files.length} file(s) selected
          </p>
        )}
      </div>

      <Button 
        onClick={handleUpload}
        disabled={isUploading || files.length === 0}
        className="w-full"
      >
        {isUploading ? "Uploading..." : "Upload Files"}
      </Button>
    </div>
  );
};

export default DirectUploader;
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface DirectUploaderProps {
  onUploadComplete?: (urls: string[]) => void;
  propertyId?: number;
}

export default function DirectUploader({ onUploadComplete, propertyId }: DirectUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    Array.from(e.target.files).forEach(file => {
      formData.append('images', file);
    });

    if (propertyId) {
      formData.append('propertyId', propertyId.toString());
    }

    try {
      const response = await fetch('/api/upload/property-images-direct', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      if (data.success && data.imageUrls) {
        toast({
          title: "Upload successful",
          description: `Uploaded ${data.imageUrls.length} images`,
        });
        
        if (onUploadComplete) {
          onUploadComplete(data.imageUrls);
        }
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
      />
      <Button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        variant="outline"
      >
        {uploading ? 'Uploading...' : 'Upload Images'}
      </Button>
    </div>
  );
}
