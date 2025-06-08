import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import reportRoutes from "./routes/reportRoutes"
import type { ApiResponse } from "./types/report"

dotenv.config()

const app = express()

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Routes
app.use("/api/reports", reportRoutes)

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const { testConnection } = await import("./config/database")
    const dbConnected = await testConnection()

    res.json({
      status: "healthy",
      database: dbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      database: "error",
      timestamp: new Date().toISOString(),
    })
  }
})

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "Incident Reporting API",
    version: "1.0.0",
    endpoints: {
      "GET /health": "Health check",
      "GET /api": "API information",
      "POST /api/reports": "Submit incident report",
      "GET /api/reports": "Get incident reports",
    },
  })
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err)
  const response: ApiResponse = {
    success: false,
    message: "Internal server error",
  }
  res.status(500).json(response)
})

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`)
  const response: ApiResponse = {
    success: false,
    message: "Endpoint not found",
  }
  res.status(404).json(response)
})

export default app
