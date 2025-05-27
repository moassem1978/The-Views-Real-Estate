import fs from 'fs';
import path from 'path';
import util from 'util';

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

/**
 * Enhanced image finder with multiple fallback strategies for Windows uploaded images
 */
export class ImageMatcher {
  private uploadDirs: string[] = [
    './public/uploads/properties',
    './public/uploads/announcements',
    './public/uploads/projects',
    './public/uploads/logos',
    './public/uploads',
    './uploads/properties',
    './uploads/announcements',
    './uploads/projects',
    './uploads/logos',
    './uploads',
    './'
  ];

  /**
   * Attempts to find the actual file path for an image using multiple strategies
   */
  async findActualImagePath(requestedPath: string): Promise<string | null> {
    console.log(`Enhanced file access request for: ${requestedPath}`);
    
    // Clean up the requested path
    const cleanPath = this.normalizeAndCleanPath(requestedPath);
    
    // If path points to an existing file, return it immediately
    if (fs.existsSync(cleanPath)) {
      console.log(`Direct file match found: ${cleanPath}`);
      return cleanPath;
    }
    
    // Extract the filename from the path
    const filename = path.basename(cleanPath);
    
    // Try to find the file using exact, fuzzy, and content-based matching
    let bestMatch = await this.attemptFuzzyMatching(filename);
    
    if (bestMatch) {
      console.log(`Found matching file: ${bestMatch}`);
      return bestMatch;
    }
    
    console.log(`No match found for ${filename}`);
    return null;
  }
  
  /**
   * Normalize and clean a file path
   */
  private normalizeAndCleanPath(filePath: string): string {
    // Replace Windows backslashes with forward slashes
    let cleanPath = filePath.replace(/\\/g, '/');
    
    // Remove any URL parameters
    cleanPath = cleanPath.split('?')[0];
    
    // Remove leading slash if present
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    // Remove "./public" prefix if present (since public is served at root)
    if (cleanPath.startsWith('public/')) {
      cleanPath = cleanPath.replace('public/', '');
    }
    
    // Add back the public directory for server-side file operations
    if (!cleanPath.startsWith('./') && !cleanPath.startsWith('public/')) {
      cleanPath = `./public/${cleanPath}`;
    }
    
    return cleanPath;
  }
  
  /**
   * Attempt to find a matching file using fuzzy matching techniques
   */
  private async attemptFuzzyMatching(filename: string): Promise<string | null> {
    console.log(`Attempting enhanced fuzzy matching for: ${filename}`);
    
    // Try to extract hash from filename if it looks like a hash
    const hashMatch = this.extractHashFromFilename(filename);
    if (hashMatch) {
      const hash = hashMatch;
      console.log(`Found hash pattern in filename: ${hash}`);
      
      // Try to find a file with the exact hash in the filename
      for (const dir of this.uploadDirs) {
        if (!fs.existsSync(dir)) continue;
        
        try {
          const files = await readdir(dir);
          console.log(`Scanning ${files.length} files in ${dir} for hash ${hash}`);
          
          // Try exact hash match first
          for (const file of files) {
            if (file.includes(hash)) {
              return path.join(dir, file);
            }
          }
          
          // Try matching recent uploads
          const recentFiles = await this.findRecentUploadsByPattern(dir);
          for (const file of recentFiles) {
            console.log(`Checking recent file: ${file}`);
            // Check if it's a Windows-style filename with timestamp and number
            if (this.isLikelyWindowsUpload(file)) {
              console.log(`Recent file appears to be a hash match: ${file}`);
              return path.join(dir, file);
            }
          }
          
          // Try matching by partial name
          for (const file of files) {
            // Look for partial matches - common pattern in Windows uploads
            if (this.isFilenameSimilar(filename, file, 0.5)) {
              return path.join(dir, file);
            }
          }
        } catch (error) {
          console.error(`Error searching directory ${dir}:`, error);
        }
      }
    }
    
    // Last resort: find the most recently uploaded file
    for (const dir of this.uploadDirs) {
      if (!fs.existsSync(dir)) continue;
      
      try {
        const files = await readdir(dir);
        if (files.length > 0) {
          const mostRecent = await this.findMostRecentFile(dir, files);
          if (mostRecent) {
            console.log(`Using most recent file as fallback: ${mostRecent}`);
            return path.join(dir, mostRecent);
          }
        }
      } catch (error) {
        // Silent fail for fallback
      }
    }
    
    return null;
  }
  
  /**
   * Extract hash-like pattern from filename 
   */
  private extractHashFromFilename(filename: string): string | null {
    // Common hash patterns in filenames
    const hashPattern = /([a-f0-9]{16,64})/i;
    const hashMatch = filename.match(hashPattern);
    
    if (hashMatch && hashMatch[1]) {
      return hashMatch[1];
    }
    
    return null;
  }
  
  /**
   * Find most recently added files in a directory
   */
  private async findRecentUploadsByPattern(dir: string): Promise<string[]> {
    try {
      const files = await readdir(dir);
      
      // Filter files by Windows-upload patterns (usually contains timestamp)
      const likelyUploads = files.filter(file => 
        this.isLikelyWindowsUpload(file)
      );
      
      // Sort by creation time (newest first)
      const filesWithTimes = await Promise.all(
        likelyUploads.map(async file => {
          const filePath = path.join(dir, file);
          try {
            const stats = await stat(filePath);
            return { 
              name: file, 
              time: stats.ctime.getTime() 
            };
          } catch (error) {
            return { name: file, time: 0 };
          }
        })
      );
      
      filesWithTimes.sort((a, b) => b.time - a.time);
      return filesWithTimes.map(f => f.name).slice(0, 5); // Return 5 most recent
    } catch (error) {
      console.error(`Error finding recent uploads in ${dir}:`, error);
      return [];
    }
  }
  
  /**
   * Find the most recent file in a directory
   */
  private async findMostRecentFile(dir: string, files: string[]): Promise<string | null> {
    try {
      let newestFile = null;
      let newestTime = 0;
      
      for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) continue;
        
        const filePath = path.join(dir, file);
        try {
          const stats = await stat(filePath);
          if (stats.ctime.getTime() > newestTime) {
            newestTime = stats.ctime.getTime();
            newestFile = file;
          }
        } catch (error) {
          // Silently continue
        }
      }
      
      return newestFile;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Check if a filename is likely a Windows upload (contains timestamp and random numbers)
   */
  private isLikelyWindowsUpload(filename: string): boolean {
    // Windows often uses patterns like "images-1234567890-123456789.jpg"
    const windowsPattern = /(images|img)[-_](\d{8,14})[-_](\d{6,12})|IMG_\d{4}|image_\d+/i;
    return windowsPattern.test(filename);
  }
  
  /**
   * Compare two filenames for similarity
   */
  private isFilenameSimilar(file1: string, file2: string, threshold: number = 0.7): boolean {
    const name1 = path.basename(file1, path.extname(file1)).toLowerCase();
    const name2 = path.basename(file2, path.extname(file2)).toLowerCase();
    
    // Simple similarity: check if one contains significant parts of the other
    const minLength = Math.min(name1.length, name2.length);
    const maxLength = Math.max(name1.length, name2.length);
    
    // If there's a huge difference in length, they're probably not similar
    if (minLength / maxLength < 0.3) return false;
    
    // Check for common substrings (simulate fuzzy matching)
    const commonChars = this.countCommonCharacters(name1, name2);
    const similarity = commonChars / maxLength;
    
    return similarity >= threshold;
  }
  
  /**
   * Count common characters between two strings
   */
  private countCommonCharacters(str1: string, str2: string): number {
    let count = 0;
    const shorter = str1.length <= str2.length ? str1 : str2;
    const longer = str1.length > str2.length ? str1 : str2;
    
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) {
        count++;
      }
    }
    
    return count;
  }
}

// Create singleton instance
export const imageMatcher = new ImageMatcher();