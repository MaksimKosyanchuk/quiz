export type QuestionType = 'BOOLEAN' | 'INPUT' | 'CHECKBOX';

export interface Option {
    text: string;
    isCorrect?: boolean;
}

export interface Question {
    id: string;
    type: QuestionType;
    text: string;
    position: number;
    booleanAnswer: boolean | null;
    textAnswer: string | null;
    options: Option[] | null;
}

export interface Quiz {
    id: string;
    title: string;
    createdAt: string;
    isOwner: boolean;
    questions: Question[];
}

export interface QuizSummary {
    id: string;
    title: string;
    createdAt: string;
    questionsCount: number;
    isOwner: boolean;
    completed: boolean;
    lastAttempt: { score: number; total: number; createdAt: string } | null;
}

export interface AuthUser {
    id: string;
    username: string;
}

export interface AuthResponse {
    accessToken: string;
    user: AuthUser;
}

export interface Answer {
    questionId: string;
    booleanAnswer?: boolean;
    textAnswer?: string;
    selectedOptions?: number[];
}

export interface AttemptResult {
    id: string;
    score: number;
    total: number;
    results: { questionId: string; correct: boolean }[];
}

export interface CreateQuestionPayload {
    type: QuestionType;
    text: string;
    booleanAnswer?: boolean;
    textAnswer?: string;
    options?: Option[];
}

export interface CreateQuizPayload {
    title: string;
    questions: CreateQuestionPayload[];
}
