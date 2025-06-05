import { Router } from "express"
import { createReport, getReports } from "../controllers/reportController"

const router = Router()

// POST /api/reports - Create a new report
router.post("/", createReport)

// GET /api/reports - Get all reports with pagination
router.get("/", getReports)

// GET /api/reports/info - Get endpoint information
router.get("/info", (req, res) => {
  res.json({
    message: "Reports API endpoint",
    endpoints: {
      "POST /api/reports": "Submit a new incident report",
      "GET /api/reports": "Retrieve reports with pagination",
    },
    version: "1.0.0",
  })
})

export default router
