#!/usr/bin/env python3
"""
YouTube to X Content Creation Workflow

Input: YouTube video transcript
Output: Quality-checked, copy-paste ready X posts

Usage:
    python main.py transcript.txt
    python main.py transcript.txt --output posts.txt
    python main.py transcript.txt --num-ideas 20 --posts-per-idea 3
"""

import sys
import os
import argparse
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from youtube_to_x.analyzer import TranscriptAnalyzer
from youtube_to_x.ideator import ContentIdeator
from youtube_to_x.generator import PostGenerator
from youtube_to_x.quality_checker import QualityChecker
from youtube_to_x.formatter import OutputFormatter


def load_transcript(file_path: str) -> str:
    """Load transcript from file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return content.strip()
    except FileNotFoundError:
        print(f"❌ Error: File '{file_path}' not found")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="YouTube to X Content Creation Workflow",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py transcript.txt
  python main.py transcript.txt --output my_posts.txt
  python main.py transcript.txt --num-ideas 20 --posts-per-idea 3
  python main.py transcript.txt --show-all --min-score 60
        """
    )

    parser.add_argument(
        "transcript",
        help="Path to transcript file"
    )

    parser.add_argument(
        "--output", "-o",
        default="x_posts.txt",
        help="Output file for generated posts (default: x_posts.txt)"
    )

    parser.add_argument(
        "--num-ideas", "-n",
        type=int,
        default=15,
        help="Number of content ideas to generate (default: 15)"
    )

    parser.add_argument(
        "--posts-per-idea", "-p",
        type=int,
        default=2,
        help="Number of posts to generate per idea (default: 2)"
    )

    parser.add_argument(
        "--min-score", "-m",
        type=int,
        default=70,
        help="Minimum quality score for posts (0-100, default: 70)"
    )

    parser.add_argument(
        "--show-all",
        action="store_true",
        help="Show all posts including those that failed quality check"
    )

    parser.add_argument(
        "--no-export",
        action="store_true",
        help="Don't export posts to file"
    )

    args = parser.parse_args()

    # Check for API key
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("❌ Error: ANTHROPIC_API_KEY environment variable not set")
        print("Please set it with: export ANTHROPIC_API_KEY='your-api-key'")
        sys.exit(1)

    # Initialize components
    print("\n🚀 Initializing YouTube to X Workflow...\n")

    analyzer = TranscriptAnalyzer()
    ideator = ContentIdeator()
    generator = PostGenerator()
    quality_checker = QualityChecker()
    formatter = OutputFormatter()

    # Load transcript
    print(f"📄 Loading transcript from: {args.transcript}")
    transcript = load_transcript(args.transcript)

    stats = analyzer.get_transcript_stats(transcript)
    print(f"   Words: {stats['word_count']:,}")
    print(f"   Characters: {stats['char_count']:,}")
    print(f"   Estimated read time: {stats['estimated_read_time']} minutes\n")

    # Step 1: Analyze transcript
    print("🔍 Step 1/5: Analyzing transcript...")
    analysis = analyzer.analyze(transcript)
    print(f"   ✓ Found {len(analysis.get('themes', []))} themes")
    print(f"   ✓ Extracted {len(analysis.get('contrarian_takes', []))} contrarian takes")
    print(f"   ✓ Identified {len(analysis.get('quotable_moments', []))} quotable moments\n")

    # Step 2: Generate content ideas
    print(f"💡 Step 2/5: Generating {args.num_ideas} content ideas...")
    ideas = ideator.generate_ideas(analysis, num_ideas=args.num_ideas)
    ideas = ideator.rank_ideas(ideas)
    print(f"   ✓ Generated {len(ideas)} unique ideas")
    print(f"   ✓ Average uniqueness score: {sum(i.get('uniqueness_score', 0) for i in ideas) / len(ideas):.1f}/10\n")

    # Step 3: Generate posts
    print(f"✍️  Step 3/5: Generating X posts ({args.posts_per_idea} per idea)...")
    posts = generator.generate_posts(ideas, posts_per_idea=args.posts_per_idea)
    print(f"   ✓ Generated {len(posts)} total posts")
    print(f"   ✓ Average length: {sum(p['length'] for p in posts) / len(posts):.0f} characters\n")

    # Step 4: Quality check
    print("🎯 Step 4/5: Running quality checks...")
    checked_posts = quality_checker.check_batch(posts)
    passing_posts = quality_checker.filter_passing_posts(checked_posts, min_score=args.min_score)
    print(f"   ✓ {len(passing_posts)} posts passed quality check (score >= {args.min_score})")
    print(f"   ✓ {len(checked_posts) - len(passing_posts)} posts flagged for issues\n")

    # Step 5: Format and display results
    print("📊 Step 5/5: Formatting results...\n")

    # Show summary table
    formatter.display_summary_table(checked_posts)

    # Display detailed results
    formatter.display_results(checked_posts, show_all=args.show_all)

    # Export to file
    if not args.no_export:
        formatter.export_to_file(checked_posts, filename=args.output)

    print("✅ Workflow complete!\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Workflow interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
