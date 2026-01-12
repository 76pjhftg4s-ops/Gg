"""Quality checker to detect AI slop and ensure uniqueness"""

from typing import Dict, List
import re
import os


class QualityChecker:
    """Checks posts for AI slop indicators and scores uniqueness"""

    # Common AI slop phrases to avoid
    AI_SLOP_PATTERNS = [
        r"let that sink in",
        r"imagine (a world where|if)",
        r"here'?s the thing",
        r"unpopular opinion",
        r"hot take",
        r"change my mind",
        r"this is huge",
        r"game[- ]?changer",
        r"buckle up",
        r"plot twist",
        r"mic drop",
        r"full stop",
        r"period\.",
        r"it'?s giving",
        r"not me",
        r"the way",
        r"i'?m sorry but",
        r"normalize",
        r"friendly reminder",
        r"psa:",
        r"say it louder",
        r"tell me you.*without telling me",
    ]

    # Generic/overused phrases
    GENERIC_PATTERNS = [
        r"in conclusion",
        r"at the end of the day",
        r"think outside the box",
        r"paradigm shift",
        r"low[- ]?hanging fruit",
        r"move the needle",
        r"circle back",
        r"deep dive",
        r"double[- ]?click",
        r"leverage",
        r"synergy",
        r"disrupt",
        r"innovative solution",
    ]

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")

    def check_post(self, post: Dict) -> Dict:
        """
        Comprehensive quality check on a post
        Returns: score, issues, and recommendations
        """
        text = post.get("text", "")
        issues = []
        score = 100

        # Check for AI slop
        slop_count = self._count_slop_patterns(text)
        if slop_count > 0:
            issues.append(f"Contains {slop_count} AI slop phrase(s)")
            score -= slop_count * 15

        # Check for generic phrases
        generic_count = self._count_generic_patterns(text)
        if generic_count > 0:
            issues.append(f"Contains {generic_count} generic phrase(s)")
            score -= generic_count * 10

        # Check for excessive emojis
        emoji_count = self._count_emojis(text)
        if emoji_count > 2:
            issues.append(f"Too many emojis ({emoji_count})")
            score -= (emoji_count - 2) * 5

        # Check for ALL CAPS abuse
        caps_ratio = self._caps_ratio(text)
        if caps_ratio > 0.3:
            issues.append("Excessive capitalization")
            score -= 10

        # Check for hashtag spam
        hashtag_count = text.count('#')
        if hashtag_count > 2:
            issues.append(f"Too many hashtags ({hashtag_count})")
            score -= (hashtag_count - 2) * 5

        # Check for vague language
        if self._has_vague_language(text):
            issues.append("Contains vague language")
            score -= 10

        # Bonus for concrete details
        if self._has_concrete_details(text):
            score += 10

        # Bonus for unique structure
        if self._has_unique_structure(text):
            score += 5

        score = max(0, min(100, score))  # Clamp between 0-100

        return {
            "text": text,
            "quality_score": score,
            "issues": issues,
            "passed": score >= 70,
            "length": post.get("length", len(text)),
            "idea_type": post.get("idea_type", ""),
            "idea_score": post.get("idea_score", 0)
        }

    def _count_slop_patterns(self, text: str) -> int:
        """Count AI slop patterns in text"""
        count = 0
        lower_text = text.lower()
        for pattern in self.AI_SLOP_PATTERNS:
            if re.search(pattern, lower_text):
                count += 1
        return count

    def _count_generic_patterns(self, text: str) -> int:
        """Count generic patterns in text"""
        count = 0
        lower_text = text.lower()
        for pattern in self.GENERIC_PATTERNS:
            if re.search(pattern, lower_text):
                count += 1
        return count

    def _count_emojis(self, text: str) -> int:
        """Count emojis in text"""
        emoji_pattern = re.compile(
            "["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags
            u"\U00002702-\U000027B0"
            u"\U000024C2-\U0001F251"
            "]+",
            flags=re.UNICODE
        )
        return len(emoji_pattern.findall(text))

    def _caps_ratio(self, text: str) -> float:
        """Calculate ratio of capital letters"""
        letters = [c for c in text if c.isalpha()]
        if not letters:
            return 0
        caps = [c for c in letters if c.isupper()]
        return len(caps) / len(letters)

    def _has_vague_language(self, text: str) -> bool:
        """Check for vague, non-specific language"""
        vague_words = ["very", "really", "quite", "somewhat", "fairly", "pretty much", "kind of", "sort of"]
        lower_text = text.lower()
        return any(word in lower_text for word in vague_words)

    def _has_concrete_details(self, text: str) -> bool:
        """Check for specific numbers, names, or concrete details"""
        # Contains numbers
        if re.search(r'\d+', text):
            return True
        # Contains specific measurements or percentages
        if re.search(r'\d+%|\$\d+|€\d+', text):
            return True
        return False

    def _has_unique_structure(self, text: str) -> bool:
        """Check for unique structural elements"""
        # Has line breaks for readability
        if '\n' in text:
            return True
        # Has question-answer format
        if text.count('?') >= 1 and len(text.split('.')) > 1:
            return True
        return False

    def check_batch(self, posts: List[Dict]) -> List[Dict]:
        """Check a batch of posts and return quality scores"""
        checked_posts = []
        for post in posts:
            checked = self.check_post(post)
            checked_posts.append(checked)

        # Sort by quality score
        checked_posts.sort(key=lambda x: x["quality_score"], reverse=True)
        return checked_posts

    def filter_passing_posts(self, checked_posts: List[Dict], min_score: int = 70) -> List[Dict]:
        """Filter posts that pass quality threshold"""
        return [post for post in checked_posts if post["quality_score"] >= min_score]
