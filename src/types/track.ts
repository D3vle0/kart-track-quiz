import 'express-session';

export interface Track {
    id: string;
    name: string;
    theme: string;
}

export interface QuizSubmission {
    trackId: string;
    userAnswer: string;
}

export interface QuizGradingDetail {
    index: number;
    trackId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

export interface QuizResult {
    score: number;
    correctCount: number;
    totalCount: number;
    details: QuizGradingDetail[];
}

declare module 'express-session' {
    interface SessionData {
        quizTrackIds?: string[];
    }
}
