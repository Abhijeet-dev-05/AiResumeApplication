# 🚀 Resume Genie

<p align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)
![LangChain](https://img.shields.io/badge/LangChain-AI-blue?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-LLM-orange?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-Build-purple?style=for-the-badge&logo=vite)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</p>

<p align="center">
AI-powered resume analysis platform that helps job seekers optimize resumes, prepare for interviews, generate cover letters, build portfolio websites, and receive personalized AI career coaching — all from a single PDF upload.
</p>

---

# 🌐 Live Demo

### 🚀 Try Resume Genie

### **https://ai-resume-application-huh6.vercel.app/**

Experience all AI-powered features instantly without any local setup.

---

# ✨ Features

| Feature | Description |
|----------|-------------|
| 📄 Resume Checker | ATS-style resume evaluation with health score, strengths, weaknesses, skills extraction, and actionable improvement suggestions |
| 🎯 Resume Scorer | Compare your resume against any job description with keyword matching, ATS score, skill-gap analysis, and recruiter feedback |
| ✉️ Cover Letter Generator | AI-generated ATS-friendly cover letters tailored to your target role using streaming responses |
| 🌐 Profile Builder | Automatically generates a premium personal portfolio website (HTML, CSS & JavaScript) directly from your resume |
| 🎤 Interview Questions | Generates categorized interview questions based on your actual projects, skills, and experience |
| 🤖 AI Career Coach | Interactive AI mentor that understands your resume and provides personalized career guidance |

---

# 🛠 Tech Stack

## Backend

- FastAPI
- LangChain
- Groq API (Llama 3.3 70B Versatile)
- MongoDB (Motor)
- JWT Authentication
- PyPDF
- Pydantic
- bcrypt

---

## Frontend

- React 19
- Vite
- Tailwind CSS v4
- Axios
- Recharts
- Lucide React

---

## AI

- LangChain
- Groq
- Prompt Engineering
- Streaming Responses

---

# 📂 Project Structure

```
Resume-Genie/
│
├── backend/
│   ├── app.py
│   ├── profile_builder.py
│   ├── html_template.py
│   ├── requirements.txt
│   ├── auth/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── jwt.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   ├── schemas.py
│   │   └── security.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Getting Started

## Clone Repository

```bash
git clone https://github.com/Abhijeet-dev-05/AiResumeApplication.git

cd AiResumeApplication
```

---

# Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=your_api_key

MONGODB_URL=mongodb://localhost:27017

MONGODB_DB_NAME=resume_genie

JWT_SECRET_KEY=your_secret

JWT_REFRESH_SECRET_KEY=your_refresh_secret

JWT_ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

REFRESH_TOKEN_EXPIRE_DAYS=7
```

Run backend

```bash
uvicorn app:app --reload --port 8000
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Application runs at

```
http://localhost:5173
```

---

# API Endpoints

| Method | Endpoint | Description |
|----------|----------|-------------|
| POST | /auth/register | Register User |
| POST | /auth/login | Login |
| POST | /auth/refresh | Refresh JWT |
| GET | /auth/me | Current User |
| PATCH | /auth/me | Update Profile |
| POST | /analyze | Resume Checker |
| POST | /score-resume | Resume Scorer |
| POST | /cover-letter | Cover Letter |
| POST | /build-profile | Portfolio Generator |
| POST | /interview-questions | Interview Generator |
| POST | /career-coach/init | Start AI Career Coach |
| POST | /career-coach/chat | Chat with Career Coach |
| GET | /profile/{id} | Public Portfolio |
| GET | /health | Health Check |

---

# 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| GROQ_API_KEY | Groq API Key |
| MONGODB_URL | MongoDB URI |
| MONGODB_DB_NAME | Database Name |
| JWT_SECRET_KEY | JWT Secret |
| JWT_REFRESH_SECRET_KEY | Refresh Secret |
| JWT_ALGORITHM | JWT Algorithm |
| ACCESS_TOKEN_EXPIRE_MINUTES | Access Token Expiry |
| REFRESH_TOKEN_EXPIRE_DAYS | Refresh Token Expiry |

---

# 🚀 How It Works

1. User registers and logs in securely using JWT authentication.
2. Uploads a resume (PDF).
3. Resume text is extracted using PyPDF.
4. LangChain sends the resume to Groq Llama 3.3 70B with carefully engineered prompts.
5. AI generates:
   - Resume analysis
   - ATS score
   - Resume scoring
   - Cover letter
   - Interview questions
   - Career guidance
   - Portfolio website
6. Streaming responses are rendered live for Cover Letter and Career Coach.
7. Generated portfolio websites are stored in MongoDB and shared through a public URL.

---

# 🎯 Future Improvements

- Resume Version History
- AI Mock Interview with Voice
- Job Recommendation Engine
- Resume Templates
- LinkedIn Optimizer
- Multi-language Support
- PDF Portfolio Export
- Admin Dashboard

---

# 👨‍💻 Author

**Abhijeet Kumar**

- GitHub: https://github.com/Abhijeet-dev-05
- LinkedIn: *(Add your LinkedIn URL)*
- Portfolio: https://ai-resume-application-huh6.vercel.app/

---

# 📄 License

This project is licensed under the **MIT License**.
