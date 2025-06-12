
-- Add photo metadata support to existing backup table
ALTER TABLE property_image_backups 
ADD COLUMN IF NOT EXISTS original_photos JSONB DEFAULT '[]';

-- Update existing records to have empty photo arrays if null
UPDATE property_image_backups 
SET original_photos = '[]' 
WHERE original_photos IS NULL;

-- Create index for better performance on photo queries
CREATE INDEX IF NOT EXISTS idx_backup_photos_property_id 
ON property_image_backups(property_id);

COMMENT ON COLUMN property_image_backups.original_photos IS 'Structured photo metadata with filenames, alt text, and order preservation';
