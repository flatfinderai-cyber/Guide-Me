'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface Lesson {
  title: string;
  description: string;
  duration?: string;
  objectives?: string[];
  sections?: Array<{
    title: string;
    timestamp?: string;
    content: string;
    keyPoints?: string[];
    visualNotes?: string;
  }>;
  summary?: string;
  actionItems?: string[];
}

interface ApiResponse {
  success: boolean;
  videoId: string;
  videoUrl: string;
  lesson: Lesson;
  transcriptLength: number;
  generatedAt: string;
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lesson, setLesson] = useState<ApiResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLesson(null);
    setLoading(true);

    try {
      const response = await fetch('/api/lesson-from-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      setLesson(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Guide Me <span className={styles.emoji}>📚</span>
        </h1>
        <p className={styles.description}>
          Turn YouTube tutorials into structured lessons for visual learners
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className={styles.input}
              disabled={loading}
            />
            <button
              type="submit"
              className={styles.button}
              disabled={loading || !videoUrl}
            >
              {loading ? 'Processing...' : 'Generate Lesson'}
            </button>
          </div>
        </form>

        {error && (
          <div className={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {lesson && (
          <div className={styles.result}>
            <div className={styles.resultHeader}>
              <h2>{lesson.lesson.title}</h2>
              <p className={styles.description}>{lesson.lesson.description}</p>
              {lesson.lesson.duration && (
                <p className={styles.duration}>⏱️ Duration: {lesson.lesson.duration}</p>
              )}
            </div>

            {lesson.lesson.objectives && lesson.lesson.objectives.length > 0 && (
              <div className={styles.section}>
                <h3>Learning Objectives</h3>
                <ul>
                  {lesson.lesson.objectives.map((obj, idx) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.lesson.sections && lesson.lesson.sections.length > 0 && (
              <div className={styles.section}>
                <h3>Lesson Content</h3>
                {lesson.lesson.sections.map((section, idx) => (
                  <div key={idx} className={styles.lessonSection}>
                    <h4>
                      {section.title}
                      {section.timestamp && (
                        <span className={styles.timestamp}> ({section.timestamp})</span>
                      )}
                    </h4>
                    <p>{section.content}</p>
                    {section.keyPoints && section.keyPoints.length > 0 && (
                      <div className={styles.keyPoints}>
                        <strong>Key Points:</strong>
                        <ul>
                          {section.keyPoints.map((point, pointIdx) => (
                            <li key={pointIdx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {section.visualNotes && (
                      <div className={styles.visualNotes}>
                        <strong>📝 Visual Notes:</strong> {section.visualNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {lesson.lesson.summary && (
              <div className={styles.section}>
                <h3>Summary</h3>
                <p>{lesson.lesson.summary}</p>
              </div>
            )}

            {lesson.lesson.actionItems && lesson.lesson.actionItems.length > 0 && (
              <div className={styles.section}>
                <h3>Action Items</h3>
                <ul>
                  {lesson.lesson.actionItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.metadata}>
              <small>
                Generated at: {new Date(lesson.generatedAt).toLocaleString()} | 
                Transcript length: {lesson.transcriptLength} characters
              </small>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
