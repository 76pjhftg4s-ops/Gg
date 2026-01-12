"""Output formatter for copy-paste ready posts"""

from typing import List, Dict
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import box
from rich.text import Text


class OutputFormatter:
    """Formats posts for easy copy-paste to X"""

    def __init__(self):
        self.console = Console()

    def display_results(self, checked_posts: List[Dict], show_all: bool = False):
        """Display formatted results with quality scores"""

        passing_posts = [p for p in checked_posts if p["passed"]]
        failing_posts = [p for p in checked_posts if not p["passed"]]

        # Header
        self.console.print("\n")
        self.console.print("=" * 80, style="bold cyan")
        self.console.print("🎯 X POST GENERATION RESULTS", style="bold cyan", justify="center")
        self.console.print("=" * 80, style="bold cyan")

        # Summary stats
        self.console.print(f"\n📊 Summary:", style="bold yellow")
        self.console.print(f"   Total Posts Generated: {len(checked_posts)}")
        self.console.print(f"   ✅ Passed Quality Check: {len(passing_posts)}", style="green")
        self.console.print(f"   ❌ Failed Quality Check: {len(failing_posts)}", style="red")

        # Show passing posts
        if passing_posts:
            self.console.print(f"\n{'=' * 80}", style="bold green")
            self.console.print("✅ HIGH QUALITY POSTS (Ready to Copy)", style="bold green", justify="center")
            self.console.print(f"{'=' * 80}\n", style="bold green")

            for idx, post in enumerate(passing_posts, 1):
                self._display_post(idx, post, "green")

        # Show failing posts if requested
        if show_all and failing_posts:
            self.console.print(f"\n{'=' * 80}", style="bold red")
            self.console.print("❌ POSTS THAT NEED IMPROVEMENT", style="bold red", justify="center")
            self.console.print(f"{'=' * 80}\n", style="bold red")

            for idx, post in enumerate(failing_posts, 1):
                self._display_post(idx, post, "red", show_issues=True)

        # Footer with copy instructions
        self.console.print(f"\n{'=' * 80}", style="bold cyan")
        self.console.print("📋 TO COPY A POST:", style="bold yellow")
        self.console.print("   1. Select the post text (between the lines)")
        self.console.print("   2. Copy (Ctrl+C / Cmd+C)")
        self.console.print("   3. Paste directly into X")
        self.console.print(f"{'=' * 80}\n", style="bold cyan")

    def _display_post(self, idx: int, post: Dict, color: str, show_issues: bool = False):
        """Display a single post with formatting"""

        # Header with score
        score = post["quality_score"]
        score_color = "green" if score >= 80 else "yellow" if score >= 70 else "red"

        self.console.print(f"\n━━━ POST #{idx} ━━━", style=f"bold {color}")
        self.console.print(f"Quality Score: [{score_color}]{score}/100[/{score_color}] | ", end="")
        self.console.print(f"Length: {post['length']}/280 | ", end="")
        self.console.print(f"Type: {post.get('idea_type', 'N/A')}")

        # The actual post text in a box
        self.console.print("\n┌─ COPY FROM HERE ─" + "─" * 60)
        self.console.print(post["text"], style="bold white")
        self.console.print("└─ COPY TO HERE ─" + "─" * 62 + "\n")

        # Show issues if any
        if show_issues and post.get("issues"):
            self.console.print("⚠️  Issues:", style="yellow")
            for issue in post["issues"]:
                self.console.print(f"   • {issue}", style="yellow")

    def export_to_file(self, checked_posts: List[Dict], filename: str = "x_posts.txt"):
        """Export posts to a plain text file for easy access"""

        passing_posts = [p for p in checked_posts if p["passed"]]

        with open(filename, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("X POSTS - READY TO COPY AND PASTE\n")
            f.write("=" * 80 + "\n\n")

            for idx, post in enumerate(passing_posts, 1):
                f.write(f"POST #{idx}\n")
                f.write(f"Quality Score: {post['quality_score']}/100\n")
                f.write(f"Length: {post['length']}/280\n")
                f.write(f"Type: {post.get('idea_type', 'N/A')}\n")
                f.write("-" * 80 + "\n")
                f.write(post["text"] + "\n")
                f.write("-" * 80 + "\n\n")

        self.console.print(f"✅ Exported {len(passing_posts)} posts to: {filename}", style="green bold")

    def display_summary_table(self, checked_posts: List[Dict]):
        """Display a table summary of all posts"""

        table = Table(title="Post Quality Summary", box=box.ROUNDED)

        table.add_column("#", justify="right", style="cyan")
        table.add_column("Score", justify="center")
        table.add_column("Length", justify="center")
        table.add_column("Type", justify="left")
        table.add_column("Preview", justify="left", max_width=40)

        for idx, post in enumerate(checked_posts, 1):
            score = post["quality_score"]
            score_style = "green" if score >= 80 else "yellow" if score >= 70 else "red"

            preview = post["text"][:40] + "..." if len(post["text"]) > 40 else post["text"]
            preview = preview.replace("\n", " ")

            table.add_row(
                str(idx),
                f"[{score_style}]{score}[/{score_style}]",
                f"{post['length']}/280",
                post.get('idea_type', 'N/A'),
                preview
            )

        self.console.print("\n")
        self.console.print(table)
        self.console.print("\n")
