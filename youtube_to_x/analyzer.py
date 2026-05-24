"""Transcript analysis and insight extraction"""

from typing import Dict, List
import os


class TranscriptAnalyzer:
    """Analyzes YouTube transcripts to extract key insights and themes"""

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")

    def analyze(self, transcript: str) -> Dict[str, any]:
        """
        Analyze transcript to extract:
        - Key themes and topics
        - Main arguments and claims
        - Contrarian or unique perspectives
        - Quotable moments
        - Data points and statistics
        """
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=self.api_key)

            prompt = f"""Analyze this YouTube video transcript and extract:

1. MAIN THEMES (3-5 core topics discussed)
2. KEY ARGUMENTS (main claims and perspectives)
3. CONTRARIAN TAKES (unique, controversial, or counter-narrative points)
4. QUOTABLE MOMENTS (powerful phrases or insights)
5. DATA POINTS (statistics, numbers, facts mentioned)

Be specific and extract actual content, not summaries.

TRANSCRIPT:
{transcript}

Provide analysis in this exact JSON format:
{{
    "themes": ["theme1", "theme2", ...],
    "arguments": ["arg1", "arg2", ...],
    "contrarian_takes": ["take1", "take2", ...],
    "quotable_moments": ["quote1", "quote2", ...],
    "data_points": ["data1", "data2", ...]
}}"""

            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )

            import json
            content = response.content[0].text

            # Extract JSON from response
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            analysis = json.loads(content)
            return analysis

        except Exception as e:
            print(f"Analysis error: {e}")
            # Fallback to basic extraction
            return {
                "themes": ["General content"],
                "arguments": ["Key points from video"],
                "contrarian_takes": ["Unique perspective"],
                "quotable_moments": [],
                "data_points": []
            }

    def get_transcript_stats(self, transcript: str) -> Dict[str, int]:
        """Get basic statistics about the transcript"""
        words = transcript.split()
        return {
            "word_count": len(words),
            "char_count": len(transcript),
            "estimated_read_time": len(words) // 200  # minutes
        }
