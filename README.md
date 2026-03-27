<<<<<<< HEAD

# 🧠 AI-Powered Technical Interview Prepper

A full-stack application designed to simulate real-world technical interviews. It allows users to practice answering conceptual and coding questions verbally and programmatically, receiving instant, AI-driven feedback on their performance.

## ✨ Key Features

* **Customizable Interviews**: Select Role (MERN, Python, Data Science), Difficulty Level, and Interview Type (Oral vs. Coding Mix).
* **Hybrid Input System**:
* **🎙️ Voice Response**: Uses **OpenAI Whisper** to transcribe verbal answers for conceptual questions.
* **💻 Code Editor**: Integrated **Monaco Editor** for solving coding challenges directly in the browser.


* **AI Microservice Architecture**:
* **Question Generation**: dynamically creates unique interview questions using **Ollama (Mistral)**.
* **Smart Evaluation**: Analyzes both code logic and verbal transcription to provide a **Technical Score** and **Confidence Score**.


* **Detailed Analytics**:
* Session history with global scores.
* Per-question breakdown showing user submission vs. ideal implementation.
* Performance charts using **Chart.js**.


* **Secure Authentication**: JWT-based user login and registration.

---

## 🛠️ Tech Stack

### **Frontend**

* **Framework**: React (Vite)
* **State Management**: Redux Toolkit
* **Styling**: Tailwind CSS
* **Editor**: `@monaco-editor/react`
* **Visualization**: Chart.js / React-Chartjs-2
* **Routing**: React Router Dom

### **Backend (API Gateway)**

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB (Mongoose)
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs

### **AI Microservice**

* **Runtime**: Python 3.9+
* **Framework**: FastAPI
* **LLM Engine**: Ollama (running `mistral` locally)
* **Speech-to-Text**: OpenAI Whisper (`base.en` model)
* **Audio Processing**: PyDub / FFMPEG

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v16+) and **npm**.
2. **Python** (v3.9+) and **pip**.
3. **MongoDB**: Local instance or Atlas URI.
4. **Ollama**: Installed and running locally.
* Install from [ollama.com](https://ollama.com).
* Pull the model: `ollama pull mistral`.


5. **FFmpeg**: Required for audio processing (should be in your system PATH).

### 1. Clone the Repository

```bash
git clone https://github.com/siddhantsaxenaofficial/ai-interviewer.git
cd ai-interviewer

```

### 2. Backend Setup (Node.js)

```bash
cd backend
npm install
```

# AI Interviewer Practice Platform — Detailed SRS & Feature Overview

## 1. Project Overview & Impact
This platform simulates real-world technical interviews for self-practice, not hiring. It helps users build confidence, improve coding and communication skills, and receive instant, AI-driven feedback. All features are designed for learning, not recruitment.

## 2. System Architecture

**Frontend:** React (Vite), Tailwind CSS, Redux Toolkit, Socket.io, Monaco Editor, Chart.js

**Backend:** Node.js (Express), MongoDB (Mongoose), JWT Auth, REST API, Socket.io, Multer (audio upload)

**AI Service:** Python (FastAPI), Ollama (Mistral LLM), OpenAI Whisper (speech-to-text), PyDub/FFmpeg

**Architecture Diagram:**
```
[Frontend (React)] <-> [Backend (Node.js/Express)] <-> [AI Service (Python)]
																	 |
															[MongoDB]
```

## 3. User Roles & Flows

- **User**: Registers, logs in, sets profile (name, email, preferred role), creates and completes interview sessions, reviews results.

## 4. Features (SRS Style)

### 4.1 Authentication & Profile
- Register (email, password, name, Google OAuth)
- Login (email/password, Google OAuth)
- JWT-based session management
- Profile view & update (name, preferred role)

### 4.2 Interview Session Management
- Create new session: select role, level (junior/mid/senior), type (oral-only/coding-mix), question count
- View all past sessions (history)
- Delete session (if not pending)

### 4.3 Interview Process
- Real-time question generation via AI (Ollama LLM)
- Each session contains a mix of coding and/or oral questions
- For each question:
	- Record verbal answer (browser mic, stored as audio)
	- Write code answer (Monaco Editor, multi-language)
	- Submit answer (audio + code sent to backend)
- Lock question after submission; cannot edit
- Real-time status updates via Socket.io

### 4.4 AI Evaluation & Feedback
- Audio transcribed to text (OpenAI Whisper)
- AI evaluates answer (coding: code + transcript, oral: transcript)
- AI returns:
	- Technical Score (0-100)
	- Confidence Score (0-100)
	- AI Feedback (text)
	- Ideal Answer (markdown)
- Feedback shown instantly after evaluation

### 4.5 Session Review & Analytics
- After session ends, user can review:
	- Per-question: user answer, ideal answer, AI feedback, scores
	- Overall: global score, average technical/confidence, session time
- Visual analytics (bar charts, stats)

### 4.6 Security & Middleware
- JWT auth middleware for all protected routes
- Multer for secure audio upload (10MB limit, audio only)
- Error handling middleware

## 5. API Endpoints (Main)

### User
- `POST /api/users/register` — Register
- `POST /api/users/login` — Login
- `POST /api/users/google` — Google OAuth
- `GET/PUT /api/users/profile` — Get/Update profile

### Session
- `GET /api/sessions/` — List user sessions
- `POST /api/sessions/` — Create session (triggers async AI question generation)
- `GET /api/sessions/:id` — Get session details
- `DELETE /api/sessions/:id` — Delete session
- `POST /api/sessions/:id/submit-answer` — Submit answer (audio+code)
- `POST /api/sessions/:id/end` — End session (triggers review)

### AI Service
- `POST /generate-questions` — Generate questions (role, level, count, type)
- `POST /transcribe` — Transcribe audio to text
- `POST /evaluate` — Evaluate answer (returns scores, feedback, ideal answer)

## 6. Data Models (Simplified)

### User
- name, email, password (hashed), googleId, preferredRole

### Session
- user, role, level, interviewType, status, overallScore, metrics, questions[], startTime, endTime

### Question (subdoc)
- questionText, questionType (oral/coding), idealAnswer, userAnswerText, userSubmittedCode, isSubmitted, isEvaluated, technicalScore, confidenceScore, aiFeedback

## 7. What Makes This Project Unique
- **Practice-Only:** No hiring, no recruiters, just learning
- **Hybrid Input:** Voice (transcribed) + code for each question
- **AI-Driven:** Real-time question generation, evaluation, and feedback
- **Session Analytics:** Per-question and global stats, visualized
- **Modern UX:** Responsive, accessible, and fast
- **Open Source & Extensible:** Easy to modify for new roles, question types, or AI models

## 8. Getting Started
1. Clone the repository
2. Install dependencies for each service (frontend, backend, ai-service)
3. Start MongoDB, backend, and AI service
4. Run the frontend and access the platform in your browser

---
This project is for educational and practice purposes only. Enjoy learning and improving your interview skills!
=======
# PrepPilot-AI
PrepPilot AI is a full-stack MERN application designed to help users prepare for technical interviews using AI-driven mock interviews and detailed performance analysis.
>>>>>>> 298f8c28bece00df35d19d497413d04e7e060649
