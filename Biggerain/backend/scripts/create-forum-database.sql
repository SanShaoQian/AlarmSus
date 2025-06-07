-- Drop existing tables if they exist
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create new reports table with forum requirements
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  caption TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (type IN ('fire', 'health', 'security', 'other')),
  is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Emergency services
  emergency_police BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_ambulance BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_fire BOOLEAN NOT NULL DEFAULT FALSE,
  
  is_in_danger BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Location as human-readable address
  location TEXT NOT NULL,
  
  report_anonymously BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Image stored as base64 data
  image_data TEXT,
  
  user_id VARCHAR(255),
  
  -- Forum-specific fields
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  alerts INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  map_views INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table for future use
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_is_emergency ON reports(is_emergency);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_verified ON reports(verified);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Create trigger function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to reports table
CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample forum data with base64 images and human-readable addresses
INSERT INTO reports (
  title, caption, type, is_emergency, location, 
  verified, alerts, comments, map_views, image_data, created_at
) VALUES 
(
  'Fire in Kranji', 
  'Large fire spotted in residential building in Kranji area. Multiple fire trucks on scene.',
  'fire', 
  TRUE, 
  '15 Kranji Road, Kranji Industrial Estate, Singapore 739570',
  TRUE, 21, 18, 26,
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  NOW() - INTERVAL '1 hour'
),
(
  'Someone collapsed!', 
  'Person collapsed at bus stop, ambulance called. Please avoid the area.',
  'health', 
  TRUE, 
  '123 Orchard Road, Orchard, Singapore 238858',
  FALSE, 11, 5, 9,
  NULL,
  NOW() - INTERVAL '58 minutes'
),
(
  'Car crash', 
  'Multi-vehicle accident on expressway. Traffic heavily affected.',
  'security', 
  FALSE, 
  '456 East Coast Parkway, Marine Parade, Singapore 449269',
  FALSE, 8, 12, 15,
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  NOW() - INTERVAL '26 minutes'
),
(
  'Suspicious activity', 
  'Suspicious individuals spotted near shopping mall. Security notified.',
  'security', 
  FALSE, 
  '789 Tampines Mall, Tampines Central 5, Singapore 529510',
  TRUE, 15, 8, 22,
  NULL,
  NOW() - INTERVAL '2 hours'
),
(
  'Medical emergency', 
  'Heart attack victim at MRT station. Paramedics on scene.',
  'health', 
  TRUE, 
  '321 Raffles Place MRT Station, Downtown Core, Singapore 048624',
  TRUE, 32, 14, 41,
  NULL,
  NOW() - INTERVAL '45 minutes'
),
(
  'Building fire', 
  'Smoke coming from office building. Fire department responding.',
  'fire', 
  TRUE, 
  '567 Marina Bay Financial Centre, Downtown Core, Singapore 018982',
  FALSE, 28, 22, 35,
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  NOW() - INTERVAL '3 hours'
),
(
  'Gas leak reported',
  'Strong gas smell reported in residential area. Utilities company notified.',
  'other',
  TRUE,
  '234 Toa Payoh Lorong 1, Toa Payoh, Singapore 310234',
  FALSE, 19, 7, 13,
  NULL,
  NOW() - INTERVAL '30 minutes'
),
(
  'Flood warning',
  'Heavy rain causing flooding in low-lying areas. Avoid the area.',
  'other',
  FALSE,
  '890 Boat Quay, Singapore River, Singapore 049883',
  TRUE, 25, 16, 31,
  NULL,
  NOW() - INTERVAL '4 hours'
);

-- Add comments on tables
COMMENT ON TABLE reports IS 'Stores incident reports with forum functionality';
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON COLUMN reports.image_data IS 'Base64 encoded image data';
COMMENT ON COLUMN reports.location IS 'Human-readable address with postal code';
COMMENT ON COLUMN reports.verified IS 'Verification status by authorities (default: false)';
