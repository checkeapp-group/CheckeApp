# 🔄 Application Flow & Architecture

This document describes the complete flow of the FactCheckerProject application, from text submission to displaying the final verification result.

---

## 📊 Overview

The application follows a **4-step verification process**:

1. 📝 **Text Submission** - User enters text to verify
2. ❓ **Question Generation & Editing** - AI generates questions, user reviews/edits
3. 🔗 **Source Selection** - Backend finds sources, user selects relevant ones
4. 📊 **Final Analysis** - AI analyzes and displays results

---

## 🚀 Step 1: Text Submission & Question Generation

The user submits text for verification, and the system generates critical questions.

### Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Web App
    participant Server API
    participant External API
    participant Database

    User->>Web App: Submits text
    Web App->>Server API: POST /api/verify/start (with text)
    Server API->>Database: CREATE verification (userId, text)
    Database-->>Server API: Returns verificationId
    Server API->>External API: generateQuestions(verificationId, text)
    External API-->>Server API: Returns [Questions]
    Server API->>Database: CREATE critical_questions (for verificationId)
    Server API->>Database: UPDATE verification SET status='processing_questions'
    Server API-->>Web App: { success: true, verification_id }
    Web App->>User: Redirects to /verify/[id]/edit
```

### Implementation Details

#### Frontend

- The TextInputForm makes a POST request to the server's ORPC
- Text is submitted through the form
- Response includes verificationId and generated questions
- User is redirected to Step 2

#### Backend

- The route creates a verification record
- Calls the externalApiClient to generate questions
- Saves questions to the critical_questions table
- Updates the verification status to questions_ready

#### Key Files

- apps/web/src/components/TextInputForm.tsx
- apps/server/src/app/api/verify/start/route.ts

## ❓ Step 2: Question Confirmation & Source Search

The user reviews, edits, and finally confirms the questions.

### Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Web App
    participant Server (tRPC)
    participant External API
    participant Database

    User->>Web App: Edits and confirms questions
    Web App->>Server (tRPC): RPC call: confirmQuestionsAndSearchSources(verificationId)
    Server (tRPC)->>Database: GET critical_questions (for verificationId)
    Database-->>Server (tRPC): Returns [Questions]
    Server (tRPC)->>External API: searchSources([Questions])
    External API-->>Server (tRPC): Returns [Sources]
    Server (tRPC)->>Database: CREATE source (for verificationId)
    Server (tRPC)->>Database: UPDATE verification SET status='sources_ready'
    Server (tRPC)-->>Web App: { success: true }
    Web App->>User: Displays the source list (SourcesList)
```

### Implementation Details

#### Frontend

- The QuestionsList component handles the edits
- Users can add, edit, delete, and reorder questions
- Clicking "Confirm" triggers the searchSourcesMutation in VerificationFlow
- Mutation executes the tRPC procedure

#### Backend

- The questionRouter receives the call
- Gets the final questions from the database
- Calls the externalApiClient to search for sources
- Saves received sources to the source table
- Updates the status to sources_ready

#### Key Files

- apps/web/src/components/QuestionsList.tsx
- apps/web/src/components/VerificationFlow.tsx
- apps/server/src/routers/questionRouter.ts

## 🔗 Step 3: Source Selection & Analysis Initiation

The user selects the most relevant sources and proceeds to the final analysis.

```mermaid
sequenceDiagram
    participant User
    participant Web App
    participant Server (oRPC)
    participant External API
    participant Database

    User->>Web App: Selects sources and confirms
    Web App->>Server (oRPC): RPC call: continueToAnalysis(verificationId)
    Server (oRPC)->>Database: UPDATE verification SET status='generating_summary'
    Server (oRPC)-->>Web App: { success: true, nextStep: 'finalResult' }
    Web App->>User: Redirects to /verify/[id]/finalResult

    Note right of Server (oRPC): The following process is asynchronous
    Server (oRPC)->>Database: GET selected sources & questions
    Database-->>Server (oRPC): Returns data
    Server (oRPC)->>External API: generateAnalysis(data)
    External API-->>Server (oRPC): Returns final result
    Server (oRPC)->>Database: CREATE final_result
    Server (oRPC)->>Database: UPDATE verification SET status='completed'
```

### Implementation Details

#### Frontend

- The SourcesList component manages the selection
- Upon confirmation, VerificationFlow calls the continueToAnalysisMutation
- Mutation executes the oRPC procedure
- User is redirected to the results page

#### Backend

- The sourcesRouter receives the call
- Updates status to generating_summary
- Returns response to client
- Asynchronously starts generateAndSaveFinalAnalysis process

Step 4: Viewing the Final Result
The results page polls the server until the analysis is complete.

```mermaid
sequenceDiagram
    participant User
    participant Web App
    participant Server (oRPC)
    participant Database

    User->>Web App: Lands on the result page

    loop Polling every 3 seconds
        Web App->>Server (oRPC): RPC call: getVerificationResultData(verificationId)
        Server (oRPC)->>Database: GET verification & final_result
        alt Result is not ready yet
            Database-->>Server (oRPC): final_result is NULL
            Server (oRPC)-->>Web App: { finalResult: null, status: 'generating_summary' }
        else Result is ready
            Database-->>Server (oRPC): Returns complete data
            Server (oRPC)-->>Web App: { finalResult: {...}, ... }
            Web App->>User: Displays the VerificationResult component
        end
    end
```

## Frontend and Backend Polling Implementation

### Frontend: `finalResult/page.tsx`

The `finalResult/page.tsx` page uses `useQuery` from **TanStack Query** with a `refetchInterval` to poll the `getVerificationResultData` procedure.

### Backend: `sourcesRouter`

The `sourcesRouter` responds to each poll with the current status. Once the asynchronous process from Step 3 has created the record in `final_results`, the next polling call will return the complete data, and the frontend will stop polling.