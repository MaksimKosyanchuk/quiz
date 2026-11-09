import type {
    Answer,
    AttemptResult,
    AuthResponse,
    AuthUser,
    CreateQuizPayload,
    Quiz,
    QuizSummary,
} from '@/types/quiz';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'quiz-builder-token';

export const tokenStore = {
    get: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
    set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
    clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
    ) {
        super(message);
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = tokenStore.get();
    const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...init?.headers,
        },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
        throw new ApiError(message ?? `Request failed (${res.status})`, res.status);
    }
    return res.status === 204 ? (undefined as T) : res.json();
}

const post = <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) });

export const authApi = {
    register: (username: string, password: string) =>
        post<AuthResponse>('/auth/register', { username, password }),
    login: (username: string, password: string) =>
        post<AuthResponse>('/auth/login', { username, password }),
    me: () => request<AuthUser>('/auth/me'),
};

export const quizApi = {
    list: () => request<QuizSummary[]>('/quizzes'),
    get: (id: string) => request<Quiz>(`/quizzes/${id}`),
    create: (payload: CreateQuizPayload) => post<Quiz>('/quizzes', payload),
    remove: (id: string) => request<void>(`/quizzes/${id}`, { method: 'DELETE' }),
    submitAttempt: (id: string, answers: Answer[]) =>
        post<AttemptResult>(`/quizzes/${id}/attempts`, { answers }),
};
