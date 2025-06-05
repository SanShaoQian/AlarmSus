import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config()

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: "mypassword",
  database: process.env.PGDATABASE || "reports_db",
  port: Number.parseInt(process.env.PGPORT || "5432", 10),
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Test function to check connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect()
    console.log("✅ Database connection successful")
    client.release()
    return true
  } catch (err) {
    console.error("❌ Database connection error:", err)
    return false
  }
}

export default pool
