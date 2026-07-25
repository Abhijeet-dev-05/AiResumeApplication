# Resume Genie

An AI-powered resume analysis platform that helps job seekers optimize their resumes, prepare for interviews, generate cover letters, build portfolio websites, and get personalized career coaching — all from a single PDF upload.

---

## Features

| Feature | Description |
|---|---|
| **Resume Checker** | Full ATS-level evaluation with scoring across 9 categories, skills extraction, strengths/weaknesses, and actionable improvement suggestions |
| **Resume Scorer** | Score your resume against a specific job description with keyword matching, skill gap analysis, and industry-specific feedback |
| **Cover Letter Generator** | Streaming AI-generated, ATS-friendly cover letter tailored to a job description |
| **Profile Builder** | Generates a self-contained premium HTML/CSS/JS portfolio website from your resume |
| **Interview Questions** | Generates a categorized question bank (5–8 questions per category) based on your actual resume content |
| **Career Coach** | Streaming chat interface with an AI mentor that has full context of your resume |

---

## Tech Stack

### Backend
- **FastAPI** — REST API with async support and streaming responses
- **LangChain + Groq** — LLM orchestration using `llama-3.3-70b-versatile`
- **MongoDB (Motor)** — Async database for users and generated profiles
- **PyPDF** — PDF text extraction
- **JWT Authentication** — Access + refresh token flow with bcrypt password hashing

### Frontend
- **React 19** — Component-based UI
- **Vite** — Build tool and dev server
- **Tailwind CSS v4** — Utility-first styling
- **Recharts** — Score visualization charts
- **Axios** — HTTP client with auth interceptors
- **Lucide React** — Icon library

---

## Project Structure

```
Resume-Genie/
├── backend/
│   ├── app.py                  # FastAPI app, all API routes and LLM prompts
│   ├── profile_builder.py      # Python HTML template for portfolio generation
│   ├── html_template.py        # HTML utilities
│   ├── requirements.txt
│   ├── .env                    # Environment variables (not committed)
│   └── auth/
│       ├── config.py           # JWT and MongoDB config
│       ├── database.py         # Motor async MongoDB client
│       ├── jwt.py              # Token creation and verification
│       ├── models.py           # User document schema
│       ├── routes.py           # Auth endpoints (register, login, refresh, me)
│       ├── schemas.py          # Pydantic request/response models
│       └── security.py         # bcrypt password hashing
└── frontend/
    ├── src/
    │   ├── pages/              # Full-page views (ResumeChecker, CoverLetter, etc.)
    │   ├── components/         # Reusable UI components
    │   ├── hooks/              # Custom React hooks per feature
    │   ├── context/            # AuthContext (axios instance + token refresh) and ThemeContext
    │   └── services/api.js     # All API calls, including streaming handlers
    ├── vite.config.js          # Dev server with backend proxy
    └── package.json
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB instance (local or Atlas)
- [Groq API key](https://console.groq.com/)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Resume-Genie.git
cd Resume-Genie
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here

MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=resume_genie

JWT_SECRET_KEY=your-strong-secret-key
JWT_REFRESH_SECRET_KEY=your-strong-refresh-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

Start the backend server:

```bash
uvicorn app:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create a new account |
| `POST` | `/auth/login` | No | Login, returns JWT tokens |
| `POST` | `/auth/refresh` | No | Refresh access token |
| `GET` | `/auth/me` | Yes | Get current user profile |
| `PATCH` | `/auth/me` | Yes | Update name or password |
| `POST` | `/auth/logout` | No | Logout (client-side token drop) |
| `POST` | `/analyze` | Yes | Full resume analysis |
| `POST` | `/score-resume` | Yes | Score resume against a job description |
| `POST` | `/cover-letter` | Yes | Generate cover letter (streaming) |
| `POST` | `/build-profile` | Yes | Generate portfolio HTML, save to DB |
| `GET` | `/my-profile` | Yes | Get current user's saved profile metadata |
| `GET` | `/profile/{id}` | No | View a generated portfolio (public link) |
| `POST` | `/interview-questions` | Yes | Generate interview question bank |
| `POST` | `/career-coach/init` | Yes | Upload resume to start a coaching session |
| `POST` | `/career-coach/chat` | Yes | Send a message, receive streaming response |
| `GET` | `/health` | No | Health check |

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | API key from [console.groq.com](https://console.groq.com/) |
| `MONGODB_URL` | MongoDB connection string |
| `MONGODB_DB_NAME` | Database name (default: `resume_genie`) |
| `JWT_SECRET_KEY` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET_KEY` | Secret for signing refresh tokens |
| `JWT_ALGORITHM` | Algorithm for JWT (default: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL in minutes (default: `30`) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL in days (default: `7`) |

---

## How It Works

1. User signs up / logs in — JWT access and refresh tokens are issued.
2. User uploads a PDF resume to any feature endpoint.
3. The backend extracts text using PyPDF and sends it to the Groq LLM (`llama-3.3-70b-versatile`) via LangChain with a carefully engineered prompt.
4. For standard features (Resume Checker, Scorer, Interview Questions), the LLM returns structured JSON which is parsed and sent to the frontend.
5. For streaming features (Cover Letter, Career Coach), tokens are streamed back via `StreamingResponse` and rendered in real time.
6. For Profile Builder, a lean data-extraction prompt extracts structured data, which is then fed into a server-side Python HTML template to generate the full portfolio — avoiding LLM token limits.
7. Generated portfolios are stored in MongoDB and accessible via a public shareable link (`/profile/{id}`).

---

## License

MIT
