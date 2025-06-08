-- Create database and tables for incident reporting system

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  caption TEXT NOT NULL,
  is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_police BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_ambulance BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_fire BOOLEAN NOT NULL DEFAULT FALSE,
  is_in_danger BOOLEAN NOT NULL DEFAULT FALSE,
  location TEXT,
  report_anonymously BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  user_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table (for future authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_is_emergency ON reports(is_emergency);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to reports table
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO reports (caption, is_emergency, location, report_anonymously) 
VALUES 
  ('Test incident report', false, 'Test Location', false),
  ('Emergency test', true, 'Emergency Location', true)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE reports IS 'Stores incident reports submitted by users';
COMMENT ON TABLE users IS 'Stores user account information';
