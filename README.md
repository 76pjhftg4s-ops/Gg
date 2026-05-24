# YouTube to X Content Creation Workflow

**Transform YouTube video transcripts into high-quality, copy-paste ready X (Twitter) posts.**

This automated workflow takes a YouTube transcript as input and outputs quality-checked social media content optimized for engagement and uniqueness, with built-in AI slop detection.

## 🎯 What It Does

1. **Analyzes** YouTube transcripts to extract key themes, arguments, and contrarian takes
2. **Generates** unique content ideas focused on engaging, controversial angles
3. **Creates** X posts (280 character limit) optimized for attention and shareability
4. **Quality checks** every post for AI slop, generic phrases, and uniqueness
5. **Outputs** clean, ready-to-paste content ranked by quality score

## ✨ Features

- **AI-Powered Analysis**: Deep analysis of transcripts using Claude Sonnet 4
- **Contrarian Focus**: Prioritizes unique, controversial, and attention-grabbing angles
- **AI Slop Detection**: Filters out generic phrases like "let that sink in", "game changer", etc.
- **Quality Scoring**: Every post gets a quality score (0-100) based on uniqueness and engagement potential
- **Character Limit Enforcement**: All posts guaranteed to be ≤280 characters
- **Rich CLI Output**: Beautiful terminal interface with color-coded results
- **Export Ready**: Generates text file with all passing posts for easy access

## 📋 Prerequisites

- Python 3.8+
- Anthropic API key (Claude)

## 🚀 Quick Start

### 1. Installation

```bash
# Clone or navigate to the repository
cd Gg

# Install dependencies
pip install -r requirements.txt

# Set your API key
export ANTHROPIC_API_KEY='your-api-key-here'
```

### 2. Basic Usage

```bash
# Run with example transcript
python main.py example_transcript.txt

# Run with your own transcript
python main.py path/to/your/transcript.txt
```

### 3. Get Your Output

The workflow will:
- Display results in your terminal with color-coded quality scores
- Export passing posts to `x_posts.txt` (ready to copy and paste)

## 📖 Detailed Usage

### Command Line Options

```bash
python main.py [transcript_file] [options]

Options:
  --output, -o          Output file for posts (default: x_posts.txt)
  --num-ideas, -n       Number of content ideas to generate (default: 15)
  --posts-per-idea, -p  Posts to generate per idea (default: 2)
  --min-score, -m       Minimum quality score 0-100 (default: 70)
  --show-all            Show posts that failed quality check
  --no-export           Don't export posts to file
```

### Examples

```bash
# Generate more ideas
python main.py transcript.txt --num-ideas 25

# Generate more variations per idea
python main.py transcript.txt --posts-per-idea 3

# Lower quality threshold
python main.py transcript.txt --min-score 60

# See all posts including rejected ones
python main.py transcript.txt --show-all

# Custom output file
python main.py transcript.txt --output my_posts.txt
```

## 🎨 Workflow Pipeline

### Stage 1: Transcript Analysis
Extracts:
- Main themes and topics
- Key arguments and claims
- Contrarian or unique perspectives
- Quotable moments
- Data points and statistics

### Stage 2: Content Ideation
Generates content ideas with:
- Focus on unique/contrarian angles
- Attention-grabbing hooks
- Engagement optimization
- Uniqueness scoring (1-10)

### Stage 3: Post Generation
Creates X posts that:
- Stay within 280 character limit
- Use punchy, active language
- Avoid AI clichés and generic phrases
- Sound human and authentic

### Stage 4: Quality Checking
Scores posts based on:
- ✅ Absence of AI slop patterns
- ✅ No generic business jargon
- ✅ Concrete details and specifics
- ✅ Unique structure and formatting
- ✅ Appropriate use of caps/emojis/hashtags

### Stage 5: Output Formatting
Provides:
- Color-coded quality scores
- Easy-to-copy post formatting
- Summary statistics
- Exported text file

## 🔍 Quality Scoring System

Posts are scored 0-100 based on:

| Score | Rating | Description |
|-------|--------|-------------|
| 80-100 | Excellent | Unique, engaging, zero AI slop |
| 70-79 | Good | Minor issues, generally solid |
| 50-69 | Fair | Multiple issues, needs work |
| 0-49 | Poor | Heavy AI slop or generic content |

**Default minimum score: 70** (only "Good" and "Excellent" posts pass)

## ⚠️ AI Slop Detection

The quality checker flags and penalizes:

**AI Slop Phrases:**
- "let that sink in"
- "imagine a world where"
- "game changer"
- "buckle up"
- "plot twist"
- "mic drop"
- And 15+ more common AI clichés

**Generic Business Jargon:**
- "paradigm shift"
- "low-hanging fruit"
- "circle back"
- "deep dive"
- "synergy"
- And more corporate speak

**Other Quality Issues:**
- Excessive emojis (>2)
- Hashtag spam (>2)
- ALL CAPS abuse
- Vague language
- Generic structures

## 📁 Project Structure

```
Gg/
├── main.py                      # CLI entry point
├── requirements.txt             # Python dependencies
├── example_transcript.txt       # Sample transcript
├── x_posts.txt                  # Generated output (created when run)
├── youtube_to_x/
│   ├── __init__.py
│   ├── analyzer.py              # Transcript analysis
│   ├── ideator.py               # Content idea generation
│   ├── generator.py             # X post creation
│   ├── quality_checker.py       # AI slop detection & scoring
│   └── formatter.py             # Output formatting
└── README.md                    # This file
```

## 💡 Tips for Best Results

### Getting Good Transcripts
1. Use YouTube's auto-generated transcripts or better yet, human transcripts
2. Clean up obvious errors before processing
3. Longer transcripts (5-15 minutes) work best
4. Content with strong opinions/data points produces better posts

### Optimizing Output
1. Start with default settings, adjust based on results
2. Use `--show-all` to see what's being filtered out
3. Lower `--min-score` if you want more variety
4. Increase `--num-ideas` for more diverse angles
5. Increase `--posts-per-idea` for more variations per theme

### Customizing for Your Voice
The workflow is designed to be neutral and adaptable. To customize:
1. Edit prompts in `ideator.py` and `generator.py`
2. Adjust AI slop patterns in `quality_checker.py`
3. Modify scoring weights in quality checks

## 🛠 Development

### Adding Custom Quality Checks

Edit `youtube_to_x/quality_checker.py`:

```python
# Add your patterns
CUSTOM_PATTERNS = [
    r"your pattern here",
    r"another pattern",
]

# Add check in check_post method
if self._count_custom_patterns(text) > 0:
    issues.append("Custom issue detected")
    score -= 15
```

### Modifying Post Style

Edit `youtube_to_x/generator.py` to change the prompt that generates posts.

### Using Different AI Models

Edit the model name in `analyzer.py`, `ideator.py`, and `generator.py`:

```python
model="claude-sonnet-4-20250514"  # Change this
```

## 🐛 Troubleshooting

**"ANTHROPIC_API_KEY not found"**
```bash
export ANTHROPIC_API_KEY='your-key-here'
```

**"No posts passed quality check"**
- Try lowering `--min-score`
- Use `--show-all` to see what failed and why
- Check if transcript has enough substantive content

**Posts are too generic**
- Increase `--num-ideas` to generate more options
- Check that transcript has unique/contrarian content
- Modify prompts to emphasize uniqueness

**API Errors**
- Check your API key is valid
- Ensure you have sufficient API credits
- Check network connection

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Credits

Built with:
- [Anthropic Claude](https://www.anthropic.com/) - AI analysis and generation
- [Rich](https://rich.readthedocs.io/) - Terminal formatting
- Python 3.8+

## 🚀 What's Next?

Input your transcript, run the workflow, and get quality X posts ready to paste!

```bash
python main.py your_transcript.txt
```

Your posts will be displayed in the terminal and exported to `x_posts.txt`.

**Just copy and paste onto X. No editing needed.**
