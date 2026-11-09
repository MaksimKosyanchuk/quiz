# Quiz Builder

Full-stack app for creating and browsing custom quizzes.

- **Backend:** NestJS, TypeScript, Prisma, PostgreSQL (`/backend`)
- **Frontend:** Next.js (React), TypeScript, SCSS, React Hook Form + Zod (`/frontend`)

## Quick start (Docker)

One command starts the database, backend and frontend:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Migrations are applied automatically when the backend starts.

Open http://localhost:3000, register an account (username + password), then create or take quizzes.

Load the sample data (optional). It creates a `demo` user (password `demo1234`) with one sample quiz:

```bash
docker compose exec backend npx prisma db seed
```

## Local development (without Docker for the apps)

1. Start only the database:

    ```bash
    docker compose up -d db
    ```

2. Backend:

    ```bash
    cd backend
    cp .env.example .env
    npm install
    npx prisma migrate dev   # creates the schema
    npm run seed             # optional: sample quiz
    npm run start:dev        # http://localhost:4000
    ```

3. Frontend:

    ```bash
    cd frontend
    cp .env.example .env
    npm install
    npm run dev              # http://localhost:3000
    ```

### Environment variables

| App      | Variable              | Default                                                            |
| -------- | --------------------- | ------------------------------------------------------------------ |
| backend  | `PORT`                | `4000`                                                             |
| backend  | `JWT_SECRET`          | `dev-secret-change-me` (change it outside local dev)               |
| backend  | `FRONTEND_URL`        | `http://localhost:3000` (CORS origin)                              |
| backend  | `DATABASE_URL`        | `postgresql://quiz:quiz@localhost:5432/quiz_builder?schema=public` |
| frontend | `NEXT_PUBLIC_API_URL` | `http://localhost:4000`                                            |

`.env` files are git-ignored; use the `.env.example` files as templates.

## Accounts and progress

- Users register and log in with a username and password. Passwords are hashed with bcrypt and never stored in plain text. Login returns a JWT that the frontend sends as `Authorization: Bearer <token>`.
- Every quiz endpoint requires authentication.
- A quiz is "completed" for a user when that account has at least one attempt for it. The list shows the last score, and completed quizzes get a **Retake** button instead of **Take**. Every attempt is stored.
- Answers are checked on the server. The correct answers are only returned to the quiz author; everyone else gets the quiz without them. Only the author can delete a quiz.

## API

| Method | Path                    | Description                                                 |
| ------ | ----------------------- | ----------------------------------------------------------- |
| POST   | `/auth/register`        | Register (`username`, `password`), returns a token          |
| POST   | `/auth/login`           | Log in, returns a token                                     |
| GET    | `/auth/me`              | Current user                                                |
| POST   | `/quizzes`              | Create a quiz                                               |
| GET    | `/quizzes`              | List quizzes with `questionsCount`, `completed`, last score |
| GET    | `/quizzes/:id`          | Quiz with questions (answers only for the author)           |
| POST   | `/quizzes/:id/attempts` | Submit answers, returns score and per-question result       |
| DELETE | `/quizzes/:id`          | Delete a quiz (author only, 204)                            |


