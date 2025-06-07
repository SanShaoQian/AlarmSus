-- Add new forum-specific columns to existing reports table
ALTER TABLE reports 
  ADD COLUMN IF NOT EXISTS title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'other' CHECK (type IN ('fire', 'health', 'security', 'other')),
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS alerts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS map_views INTEGER DEFAULT 0;

-- Update existing records to have titles based on captions
UPDATE reports 
SET title = CASE 
  WHEN caption ILIKE '%fire%' THEN 'Fire Incident'
  WHEN caption ILIKE '%emergency%' OR caption ILIKE '%ambulance%' THEN 'Medical Emergency'
  WHEN caption ILIKE '%accident%' OR caption ILIKE '%crash%' THEN 'Traffic Accident'
  WHEN caption ILIKE '%collapsed%' OR caption ILIKE '%heart%' THEN 'Medical Emergency'
  WHEN caption ILIKE '%suspicious%' OR caption ILIKE '%security%' THEN 'Security Incident'
  WHEN caption ILIKE '%gas%' THEN 'Gas Leak'
  WHEN caption ILIKE '%flood%' THEN 'Flood Warning'
  ELSE 'Incident Report'
END
WHERE title IS NULL;

-- Update types based on emergency services and content
UPDATE reports 
SET type = CASE 
  WHEN emergency_fire = TRUE OR caption ILIKE '%fire%' THEN 'fire'
  WHEN emergency_ambulance = TRUE OR caption ILIKE '%medical%' OR caption ILIKE '%ambulance%' OR caption ILIKE '%collapsed%' THEN 'health'
  WHEN emergency_police = TRUE OR caption ILIKE '%accident%' OR caption ILIKE '%crash%' OR caption ILIKE '%suspicious%' THEN 'security'
  ELSE 'other'
END
WHERE type IS NULL OR type = 'other';

-- Add some random forum engagement data to existing records
UPDATE reports 
SET 
  verified = CASE WHEN RANDOM() > 0.6 THEN TRUE ELSE FALSE END,
  alerts = FLOOR(RANDOM() * 30) + 1,
  comments = FLOOR(RANDOM() * 20) + 1,
  map_views = FLOOR(RANDOM() * 50) + 5
WHERE alerts = 0;

-- Insert some additional sample forum data with realistic Singapore addresses
INSERT INTO reports (
  title, caption, type, is_emergency, emergency_police, emergency_ambulance, emergency_fire,
  is_in_danger, location, report_anonymously, image_url, user_id,
  verified, alerts, comments, map_views, created_at
) VALUES 
(
  'Fire in Kranji Industrial Area', 
  'Large fire spotted in warehouse. Multiple fire trucks responding. Smoke visible from far.',
  'fire', 
  TRUE, FALSE, FALSE, TRUE,
  FALSE,
  '15 Kranji Road, Kranji Industrial Estate, Singapore 739570',
  FALSE,
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  'user123',
  TRUE, 21, 18, 26,
  NOW() - INTERVAL '1 hour'
),
(
  'Person Collapsed at Bus Stop', 
  'Elderly person collapsed at bus stop along Orchard Road. Ambulance called. Please avoid crowding.',
  'health', 
  TRUE, FALSE, TRUE, FALSE,
  FALSE,
  '123 Orchard Road, Orchard, Singapore 238858',
  FALSE,
  NULL,
  'user456',
  FALSE, 11, 5, 9,
  NOW() - INTERVAL '58 minutes'
),
(
  'Multi-Vehicle Accident on ECP', 
  'Serious accident involving 3 cars on East Coast Parkway. Traffic heavily affected. Police on scene.',
  'security', 
  FALSE, TRUE, FALSE, FALSE,
  FALSE,
  '456 East Coast Parkway, Marine Parade, Singapore 449269',
  FALSE,
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  'user789',
  FALSE, 8, 12, 15,
  NOW() - INTERVAL '26 minutes'
),
(
  'Suspicious Activity Near Mall', 
  'Group of suspicious individuals spotted near Tampines Mall. Security has been notified.',
  'security', 
  FALSE, TRUE, FALSE, FALSE,
  FALSE,
  '789 Tampines Mall, Tampines Central 5, Singapore 529510',
  TRUE,
  NULL,
  NULL,
  TRUE, 15, 8, 22,
  NOW() - INTERVAL '2 hours'
),
(
  'Heart Attack at MRT Station', 
  'Person having heart attack at Raffles Place MRT. Paramedics on scene. Station partially closed.',
  'health', 
  TRUE, FALSE, TRUE, FALSE,
  FALSE,
  '321 Raffles Place MRT Station, Downtown Core, Singapore 048624',
  FALSE,
  NULL,
  'user101',
  TRUE, 32, 14, 41,
  NOW() - INTERVAL '45 minutes'
),
(
  'Office Building Fire', 
  'Smoke coming from 15th floor of Marina Bay office building. Fire department responding.',
  'fire', 
  TRUE, FALSE, FALSE, TRUE,
  TRUE,
  '567 Marina Bay Financial Centre, Downtown Core, Singapore 018982',
  FALSE,
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  'user202',
  FALSE, 28, 22, 35,
  NOW() - INTERVAL '3 hours'
);

-- Create additional indexes for forum functionality
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_verified ON reports(verified);
CREATE INDEX IF NOT EXISTS idx_reports_title ON reports(title);

-- Update the trigger to handle new columns
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for new columns
COMMENT ON COLUMN reports.title IS 'Auto-generated or user-provided title for forum display';
COMMENT ON COLUMN reports.type IS 'Incident category: fire, health, security, other';
COMMENT ON COLUMN reports.verified IS 'Verification status by authorities (default: false)';
COMMENT ON COLUMN reports.alerts IS 'Number of users who marked this as important';
COMMENT ON COLUMN reports.comments IS 'Number of comments on this incident';
COMMENT ON COLUMN reports.map_views IS 'Number of times location was viewed on map';
