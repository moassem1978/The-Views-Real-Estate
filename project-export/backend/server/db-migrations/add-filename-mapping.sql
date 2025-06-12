
-- Add filename mapping support to image_backups table
ALTER TABLE image_backups ADD COLUMN IF NOT EXISTS filename_map TEXT;

-- Create index for faster filename lookups
CREATE INDEX IF NOT EXISTS idx_image_backups_filename_map ON image_backups USING gin((filename_map::jsonb));

-- Update existing backups to include filename mapping where possible
UPDATE image_backups SET filename_map = '{}' WHERE filename_map IS NULL;
