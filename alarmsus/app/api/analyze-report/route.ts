import { NextResponse } from 'next/server';
import { ReportAnalyzer } from '../../../services/LLM/reportAnalyzer';

export async function POST(request: Request) {
  try {
    const reportData = await request.json();
    
    const analyzer = new ReportAnalyzer();
    const result = await analyzer.analyzeReport(reportData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing report:', error);
    return NextResponse.json(
      { error: 'Failed to analyze report' },
      { status: 500 }
    );
  }
} 