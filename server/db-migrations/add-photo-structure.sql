
-- Migration to add structured photo support to properties table
-- This will convert existing images array to structured photos array

-- First, add the new photos column
ALTER TABLE properties ADD COLUMN photos jsonb;

-- Convert existing images to structured photos format
UPDATE properties 
SET photos = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'filename', trim(both '"' from image_url::text),
      'altText', CASE 
        WHEN title IS NOT NULL THEN title || ' - Property Image'
        ELSE 'Property Image'
      END,
      'uploadedAt', COALESCE(created_at, NOW()::text)
    )
  )
  FROM jsonb_array_elements(
    CASE 
      WHEN jsonb_typeof(images) = 'array' THEN images
      ELSE '[]'::jsonb
    END
  ) AS image_url
  WHERE image_url != 'null'::jsonb AND image_url != '""'::jsonb
)
WHERE images IS NOT NULL AND jsonb_typeof(images) = 'array';

-- Set empty photos array for properties with no images
UPDATE properties 
SET photos = '[]'::jsonb 
WHERE photos IS NULL;

-- Make photos column NOT NULL now that all rows have values
ALTER TABLE properties ALTER COLUMN photos SET NOT NULL;

-- Keep the old images column for backward compatibility during transition
-- You can remove it later once all code is updated
