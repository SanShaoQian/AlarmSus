interface ReportData {
  text?: string;
  image_description?: string;
  related_reports?: any[];
}

interface AnalysisResult {
  urgency_score: number;
  show_on_forum: boolean;
  original_report: ReportData;
}

export class ReportAnalyzer {
  private readonly OPENROUTER_API_KEY: string;
  private readonly BASE_URL = "https://openrouter.ai/api/v1";

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not found in environment variables");
    }
    this.OPENROUTER_API_KEY = apiKey;
  }

  private async callOpenRouter(prompt: string): Promise<string> {
    const response = await fetch(`${this.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${this.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://alarmsus.com",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-opus-20240229",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API call failed: ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async analyzeVisualElements(imageDescription: string): Promise<number> {
    const prompt = `
      Analyze the following image description for emergency-related visual elements:
      ${imageDescription}
      
      Rate the emergency level from 0 to 1 based on:
      - Presence of dangerous situations
      - Visual indicators of urgency
      - Environmental hazards
      Return only the numerical score.
    `;

    try {
      const response = await this.callOpenRouter(prompt);
      const score = parseFloat(response.trim());
      return Math.min(Math.max(score, 0.0), 1.0);
    } catch {
      return 0.0;
    }
  }

  private async analyzeClusterDensity(relatedReports: any[]): Promise<number> {
    const prompt = `
      Analyze the following cluster of related reports:
      ${JSON.stringify(relatedReports)}
      
      Calculate a density score from 0 to 1 based on:
      - Number of related reports
      - Temporal proximity
      - Geographic proximity
      Return only the numerical score.
    `;

    try {
      const response = await this.callOpenRouter(prompt);
      const score = parseFloat(response.trim());
      return Math.min(Math.max(score, 0.0), 1.0);
    } catch {
      return 0.0;
    }
  }

  private async analyzeSentiment(reportText: string): Promise<number> {
    const prompt = `
      Analyze the following report text for sentiment and urgency:
      ${reportText}
      
      Rate the urgency level from 0 to 1 based on:
      - Emotional intensity
      - Use of urgent language
      - Described severity
      Return only the numerical score.
    `;

    try {
      const response = await this.callOpenRouter(prompt);
      const score = parseFloat(response.trim());
      return Math.min(Math.max(score, 0.0), 1.0);
    } catch {
      return 0.0;
    }
  }

  public async calculateUrgencyScore(reportData: ReportData): Promise<number> {
    const WEIGHTS = {
      visual: 0.4,
      cluster: 0.3,
      sentiment: 0.3
    };

    const visualScore = await this.analyzeVisualElements(reportData.image_description || "");
    const clusterScore = await this.analyzeClusterDensity(reportData.related_reports || []);
    const sentimentScore = await this.analyzeSentiment(reportData.text || "");

    const weightedScore = 
      visualScore * WEIGHTS.visual +
      clusterScore * WEIGHTS.cluster +
      sentimentScore * WEIGHTS.sentiment;

    const finalScore = Math.round(weightedScore * 9 + 1);
    return finalScore >= 3 ? finalScore : 0;
  }

  public async analyzeReport(reportData: ReportData): Promise<AnalysisResult> {
    const urgencyScore = await this.calculateUrgencyScore(reportData);
    
    return {
      urgency_score: urgencyScore,
      show_on_forum: urgencyScore >= 3,
      original_report: reportData
    };
  }
} 