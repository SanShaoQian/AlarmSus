import type { Request, Response } from "express"
import pool from "../config/database"
import type { ReportRequest, ApiResponse } from "../types/report"

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

    // Insert report into database
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
        user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
    ]

    const result = await pool.query(insertQuery, values)
    const insertedReport = result.rows[0]

    // If it's an emergency, log for monitoring
    if (reportData.isEmergency) {
      console.log(`🚨 EMERGENCY REPORT SUBMITTED - ID: ${insertedReport.id}`)
      // TODO: Implement emergency notification system
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
    const { page = 1, limit = 10, emergency } = req.query

    let query = `
      SELECT 
        id,
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
        created_at,
        updated_at
      FROM reports
    `

    const values: any[] = []
    const conditions: string[] = []

    if (emergency !== undefined) {
      conditions.push(`is_emergency = $${values.length + 1}`)
      values.push(emergency === "true")
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`
    values.push(Number(limit), (Number(page) - 1) * Number(limit))

    const result = await pool.query(query, values)

    const response: ApiResponse = {
      success: true,
      message: "Reports retrieved successfully",
      data: {
        reports: result.rows,
        page: Number(page),
        limit: Number(limit),
        total: result.rowCount,
      },
    }

    res.json(response)
  } catch (error) {
    console.error("Error retrieving reports:", error)

    const response: ApiResponse = {
      success: false,
      message: "An error occurred while retrieving reports.",
    }

    res.status(500).json(response)
  }
}
