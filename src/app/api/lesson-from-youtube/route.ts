import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import OpenAI from 'openai';

// System prompt for extracting structured lessons
const EXTRACTION_PROMPT = `You are an expert in video content processing and educational content design. Your task is to analyze video transcripts and transform them into structured, easy-to-follow lessons optimized for visual learners.

When you receive a transcript, you should:
1. Identify the main topic and learning objectives
2. Break down the content into logical sections or steps
3. Extract key concepts and important information
4. Identify actionable items or takeaways
5. Organize the content in a clear, hierarchical structure

Format your response as a JSON object with the following structure:
{
  "title": "Lesson title",
  "description": "Brief description of what will be learned",
  "duration": "Estimated time to complete",
  "objectives": ["Learning objective 1", "Learning objective 2"],
  "sections": [
    {
      "title": "Section title",
      "timestamp": "Time in video (if available)",
      "content": "Detailed explanation",
      "keyPoints": ["Key point 1", "Key point 2"],
      "visualNotes": "Suggestions for visual learners"
    }
  ],
  "summary": "Brief summary of the entire lesson",
  "actionItems": ["Action item 1", "Action item 2"]
}`;

interface LessonRequest {
  videoUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: LessonRequest = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'videoUrl is required' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(videoUrl)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Extract video ID from URL
    let videoId = '';
    try {
      const url = new URL(videoUrl);
      if (url.hostname.includes('youtu.be')) {
        videoId = url.pathname.slice(1);
      } else {
        videoId = url.searchParams.get('v') || '';
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Could not parse YouTube URL' },
        { status: 400 }
      );
    }

    if (!videoId) {
      return NextResponse.json(
        { error: 'Could not extract video ID from URL' },
        { status: 400 }
      );
    }

    // Fetch transcript
    let transcript: { text: string; offset: number }[];
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return NextResponse.json(
        { error: 'Could not fetch transcript. The video may not have captions available.' },
        { status: 500 }
      );
    }

    // Combine transcript into a single text
    const transcriptText = transcript
      .map((item) => item.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!transcriptText) {
      return NextResponse.json(
        { error: 'Transcript is empty' },
        { status: 500 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Initialize OpenAI client lazily
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Process transcript with OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: EXTRACTION_PROMPT,
          },
          {
            role: 'user',
            content: `Please analyze the following video transcript and create a structured lesson:\n\n${transcriptText}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const lessonData = completion.choices[0].message.content;
      const parsedLesson = JSON.parse(lessonData || '{}');

      // Add metadata
      const response = {
        success: true,
        videoId,
        videoUrl,
        lesson: parsedLesson,
        transcriptLength: transcriptText.length,
        generatedAt: new Date().toISOString(),
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error('Error processing with OpenAI:', error);
      return NextResponse.json(
        { error: 'Failed to process transcript with AI' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
