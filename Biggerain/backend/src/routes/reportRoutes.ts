import { Router } from "express"
import { createReport, getReports, incrementMapViews, incrementAlerts } from "../Controllers/reportController"

const router = Router()

// POST /api/reports - Create a new report
router.post("/", createReport)

// GET /api/reports - Get all reports with pagination and filtering
router.get("/", getReports)

// POST /api/reports/:id/map-views - Increment map views
router.post("/:id/map-views", incrementMapViews)

// POST /api/reports/:id/alerts - Increment alert count
router.post("/:id/alerts", incrementAlerts)

// GET /api/reports/info - Get endpoint information
router.get("/info", (req, res) => {
  res.json({
    message: "Reports API endpoint with forum functionality",
    endpoints: {
      "POST /api/reports": "Submit a new incident report",
      "GET /api/reports": "Retrieve reports with filtering and pagination",
      "POST /api/reports/:id/map-views": "Increment map views for report",
      "POST /api/reports/:id/alerts": "Increment alert count for report",
    },
    queryParameters: {
      type: "fire|health|security|other",
      verified: "true|false",
      sort: "latest",
      search: "Search term for title/caption",
      page: "Page number (default: 1)",
      limit: "Items per page (default: 10)",
    },
    version: "1.0.0",
  })
})

export default router
