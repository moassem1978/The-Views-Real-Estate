
import { PropertyPhoto } from "../../shared/schema";

export function convertImagesToPhotos(images: string[], propertyTitle?: string): PropertyPhoto[] {
  return images.map((imageUrl, index) => {
    const filename = imageUrl.split('/').pop() || `image_${index + 1}`;
    const altText = propertyTitle 
      ? `${propertyTitle} - Image ${index + 1}`
      : `Property Image ${index + 1}`;
    
    return {
      filename: imageUrl,
      altText,
      uploadedAt: new Date().toISOString()
    };
  });
}

export function convertPhotosToImages(photos: PropertyPhoto[]): string[] {
  return photos.map(photo => photo.filename);
}

export function generatePhotoAltText(propertyTitle: string, photoIndex: number, roomType?: string): string {
  if (roomType) {
    return `${roomType} - ${propertyTitle}`;
  }
  return `${propertyTitle} - Image ${photoIndex + 1}`;
}

export function createPhotoObject(
  filename: string, 
  altText: string, 
  fileSize?: number, 
  mimeType?: string
): PropertyPhoto {
  return {
    filename,
    altText,
    uploadedAt: new Date().toISOString(),
    fileSize,
    mimeType
  };
}
