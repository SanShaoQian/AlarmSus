import type { Request, Response } from "express"
import pool from "../config/database"
import type { ReportRequest, ApiResponse, ReportResponse, ForumIncident } from "../types/report"

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}

// Helper function to determine incident type from emergency services
function determineIncidentType(emergencyServices: any, isEmergency: boolean, caption: string): string {
  const lowerCaption = caption.toLowerCase()

  if (emergencyServices.fire || lowerCaption.includes("fire")) return "fire"
  if (
    emergencyServices.ambulance ||
    lowerCaption.includes("medical") ||
    lowerCaption.includes("ambulance") ||
    lowerCaption.includes("collapsed")
  )
    return "health"
  if (
    emergencyServices.police ||
    lowerCaption.includes("accident") ||
    lowerCaption.includes("crash") ||
    lowerCaption.includes("suspicious")
  )
    return "security"

  return "other"
}

// Helper function to generate title from caption
function generateTitle(caption: string, type: string): string {
  const lowerCaption = caption.toLowerCase()

  if (type === "fire" || lowerCaption.includes("fire")) {
    return "Fire Incident"
  }
  if (
    type === "health" ||
    lowerCaption.includes("medical") ||
    lowerCaption.includes("ambulance") ||
    lowerCaption.includes("collapsed")
  ) {
    return "Medical Emergency"
  }
  if (type === "security" || lowerCaption.includes("accident") || lowerCaption.includes("crash")) {
    return "Security Incident"
  }
  if (lowerCaption.includes("gas")) {
    return "Gas Leak"
  }
  if (lowerCaption.includes("flood")) {
    return "Flood Warning"
  }

  return "Incident Report"
}

export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const reportData: ReportRequest = req.body

    // Validate required fields
    if (!reportData.caption || reportData.caption.trim().length === 0) {
      const response: ApiResponse = {
        success: false,
        message: "Caption is required",
      }
      res.status(400).json(response)
      return
    }

    // If it's an emergency, at least one service must be selected
    if (reportData.isEmergency) {
      const hasService =
        reportData.emergencyServices.police ||
        reportData.emergencyServices.ambulance ||
        reportData.emergencyServices.fire

      if (!hasService) {
        const response: ApiResponse = {
          success: false,
          message: "At least one emergency service must be selected for emergency reports",
        }
        res.status(400).json(response)
        return
      }
    }

    // Determine incident type and generate title for forum
    const incidentType = determineIncidentType(reportData.emergencyServices, reportData.isEmergency, reportData.caption)
    const title = generateTitle(reportData.caption, incidentType)

    // Insert report into database with both original and forum fields
    const insertQuery = `
      INSERT INTO reports (
        caption, 
        is_emergency, 
        emergency_police, 
        emergency_ambulance, 
        emergency_fire,
        is_in_danger, 
        location, 
        report_anonymously, 
        image_url, 
        user_id,
        title,
        type,
        verified,
        alerts,
        comments,
        map_views
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id, created_at
    `

    const values = [
      reportData.caption.trim(),
      reportData.isEmergency,
      reportData.emergencyServices.police,
      reportData.emergencyServices.ambulance,
      reportData.emergencyServices.fire,
      reportData.isInDanger,
      reportData.location?.trim() || null,
      reportData.reportAnonymously,
      reportData.imageUrl || null,
      reportData.userId || null,
      title,
      incidentType,
      false, // verified defaults to false
      0, // alerts starts at 0
      0, // comments starts at 0
      0, // map_views starts at 0
    ]

    const result = await pool.query(insertQuery, values)
    const insertedReport = result.rows[0]

    // If it's an emergency, log for monitoring
    if (reportData.isEmergency) {
      console.log(`🚨 EMERGENCY REPORT SUBMITTED - ID: ${insertedReport.id}`)
    }

    const response: ApiResponse = {
      success: true,
      message: "Report submitted successfully",
      reportId: insertedReport.id,
    }

    console.log(`📝 Report submitted successfully: ${insertedReport.id}`)
    res.status(201).json(response)
  } catch (error) {
    console.error("Error submitting report:", error)

    const response: ApiResponse = {
      success: false,
      message: "An error occurred while submitting the report. Please try again.",
    }

    res.status(500).json(response)
  }
}

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, type, verified, sort = "latest", search, forum } = req.query

    let query = `
      SELECT 
        id,
        caption,
        is_emergency as "isEmergency",
        emergency_police as "emergencyPolice",
        emergency_ambulance as "emergencyAmbulance", 
        emergency_fire as "emergencyFire",
        is_in_danger as "isInDanger",
        location,
        report_anonymously as "reportAnonymously",
        image_url as "imageUrl",
        user_id as "userId",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    // Add forum-specific fields if this is a forum request
    if (forum === "true") {
      query += `,
        title,
        type,
        verified,
        alerts,
        comments,
        map_views as "mapViews"
      `
    }

    query += ` FROM reports WHERE 1=1`

    const values: any[] = []
    let paramCount = 0

    // Add filters (only for forum requests)
    if (forum === "true") {
      if (type) {
        paramCount++
        query += ` AND type = $${paramCount}`
        values.push(type)
      }

      if (verified !== undefined) {
        paramCount++
        query += ` AND verified = $${paramCount}`
        values.push(verified === "true")
      }

      if (search) {
        paramCount++
        query += ` AND (title ILIKE $${paramCount} OR caption ILIKE $${paramCount})`
        values.push(`%${search}%`)
      }
    }

    // Add sorting
    query += ` ORDER BY created_at DESC`

    // Add pagination
    paramCount++
    query += ` LIMIT $${paramCount}`
    values.push(Number(limit))

    paramCount++
    query += ` OFFSET $${paramCount}`
    values.push((Number(page) - 1) * Number(limit))

    console.log("Reports query:", query)
    console.log("Values:", values)

    const result = await pool.query(query, values)

    // Process results based on request type
    if (forum === "true") {
      // Forum format
      const incidents: ForumIncident[] = result.rows.map((row) => ({
        id: row.id,
        title: row.title || "Incident Report",
        caption: row.caption,
        type: row.type || "other",
        isEmergency: row.isEmergency,
        location: row.location,
        verified: row.verified || false,
        alerts: row.alerts || 0,
        comments: row.comments || 0,
        mapViews: row.mapViews || 0,
        imageUrl: row.imageUrl,
        createdAt: row.createdAt,
        timeAgo: getTimeAgo(new Date(row.createdAt)),
      }))

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) FROM reports WHERE 1=1`
      const countValues: any[] = []
      let countParamCount = 0

      if (type) {
        countParamCount++
        countQuery += ` AND type = $${countParamCount}`
        countValues.push(type)
      }

      if (verified !== undefined) {
        countParamCount++
        countQuery += ` AND verified = $${countParamCount}`
        countValues.push(verified === "true")
      }

      if (search) {
        countParamCount++
        countQuery += ` AND (title ILIKE $${countParamCount} OR caption ILIKE $${countParamCount})`
        countValues.push(`%${search}%`)
      }

      const countResult = await pool.query(countQuery, countValues)
      const total = Number(countResult.rows[0].count)

      const response = {
        success: true,
        message: "Forum incidents retrieved successfully",
        data: {
          incidents,
          total,
          page: Number(page),
          limit: Number(limit),
          hasMore: total > Number(page) * Number(limit),
        },
      }

      res.json(response)
    } else {
      // Original report format
      const reports: ReportResponse[] = result.rows.map((row) => ({
        ...row,
        emergencyServices: {
          police: row.emergencyPolice,
          ambulance: row.emergencyAmbulance,
          fire: row.emergencyFire,
        },
      }))

      const countResult = await pool.query("SELECT COUNT(*) FROM reports")
      const total = Number(countResult.rows[0].count)

      const response = {
        success: true,
        message: "Reports retrieved successfully",
        data: {
          reports,
          total,
          page: Number(page),
          limit: Number(limit),
          hasMore: total > Number(page) * Number(limit),
        },
      }

      res.json(response)
    }
  } catch (error) {
    console.error("Error retrieving reports:", error)

    const response = {
      success: false,
      message: "An error occurred while retrieving reports.",
      data: {
        reports: [],
        incidents: [],
        total: 0,
        page: 1,
        limit: 10,
        hasMore: false,
      },
    }

    res.status(500).json(response)
  }
}

export const incrementMapViews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    await pool.query("UPDATE reports SET map_views = map_views + 1 WHERE id = $1", [id])

    res.json({ success: true, message: "Map views incremented" })
  } catch (error) {
    console.error("Error incrementing map views:", error)
    res.status(500).json({ success: false, message: "Failed to increment map views" })
  }
}

export const incrementAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    await pool.query("UPDATE reports SET alerts = alerts + 1 WHERE id = $1", [id])

    res.json({ success: true, message: "Alert count incremented" })
  } catch (error) {
    console.error("Error incrementing alerts:", error)
    res.status(500).json({ success: false, message: "Failed to increment alerts" })
  }
}
