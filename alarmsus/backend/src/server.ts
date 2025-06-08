import app from "./app"
import { testConnection } from "./config/database"

const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    // Test database connection
    const connected = await testConnection()

    if (!connected) {
      console.error("❌ Failed to connect to database")
      process.exit(1)
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/health`)
      console.log(`📝 API info: http://localhost:${PORT}/api`)
      console.log(`📋 Reports endpoint: http://localhost:${PORT}/api/reports`)
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🔄 Received SIGTERM, shutting down gracefully...")
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("🔄 Received SIGINT, shutting down gracefully...")
  process.exit(0)
})

startServer()
