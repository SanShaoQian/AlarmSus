import { Pool } from "pg"
import dotenv from "dotenv"
import path from "path"

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") })

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: process.env.PGDATABASE || "reports_db",
  port: Number.parseInt(process.env.PGPORT || "5432", 10),
})

async function setupDatabase() {
  console.log("🔄 Setting up database...")
  console.log(`📍 Connecting to: ${process.env.PGHOST}:${process.env.PGPORT}`)
  console.log(`📊 Database: ${process.env.PGDATABASE}`)
  console.log(`👤 User: ${process.env.PGUSER}`)

  try {
    // Test connection
    console.log("\n🔗 Testing database connection...")
    await pool.query("SELECT NOW()")
    console.log("✅ Database connection successful!")

    // Create reports table
    console.log("\n📋 Creating reports table...")
    await pool.query(`
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
    `)
    console.log("✅ Reports table created successfully!")

    // Create users table (for future use)
    console.log("\n👥 Creating users table...")
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log("✅ Users table created successfully!")

    // Create indexes
    console.log("\n📊 Creating database indexes...")
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_is_emergency ON reports(is_emergency);
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `)
    console.log("✅ Database indexes created successfully!")

    // Create trigger function
    console.log("\n⚡ Creating trigger functions...")
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `)
    console.log("✅ Trigger function created successfully!")

    // Create triggers
    console.log("\n🔄 Creating triggers...")
    await pool.query(`
      DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
      CREATE TRIGGER update_reports_updated_at 
          BEFORE UPDATE ON reports 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `)
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at 
          BEFORE UPDATE ON users 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `)
    console.log("✅ Triggers created successfully!")

    // Insert sample data
    console.log("\n📝 Inserting sample data...")
    await pool.query(`
      INSERT INTO reports (caption, is_emergency, location, report_anonymously) 
      VALUES 
        ('Sample incident report for testing', false, 'Test Location', false),
        ('Emergency test report', true, 'Emergency Location', true)
      ON CONFLICT DO NOTHING;
    `)
    console.log("✅ Sample data inserted successfully!")

    // Verify tables
    console.log("\n🔍 Verifying database setup...")
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `)

    console.log("📋 Tables created:")
    tablesResult.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`)
    })

    // Check reports table structure
    const reportsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'reports' 
      ORDER BY ordinal_position;
    `)

    console.log("\n📊 Reports table structure:")
    reportsStructure.rows.forEach((row) => {
      console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === "NO" ? "(NOT NULL)" : ""}`)
    })

    // Test data retrieval
    const reportCount = await pool.query("SELECT COUNT(*) FROM reports")
    console.log(`\n📈 Total reports in database: ${reportCount.rows[0].count}`)

    console.log("\n🎉 Database setup completed successfully!")
    console.log("🚀 You can now start your backend server with: npm run dev")
  } catch (error) {
    console.error("\n❌ Database setup failed:")
    console.error(error)
    process.exit(1)
  } 
  finally {
    await pool.end()
    console.log("\n🔌 Database connection closed")
  }
}

// Run the setup
setupDatabase()
