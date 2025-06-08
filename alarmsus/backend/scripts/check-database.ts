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

async function checkDatabase() {
  console.log("🔍 Checking database status...")

  try {
    // Test connection
    console.log("\n🔗 Testing database connection...")
    const timeResult = await pool.query("SELECT NOW() as current_time")
    console.log(`✅ Connected successfully at: ${timeResult.rows[0].current_time}`)

    // Check if tables exist
    console.log("\n📋 Checking tables...")
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `)

    if (tablesResult.rows.length === 0) {
      console.log("❌ No tables found. Run 'npm run setup:db' to create tables.")
    } else {
      console.log("✅ Tables found:")
      tablesResult.rows.forEach((row) => {
        console.log(`   - ${row.table_name}`)
      })
    }

    // Check reports table specifically
    const reportsExists = tablesResult.rows.some((row) => row.table_name === "reports")

    if (reportsExists) {
      console.log("\n📊 Reports table details:")

      // Get column info
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'reports' 
        ORDER BY ordinal_position;
      `)

      columnsResult.rows.forEach((row) => {
        console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === "NO" ? "(NOT NULL)" : ""}`)
      })

      // Get record count
      const countResult = await pool.query("SELECT COUNT(*) FROM reports")
      console.log(`\n📈 Total reports: ${countResult.rows[0].count}`)

      // Show recent reports
      const recentReports = await pool.query(`
        SELECT id, caption, is_emergency, created_at 
        FROM reports 
        ORDER BY created_at DESC 
        LIMIT 3
      `)

      if (recentReports.rows.length > 0) {
        console.log("\n📝 Recent reports:")
        recentReports.rows.forEach((report) => {
          console.log(
            `   - ID: ${report.id}, Emergency: ${report.is_emergency}, Caption: "${report.caption.substring(0, 50)}..."`,
          )
        })
      }
    } else {
      console.log("\n❌ Reports table not found. Run 'npm run setup:db' to create it.")
    }

    console.log("\n✅ Database check completed!")
  } catch (error) {
    console.error("\n❌ Database check failed:")
    console.error(error)

    if (error instanceof Error) {
      if (error.message.includes("does not exist")) {
        console.log("\n💡 Suggestion: Make sure your database exists and run 'npm run setup:db'")
      } else if (error.message.includes("authentication failed")) {
        console.log("\n💡 Suggestion: Check your database credentials in the .env file")
      } else if (error.message.includes("connection refused")) {
        console.log("\n💡 Suggestion: Make sure PostgreSQL is running")
      }
    }
  } finally {
    await pool.end()
    console.log("\n🔌 Database connection closed")
  }
}

// Run the check
checkDatabase()
