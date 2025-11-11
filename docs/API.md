# 🔌 API Documentation

## Overview

This document describes the two primary API interfaces in the CheckeApp:

1. **Internal API (oRPC)**: A type-safe API used for all communication between the frontend (`web`) and the backend (`server`).
2. **External API (REST)**: A RESTful API provided by an external AI service, which the backend calls to perform long-running tasks like generating questions and analyzing sources.

---

## 1. Internal API (oRPC)

This is the primary API for the application's business logic. It is built using **oRPC**, ensuring end-to-end type safety.

- **Endpoint**: All requests are routed through `/rpc/*`.
- **Implementation**: Defined in `apps/server/src/routers/`.
- **Client**: Consumed by the frontend via the generated client in `apps/web/src/utils/orpc.ts`.

### Key oRPC Procedures

This is not an exhaustive list but covers the main procedures in the verification flow.

| Procedure                          | Router               | Input                           | Output                       | Description                                                                         |
| :--------------------------------- | :------------------- | :------------------------------ | :--------------------------- | :---------------------------------------------------------------------------------- |
| `startVerification`                | `verificationRouter` | `{ text, language }`            | `{ verificationId, job_id }` | Creates a verification record and starts the external job to generate questions.    |
| `getJobResult`                     | `verificationRouter` | `{ jobId }`                     | `{ status, result }`         | Polls the external API to get the status and result of an asynchronous job.         |
| `getVerificationQuestions`         | `questionRouter`     | `{ verificationId }`            | `Question[]`                 | Fetches the critical questions for a verification.                                  |
| `confirmQuestionsAndSearchSources` | `questionRouter`     | `{ verificationId }`            | `{ jobId }`                  | Confirms user-edited questions and starts the external job to search for sources.   |
| `updateSourceSelection`            | `sourcesRouter`      | `{ sourceId, isSelected }`      | `{ success }`                | Updates the selection status of a source.                                           |
| `continueToAnalysis`               | `sourcesRouter`      | `{ verificationId }`            | `{ success }`                | Starts the final asynchronous analysis process (article and image generation).      |
| `getVerificationProgress`          | `verificationRouter` | `{ verificationId }`            | `{ status, hasFinalResult }` | A lightweight polling endpoint for the frontend to check the final analysis status. |
| `getFinalResult`                   | `verificationRouter` | `{ verificationId }`            | `FinalResultData`            | Fetches the complete, final verification report once it's ready.                    |
| `getMe`                            | `userRouter`         | `void`                          | `User`                       | Retrieves the authenticated user's profile.                                         |
| `getAllUsers`                      | `adminRouter`        | `void`                          | `User[]`                     | Retrieves all users (Admin only).                                                   |

---

## 2. External API (REST)

The backend communicates with this external, job-based REST API to perform AI tasks. All communication is managed by `apps/server/src/lib/externalApiClient.ts`.

- **Base URL**: `process.env.EXTERNAL_API_BASE_URL`
- **Authentication**: Requires an `X-API-Key` header.

### Asynchronous Job Flow

All `POST` endpoints follow an asynchronous pattern:

1. The backend sends a `POST` request to start a job.
2. The external API immediately responds with a `200 OK` and a `{ job_id }`.
3. The backend (or frontend, via an oRPC procedure) must then poll the `GET /result/{job_id}` endpoint until the `status` is `completed` or `failed`.

### Key External Endpoints

#### `POST /stepwise/critical-questions`

- **Purpose**: Starts a job to generate critical questions from a text.
- **Payload**: `{ "input": string, "model": string, "language": string, "location": string }`
- **Returns**: `{ "job_id": string }`

#### `POST /stepwise/search-sources`

- **Purpose**: Starts a job to find relevant sources based on a list of questions.
- **Payload**: `{ "questions": string[], "input": string, "language": string, "location": string, "model": string }`
- **Returns**: `{ "job_id": string }`

#### `POST /stepwise/generate-article`

- **Purpose**: Starts the final analysis job to generate the fact-checking article.
- **Payload**: `{ "questions": string[], "input": string, "language": string, "location": string, "sources": object[], "model": string }`
- **Returns**: `{ "job_id": string }`

#### `POST /stepwise/generate-image`

- **Purpose**: Starts a job to generate a final image for the verification result.
- **Payload**: `{ "input": string, "model": string, "size": string, "style": string }`
- **Returns**: `{ "job_id": string }`

#### `GET /result/{job_id}`

- **Purpose**: Polls for the result of a previously started job.
- **Returns (In Progress)**: `{ "status": "in_progress", "result": null }`
- **Returns (Completed)**: `{ "status": "completed", "result": { ... } }`

---
