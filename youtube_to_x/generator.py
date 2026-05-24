"""X post generator with character limit enforcement"""

from typing import Dict, List
import os


class PostGenerator:
    """Generates X posts with 280 character limit"""

    MAX_LENGTH = 280

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")

    def generate_posts(self, ideas: List[Dict], posts_per_idea: int = 2) -> List[Dict]:
        """
        Generate X posts from content ideas
        Each post must be <= 280 characters
        """
        all_posts = []

        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=self.api_key)

            for idx, idea in enumerate(ideas):
                prompt = f"""Create {posts_per_idea} X (Twitter) posts based on this content idea:

IDEA:
Angle: {idea.get('angle', '')}
Hook: {idea.get('hook', '')}
Type: {idea.get('type', '')}

REQUIREMENTS:
- Each post MUST be 280 characters or less
- Make it PUNCHY and ATTENTION-GRABBING
- Use strong, active language
- Include hooks that stop scrolling
- Avoid: AI clichés, generic phrases, "imagine if", "let that sink in"
- Sound human, not robotic
- Can use line breaks for readability
- NO hashtags unless absolutely necessary

WRITING STYLE:
- Short, punchy sentences
- Strong opinions clearly stated
- Mix of bold claims and supporting evidence
- Use numbers/data when available
- Rhetorical questions okay if powerful

Generate {posts_per_idea} different versions in JSON format:
{{
    "posts": [
        "post text here (max 280 chars)",
        "alternative version here (max 280 chars)"
    ]
}}"""

                response = client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=800,
                    temperature=0.8,
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
                posts = result.get("posts", [])

                # Validate and add posts
                for post_text in posts:
                    # Ensure under character limit
                    if len(post_text) <= self.MAX_LENGTH:
                        all_posts.append({
                            "text": post_text,
                            "length": len(post_text),
                            "idea_index": idx,
                            "idea_type": idea.get("type", ""),
                            "idea_score": idea.get("uniqueness_score", 0)
                        })
                    else:
                        # Try to truncate intelligently
                        truncated = self._truncate_post(post_text)
                        if truncated:
                            all_posts.append({
                                "text": truncated,
                                "length": len(truncated),
                                "idea_index": idx,
                                "idea_type": idea.get("type", ""),
                                "idea_score": idea.get("uniqueness_score", 0)
                            })

        except Exception as e:
            print(f"Generation error: {e}")

        return all_posts

    def _truncate_post(self, text: str) -> str:
        """Intelligently truncate post to 280 chars"""
        if len(text) <= self.MAX_LENGTH:
            return text

        # Try to truncate at sentence boundary
        truncated = text[:self.MAX_LENGTH - 3]
        last_period = truncated.rfind('.')
        last_exclaim = truncated.rfind('!')
        last_question = truncated.rfind('?')

        boundary = max(last_period, last_exclaim, last_question)

        if boundary > self.MAX_LENGTH * 0.7:  # If we can keep at least 70%
            return text[:boundary + 1]

        return truncated + "..."

    def format_post(self, post: Dict) -> str:
        """Format a single post for display"""
        return f"{post['text']} ({post['length']}/280)"
