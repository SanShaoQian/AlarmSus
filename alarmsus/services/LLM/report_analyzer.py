import os
import json
from typing import Dict, Any
import httpx
from dotenv import load_load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OpenRouter API key not found in environment variables")

BASE_URL = "https://openrouter.ai/api/v1"
HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "HTTP-Referer": "https://alarmsus.com",  # Replace with your actual domain
    "Content-Type": "application/json"
}

class ReportAnalyzer:
    def __init__(self):
        self.client = httpx.Client(timeout=30.0)
        
    async def analyze_visual_elements(self, image_description: str) -> float:
        """Analyze visual elements in the report and return a score between 0-1"""
        prompt = f"""
        Analyze the following image description for emergency-related visual elements:
        {image_description}
        
        Rate the emergency level from 0 to 1 based on:
        - Presence of dangerous situations
        - Visual indicators of urgency
        - Environmental hazards
        Return only the numerical score.
        """
        
        response = await self._call_openrouter(prompt)
        try:
            score = float(response.strip())
            return min(max(score, 0.0), 1.0)
        except ValueError:
            return 0.0

    async def analyze_cluster_density(self, related_reports: list) -> float:
        """Analyze cluster density of similar reports and return a score between 0-1"""
        prompt = f"""
        Analyze the following cluster of related reports:
        {json.dumps(related_reports)}
        
        Calculate a density score from 0 to 1 based on:
        - Number of related reports
        - Temporal proximity
        - Geographic proximity
        Return only the numerical score.
        """
        
        response = await self._call_openrouter(prompt)
        try:
            score = float(response.strip())
            return min(max(score, 0.0), 1.0)
        except ValueError:
            return 0.0

    async def analyze_sentiment(self, report_text: str) -> float:
        """Analyze sentiment and urgency in the report text and return a score between 0-1"""
        prompt = f"""
        Analyze the following report text for sentiment and urgency:
        {report_text}
        
        Rate the urgency level from 0 to 1 based on:
        - Emotional intensity
        - Use of urgent language
        - Described severity
        Return only the numerical score.
        """
        
        response = await self._call_openrouter(prompt)
        try:
            score = float(response.strip())
            return min(max(score, 0.0), 1.0)
        except ValueError:
            return 0.0

    async def _call_openrouter(self, prompt: str) -> str:
        """Make an API call to OpenRouter"""
        payload = {
            "model": "anthropic/claude-3-opus-20240229",  # Using Claude 3 for best analysis
            "messages": [{"role": "user", "content": prompt}]
        }
        
        response = await self.client.post(
            f"{BASE_URL}/chat/completions",
            headers=HEADERS,
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenRouter API call failed: {response.text}")
            
        return response.json()["choices"][0]["message"]["content"]

    async def calculate_urgency_score(self, report_data: Dict[str, Any]) -> int:
        """
        Calculate final urgency score (1-10) based on weighted analysis of different factors
        Returns 0 if the score is below 3 (will not show on forum)
        """
        # Weights for different factors
        WEIGHTS = {
            "visual": 0.4,
            "cluster": 0.3,
            "sentiment": 0.3
        }
        
        # Analyze each factor
        visual_score = await self.analyze_visual_elements(report_data.get("image_description", ""))
        cluster_score = await self.analyze_cluster_density(report_data.get("related_reports", []))
        sentiment_score = await self.analyze_sentiment(report_data.get("text", ""))
        
        # Calculate weighted score (0-1 range)
        weighted_score = (
            visual_score * WEIGHTS["visual"] +
            cluster_score * WEIGHTS["cluster"] +
            sentiment_score * WEIGHTS["sentiment"]
        )
        
        # Convert to 1-10 scale
        final_score = round(weighted_score * 9 + 1)
        
        # Return 0 if score is below 3 (will not show on forum)
        return final_score if final_score >= 3 else 0

async def analyze_report(report_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main function to analyze a report and determine if it should be shown on the forum
    """
    analyzer = ReportAnalyzer()
    urgency_score = await analyzer.calculate_urgency_score(report_data)
    
    return {
        "urgency_score": urgency_score,
        "show_on_forum": urgency_score >= 3,
        "original_report": report_data
    } 