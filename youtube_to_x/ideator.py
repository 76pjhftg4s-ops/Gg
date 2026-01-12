"""Content ideation engine for X posts"""

from typing import Dict, List
import os


class ContentIdeator:
    """Generates X content ideas focusing on unique and contrarian angles"""

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")

    def generate_ideas(self, analysis: Dict, num_ideas: int = 15) -> List[Dict]:
        """
        Generate X content ideas from transcript analysis
        Focus on: unique angles, contrarian takes, thread-worthy insights
        """
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=self.api_key)

            prompt = f"""Based on this transcript analysis, generate {num_ideas} X (Twitter) content ideas.

ANALYSIS:
Themes: {', '.join(analysis.get('themes', []))}
Arguments: {', '.join(analysis.get('arguments', []))}
Contrarian Takes: {', '.join(analysis.get('contrarian_takes', []))}
Quotable Moments: {', '.join(analysis.get('quotable_moments', []))}
Data Points: {', '.join(analysis.get('data_points', []))}

REQUIREMENTS:
- Focus on UNIQUE, CONTRARIAN, or CONTROVERSIAL angles
- Each idea should be ATTENTION-GRABBING and ENGAGING
- Prioritize ideas that challenge conventional wisdom
- Include mix of: hot takes, data-driven insights, provocative questions
- Rate each idea for uniqueness (1-10 scale)

Provide {num_ideas} ideas in this exact JSON format:
{{
    "ideas": [
        {{
            "angle": "brief description of the content angle",
            "hook": "the opening hook or main point",
            "type": "hot_take|data_driven|contrarian|question|insight",
            "uniqueness_score": 8
        }},
        ...
    ]
}}

PRIORITIZE IDEAS WITH UNIQUENESS SCORE >= 7"""

            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2500,
                temperature=0.9,
                messages=[{"role": "user", "content": prompt}]
            )

            import json
            content = response.content[0].text

            # Extract JSON from response
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            result = json.loads(content)
            ideas = result.get("ideas", [])

            # Filter for high uniqueness scores
            filtered_ideas = [
                idea for idea in ideas
                if idea.get("uniqueness_score", 0) >= 7
            ]

            return filtered_ideas if filtered_ideas else ideas[:10]

        except Exception as e:
            print(f"Ideation error: {e}")
            return []

    def rank_ideas(self, ideas: List[Dict]) -> List[Dict]:
        """Rank ideas by uniqueness and engagement potential"""
        return sorted(
            ideas,
            key=lambda x: x.get("uniqueness_score", 0),
            reverse=True
        )
