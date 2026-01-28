# Guide Me 📚

A Next.js web application that transforms YouTube tutorials into structured, easy-to-follow lessons optimized for visual learners.

## Features

- 🎥 Extract transcripts from YouTube videos
- 🤖 AI-powered lesson structuring using GPT-4
- 📝 Organized content with sections, key points, and visual notes
- ✨ Beautiful, responsive UI
- 🎯 Learning objectives and action items
- ⚡ Fast and efficient processing

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/flatfinderai-cyber/Guide-Me.git
cd Guide-Me
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Application

Development mode:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Production build:
```bash
npm run build
npm start
```

## API Endpoint

### POST /api/lesson-from-youtube

Converts a YouTube video into a structured lesson.

**Request Body:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "success": true,
  "videoId": "VIDEO_ID",
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "lesson": {
    "title": "Lesson Title",
    "description": "Brief description",
    "duration": "10 minutes",
    "objectives": ["Learn X", "Understand Y"],
    "sections": [
      {
        "title": "Section Title",
        "timestamp": "0:00",
        "content": "Section content...",
        "keyPoints": ["Point 1", "Point 2"],
        "visualNotes": "Visual learning tips..."
      }
    ],
    "summary": "Overall summary",
    "actionItems": ["Action 1", "Action 2"]
  },
  "transcriptLength": 5000,
  "generatedAt": "2026-01-28T11:25:49.194Z"
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## How It Works

1. **Video URL Input**: User provides a YouTube video URL
2. **Transcript Extraction**: The app fetches the video's transcript using the `youtube-transcript` library
3. **AI Processing**: The transcript is sent to OpenAI's GPT-4 with a specialized prompt that structures the content into:
   - Learning objectives
   - Organized sections with timestamps
   - Key points for each section
   - Visual learning notes
   - Summary and action items
4. **Structured Output**: The AI returns a JSON-formatted lesson optimized for visual learners

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **AI**: OpenAI GPT-4
- **Transcript**: youtube-transcript library
- **Styling**: CSS Modules

## Project Structure

```
Guide-Me/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── lesson-from-youtube/
│   │   │       └── route.ts          # API endpoint
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── page.module.css           # Page styles
│   │   └── globals.css               # Global styles
│   ├── lib/                          # Utility functions (future)
│   └── types/                        # TypeScript types (future)
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── next.config.js                    # Next.js configuration
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # This file
```

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.