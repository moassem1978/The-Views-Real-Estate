
-- Create property image mappings table
CREATE TABLE IF NOT EXISTS property_image_mappings (
  image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  current_filename TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  image_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  file_size INTEGER DEFAULT 0,
  mime_type TEXT DEFAULT 'image/jpeg',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast property lookups
CREATE INDEX IF NOT EXISTS idx_property_image_mappings_property_id 
ON property_image_mappings(property_id);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_property_image_mappings_order 
ON property_image_mappings(property_id, image_order);

-- Create property backups table
CREATE TABLE IF NOT EXISTS property_backups (
  backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  backup_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for property backups
CREATE INDEX IF NOT EXISTS idx_property_backups_property_id 
ON property_backups(property_id);

-- Create index for backup lookup by date
CREATE INDEX IF NOT EXISTS idx_property_backups_created_at 
ON property_backups(created_at DESC);

-- Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
