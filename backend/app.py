import os
import os
import json
import tempfile
import re

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from langchain_groq import ChatGroq
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.prompts import PromptTemplate

# ── Auth imports ───────────────────────────────────────────
from profile_builder import DATA_PROMPT, build_html as build_profile_html
from auth.routes import router as auth_router
from auth.jwt import get_current_user
from auth.database import get_client, close_connection

# ─────────────────────────────────────────
# Load environment variables
# ─────────────────────────────────────────
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not found. Add it to your .env file.")

# ─────────────────────────────────────────
# FastAPI app
# ─────────────────────────────────────────
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup — ping MongoDB to confirm connection
    try:
        client = get_client()
        await client.admin.command("ping")
        print("✅  MongoDB connected.")
    except Exception as e:
        print(f"⚠️  MongoDB connection warning: {e}")
    yield
    # shutdown
    await close_connection()
    print("MongoDB connection closed.")

app = FastAPI(title="Resume Genie API", version="1.0.0", lifespan=lifespan)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register auth router ───────────────────────────────────
app.include_router(auth_router)

# ─────────────────────────────────────────
# Groq LLM
# ─────────────────────────────────────────
chat = ChatGroq(
    model="llama-3.3-70b-versatile",  # 128k context, 32k TPM on free tier
    api_key=GROQ_API_KEY,
    temperature=0.1,
    max_tokens=8000,
)

# ── Separate LLM for Profile Builder ─────────────────────
# Uses same model — tiny DATA_PROMPT keeps total well under TPM limit
profile_chat = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=GROQ_API_KEY,
    temperature=0.1,
    max_tokens=2000,   # data JSON only — doesn't need much
)

# ─────────────────────────────────────────
# Resume Checker Prompt
# ─────────────────────────────────────────
RESUME_CHECKER_PROMPT = PromptTemplate(
    input_variables=["context"],
    template="""
You are an expert Applicant Tracking System (ATS), Senior Technical Recruiter,
Hiring Manager, Resume Reviewer, and Career Coach with more than 15 years of
experience hiring Software Engineers, Backend Engineers, AI Engineers,
Machine Learning Engineers, Full Stack Developers, Data Engineers,
Cloud Engineers, and DevOps Engineers.

Your task is to perform a professional ATS-level evaluation of the resume below.

====================================================
RESUME
====================================================

{context}

====================================================
YOUR RESPONSIBILITIES
====================================================

Carefully analyze every section of the resume.

Evaluate the following:

1. Contact Information
2. Professional Summary
3. Technical Skills
4. Projects
5. Work Experience
6. Education
7. Certifications
8. Achievements
9. Resume Formatting
10. Grammar & Readability
11. ATS Compatibility

====================================================
SCORING RUBRIC
====================================================

Score the resume using the following weights.

• Contact Information .......... 5
• Professional Summary ......... 10
• Technical Skills .............. 20
• Projects ...................... 25
• Experience .................... 15
• Education ..................... 5
• Resume Formatting ............. 10
• Grammar & Readability ......... 5
• Certifications/Achievements ... 5

Total = 100

====================================================
ANALYSIS
====================================================

Perform ALL of the following:

1. Give:

- Overall Resume Score
- ATS Compatibility Score
- Technical Skills Score
- Readability Score
- Formatting Score
- Project Quality Score

2. Extract all skills.

Categorize into:

- Programming Languages
- Frameworks
- Libraries
- Databases
- Cloud Platforms
- DevOps Tools
- AI / ML Technologies
- Version Control
- Developer Tools
- Soft Skills

3. Identify

- Resume Strengths
- Resume Weaknesses
- Missing Skills
- Missing Keywords
- ATS Issues
- Grammar Issues
- Formatting Issues
- Weak Bullet Points
- Weak Action Verbs

4. Review every project.

For every project evaluate:

- Technical Complexity
- Business Impact
- Problem Solved
- Technologies Used
- Resume Description Quality
- Improvement Suggestions

5. Suggest

- Better Resume Summary
- Better Project Descriptions
- Better Action Verbs
- Quantifiable Achievements
- Resume Improvements

6. Recommend

- Technologies to Learn
- Certifications
- Books
- Courses
- Practice Platforms

7. Recommend the Top 5 Job Roles.

====================================================
CAREER GUIDANCE
====================================================

Based on the candidate's:

- Technical Skills
- Projects
- Experience
- Education
- Strengths
- Resume Quality
- Current Industry Trends

Determine the BEST career path.

Explain WHY this is the best career path.

Also provide:

- Current Career Level
- Recommended Career Path
- Reason
- Skills Required Next
- Technologies to Learn
- Projects to Build
- Certifications
- Learning Resources
- Estimated Learning Time
- Beginner Job Roles
- Intermediate Job Roles
- Advanced Career Growth
- Expected Salary Range (entry level)
- Five-Year Career Outlook

====================================================
FINAL VERDICT
====================================================

Provide:

- Overall Impression
- Hire / Borderline / Reject
- Confidence Level
- Final Recommendations

====================================================
IMPORTANT
====================================================

Return ONLY valid JSON.

Do NOT return markdown.

Do NOT return explanations outside JSON.

Return the following JSON structure exactly.

{{
    "overall_score": 0,
    "ats_score": 0,
    "technical_score": 0,
    "project_score": 0,
    "readability_score": 0,
    "formatting_score": 0,

    "score_breakdown": {{
        "contact_information": {{
            "score": 0,
            "feedback": ""
        }},
        "professional_summary": {{
            "score": 0,
            "feedback": ""
        }},
        "technical_skills": {{
            "score": 0,
            "feedback": ""
        }},
        "projects": {{
            "score": 0,
            "feedback": ""
        }},
        "experience": {{
            "score": 0,
            "feedback": ""
        }},
        "education": {{
            "score": 0,
            "feedback": ""
        }},
        "formatting": {{
            "score": 0,
            "feedback": ""
        }},
        "grammar": {{
            "score": 0,
            "feedback": ""
        }},
        "certifications": {{
            "score": 0,
            "feedback": ""
        }}
    }},

    "technical_skills": {{
        "programming_languages": [],
        "frameworks": [],
        "libraries": [],
        "databases": [],
        "cloud": [],
        "devops": [],
        "ai_ml": [],
        "version_control": [],
        "developer_tools": [],
        "soft_skills": []
    }},

    "strengths": [],

    "weaknesses": [],

    "missing_skills": [],

    "missing_keywords": [],

    "ats_issues": [],

    "grammar_issues": [],

    "formatting_issues": [],

    "project_feedback": [
        {{
            "project_name": "",
            "technical_complexity": "",
            "business_impact": "",
            "problem_solved": "",
            "feedback": "",
            "improvements": ""
        }}
    ],

    "recommended_job_roles": [],

    "career_guidance": {{
        "current_level": "",
        "recommended_career_path": "",
        "reason": "",
        "next_skills_to_learn": [],
        "technologies_to_learn": [],
        "recommended_projects": [],
        "recommended_certifications": [],
        "learning_resources": [],
        "estimated_learning_time": "",
        "entry_level_roles": [],
        "mid_level_roles": [],
        "long_term_growth": "",
        "expected_salary_range": ""
    }},

    "resume_improvements": [],

    "final_verdict": {{
        "overall_impression": "",
        "hiring_decision": "",
        "confidence": "",
        "summary": ""
    }}
}}

Return ONLY the JSON object.
""",
)


# ─────────────────────────────────────────
# Helper: extract text from uploaded PDF
# ─────────────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name
    try:
        loader = PyPDFLoader(tmp_path)
        documents = loader.load()
        context = "\n\n".join(doc.page_content for doc in documents)
        # Cap at 6000 chars — keeps total tokens well within free tier limits
        # A typical 1-2 page resume is ~2000-3000 chars, so this only trims unusually large PDFs
        return context[:6000]
    finally:
        os.unlink(tmp_path)


# ─────────────────────────────────────────
# Helper: strip markdown fences if LLM wraps JSON
# ─────────────────────────────────────────
def clean_json_response(raw: str) -> str:
    raw = raw.strip()

    # 1. Strip markdown code fences  ```json ... ``` or ``` ... ```
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    # 2. Extract the first complete JSON object using brace matching
    #    This handles cases where the LLM adds text before/after the JSON
    start = raw.find("{")
    if start == -1:
        return raw  # nothing to salvage — let json.loads raise

    depth = 0
    end = -1
    in_string = False
    escape_next = False

    for i, ch in enumerate(raw[start:], start=start):
        if escape_next:
            escape_next = False
            continue
        if ch == "\\" and in_string:
            escape_next = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i
                break

    if end != -1:
        return raw[start : end + 1]

    # 3. Last resort — return whatever we have from first brace
    return raw[start:]


# ─────────────────────────────────────────
# Routes
# ─────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "llama-3.3-70b-versatile",
        "profile_model": "llama-3.3-70b-versatile",
    }


@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    # Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Read uploaded file bytes
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Extract resume text
    try:
        context = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract PDF text: {str(e)}")

    if not context.strip():
        raise HTTPException(status_code=422, detail="Could not extract any text from the PDF. Make sure it is not scanned/image-only.")

    # Format prompt with resume context
    formatted_prompt = RESUME_CHECKER_PROMPT.format(context=context)

    # Call Groq LLM
    try:
        response = chat.invoke(formatted_prompt)
        raw_content = response.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {str(e)}")

    # Parse JSON response
    try:
        cleaned = clean_json_response(raw_content)
        result = json.loads(cleaned)
    except json.JSONDecodeError as e:
        # Log the first 500 chars of raw response to help diagnose
        preview = raw_content[:500].replace("\n", " ")
        raise HTTPException(
            status_code=500,
            detail=f"LLM returned invalid JSON. Parse error: {e}. Response preview: {preview}",
        )

    return result


# ─────────────────────────────────────────
# Cover Letter Prompt
# ─────────────────────────────────────────
COVER_LETTER_PROMPT = PromptTemplate(
    input_variables=["context", "job_description"],
    template="""
You are an expert Career Coach, Senior Technical Recruiter, Hiring Manager,
and Professional Resume Writer with over 15 years of experience helping
candidates secure jobs at top technology companies such as Google, Microsoft,
Amazon, Meta, Netflix, Apple, Oracle, SAP, Adobe, NVIDIA, OpenAI, and other
leading startups.

Your task is to generate a professional, personalized, ATS-friendly cover letter.

====================================================
CANDIDATE RESUME
====================================================

The following text has been extracted from the candidate's uploaded resume.

{context}

====================================================
JOB DESCRIPTION
====================================================

The candidate is applying for the following position.

{job_description}

====================================================
INSTRUCTIONS
====================================================

Carefully analyze BOTH the resume and the job description.

Generate a personalized cover letter that:

• Is specifically tailored to the given job description.
• Highlights only the candidate's real skills and experiences from the resume.
• Does NOT invent any information not present in the resume.
• Shows enthusiasm for the role and company.
• Demonstrates how the candidate's projects and technical skills align with the job requirements.
• Naturally incorporates relevant ATS keywords from the job description.
• Explains why the candidate is a strong fit for the position.
• Uses professional and confident language.
• Keeps the cover letter between 350 and 500 words.
• Uses proper business letter formatting.

====================================================
COVER LETTER STRUCTURE
====================================================

1. Professional Greeting
2. Opening Paragraph — introduce candidate, mention the role, express enthusiasm.
3. Middle Paragraph — strongest skills, most relevant projects, how they relate to the JD, achievements.
4. Why This Company — connect candidate skills to company needs.
5. Closing Paragraph — express appreciation, mention interest in an interview, end professionally.

====================================================
IMPORTANT RULES
====================================================

• Never fabricate experience, skills, certifications, achievements, or technologies.
• If the resume lacks a skill in the JD, emphasize transferable skills instead.

====================================================
OUTPUT
====================================================

Return ONLY the plain-text cover letter.
Do NOT return JSON, Markdown, bullet points, explanations, or notes.
""",
)


# ─────────────────────────────────────────
# Cover Letter — Streaming endpoint
# ─────────────────────────────────────────
@app.post("/cover-letter")
async def generate_cover_letter(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    try:
        context = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract PDF text: {str(e)}")

    if not context.strip():
        raise HTTPException(status_code=422, detail="Could not extract any text from the PDF.")

    formatted_prompt = COVER_LETTER_PROMPT.format(
        context=context,
        job_description=job_description[:3000],
    )

    async def token_stream():
        try:
            for chunk in chat.stream(formatted_prompt):
                token = chunk.content
                if token:
                    yield token
        except Exception as e:
            yield f"\n\n[ERROR: {str(e)}]"

    return StreamingResponse(
        token_stream(),
        media_type="text/plain; charset=utf-8",
        headers={"X-Content-Type-Options": "nosniff"},
    )


# ─────────────────────────────────────────
# Resume Scorer Prompt
# ─────────────────────────────────────────
RESUME_SCORER_PROMPT = PromptTemplate(
    input_variables=["context", "job_description"],
    template="""
You are an expert Applicant Tracking System (ATS), Senior Technical Recruiter,
Hiring Manager, and Resume Reviewer with over 15 years of experience hiring
Software Engineers, AI Engineers, Backend Engineers, Full Stack Developers,
Data Engineers, Cloud Engineers, and DevOps Engineers.

Your responsibility is to evaluate the candidate's resume against the given
job description exactly as a professional ATS system would.

===========================================================
JOB DESCRIPTION
===========================================================

{job_description}

===========================================================
CANDIDATE RESUME
===========================================================

{context}

===========================================================
YOUR TASK
===========================================================

Carefully compare the resume with the job description and evaluate the match.

Consider: Technical Skills, Programming Languages, Frameworks, Libraries,
Databases, Cloud Technologies, AI/ML Technologies, DevOps Tools,
Certifications, Projects, Work Experience, Education, ATS Keywords,
Resume Formatting, Grammar, Readability.

===========================================================
SCORING RUBRIC
===========================================================

Overall Resume Match Score (0-100)
ATS Compatibility Score (0-100)
Technical Skills Match Score (0-100)
Project Relevance Score (0-100)
Experience Match Score (0-100)
Education Match Score (0-100)
Readability Score (0-100)
Grammar Score (0-100)
Formatting Score (0-100)

===========================================================
ANALYSIS
===========================================================

1. Overall match score with explanation.
2. Keyword Analysis: matching_keywords, missing_keywords.
3. Skill Gap Analysis: skills_present, missing_skills, skill_gap_analysis.
4. Resume Strengths.
5. Resume Weaknesses.
6. Project Evaluation: relevance, complexity, business value, feedback, improvements.
7. ATS Review: issues, formatting_issues, grammar_issues, missing_sections.
8. Industry Feedback: startup, product_company, service_company, faang.
9. Improvement Suggestions.
10. Final Hiring Recommendation: Strongly Recommended / Recommended / Average Match / Weak Match / Not Recommended.

===========================================================
IMPORTANT
===========================================================

Return ONLY valid JSON. No markdown. No explanations outside JSON.

Return exactly this structure:

{{
    "overall_match_score": 0,
    "ats_score": 0,
    "technical_match_score": 0,
    "project_match_score": 0,
    "experience_match_score": 0,
    "education_match_score": 0,
    "readability_score": 0,
    "grammar_score": 0,
    "formatting_score": 0,
    "matching_keywords": [],
    "missing_keywords": [],
    "skills_present": [],
    "missing_skills": [],
    "skill_gap_analysis": [],
    "strengths": [],
    "weaknesses": [],
    "project_feedback": [
        {{
            "project_name": "",
            "relevance": "",
            "technical_complexity": "",
            "business_value": "",
            "feedback": "",
            "improvements": ""
        }}
    ],
    "ats_feedback": {{
        "issues": [],
        "formatting_issues": [],
        "grammar_issues": [],
        "missing_sections": []
    }},
    "industry_feedback": {{
        "startup": "",
        "product_company": "",
        "service_company": "",
        "faang": ""
    }},
    "improvement_suggestions": [],
    "final_recommendation": "",
    "summary": ""
}}

Return ONLY the JSON object.
""",
)


# ─────────────────────────────────────────
# Resume Scorer endpoint
# ─────────────────────────────────────────
@app.post("/score-resume")
async def score_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    try:
        context = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract PDF text: {str(e)}")

    if not context.strip():
        raise HTTPException(status_code=422, detail="Could not extract any text from the PDF.")

    formatted_prompt = RESUME_SCORER_PROMPT.format(
        context=context,
        job_description=job_description[:3000],
    )

    try:
        response = chat.invoke(formatted_prompt)
        raw_content = response.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {str(e)}")

    try:
        cleaned = clean_json_response(raw_content)
        result = json.loads(cleaned)
    except json.JSONDecodeError as e:
        preview = raw_content[:500].replace("\n", " ")
        raise HTTPException(
            status_code=500,
            detail=f"LLM returned invalid JSON. Parse error: {e}. Preview: {preview}",
        )

    return result


# ─────────────────────────────────────────
# Profile Builder — LEAN data-extraction prompt (~500 tokens)
# Full HTML is built server-side from a Python template
# ─────────────────────────────────────────
PROFILE_BUILDER_PROMPT = PromptTemplate(
    input_variables=["context"],
    template="""
You are a world-class Frontend Developer and UI/UX Designer who builds $5000 premium
developer portfolio websites. You write pixel-perfect HTML/CSS/JS from scratch.

Your job: read the resume below and generate ONE complete, stunning, award-winning
personal portfolio website as a single self-contained HTML file.

===========================================================
CANDIDATE RESUME
===========================================================

{context}

===========================================================
STRICT TECHNICAL RULES
===========================================================

1. Return ONE complete HTML file — starting with <!DOCTYPE html> ending with </html>
2. ALL styles inside ONE <style> tag in <head>
3. ALL JavaScript inside ONE <script> tag before </body>
4. ZERO external dependencies — no CDN, no Google Fonts, no Font Awesome
5. Use ONLY system fonts: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
6. Use Unicode characters for icons: ◆ ★ ✦ → ▸ ✉ ☎ ⚡ 🔗 ◉ ▶
7. Must render perfectly in Chrome/Firefox as a standalone .html file
8. NEVER fabricate any information not present in the resume

===========================================================
MANDATORY DESIGN SYSTEM — IMPLEMENT EXACTLY
===========================================================

CSS VARIABLES (put these in :root):
--bg-primary: #0a0a0f
--bg-secondary: #0d1117
--bg-card: #161b22
--bg-card-hover: #1c2128
--accent: #f0b429
--accent-2: #e0621a
--accent-glow: rgba(240,180,41,0.15)
--text-primary: #e6edf3
--text-secondary: #8b949e
--text-muted: #484f58
--border: #30363d
--border-accent: rgba(240,180,41,0.4)
--radius: 12px
--radius-lg: 20px
--transition: all 0.3s cubic-bezier(0.4,0,0.2,1)
--shadow-card: 0 8px 32px rgba(0,0,0,0.4)
--shadow-glow: 0 0 40px rgba(240,180,41,0.1)

TYPOGRAPHY:
- Name in hero: font-size 4rem, font-weight 800, letter-spacing -2px
- Section headings: font-size 2rem, font-weight 700
- Body text: font-size 1rem, line-height 1.7, color var(--text-secondary)

===========================================================
NAVIGATION — IMPLEMENT EXACTLY
===========================================================

- Fixed top nav, height 64px, background rgba(10,10,15,0.9), backdrop-filter blur(20px)
- Border-bottom: 1px solid var(--border)
- Logo on left: candidate first name + "." in accent color, font-weight 800
- Nav links on right: color var(--text-secondary), hover color var(--accent)
- Active link: color var(--accent), border-bottom 2px solid var(--accent)
- Mobile hamburger: 3 lines, transforms to X on open
- Mobile menu: full-screen overlay, centered links, font-size 1.5rem

===========================================================
HERO SECTION — IMPLEMENT EXACTLY
===========================================================

- Full viewport height (100vh), centered content
- Background: radial gradient from #0d1117 to #0a0a0f
- Decorative elements: 3 large blurred circles (position absolute)
  Circle 1: width 600px height 600px, background radial-gradient(circle, rgba(240,180,41,0.06), transparent), top -200px right -200px
  Circle 2: width 400px height 400px, background radial-gradient(circle, rgba(224,98,26,0.06), transparent), bottom -100px left -100px
  Circle 3: width 300px, background radial-gradient(circle, rgba(240,180,41,0.04), transparent), center
- Greeting text: "Hello, I'm" — font-size 1.2rem, color var(--accent), letter-spacing 4px, text-transform uppercase
- Name: HUGE, font-size clamp(3rem,8vw,5rem), font-weight 900, color var(--text-primary)
  Each word on its own line OR inline — use candidate's actual name
- Title: font-size 1.5rem, color var(--text-secondary), margin-top 12px
  Wrap key tech words in <span style="color:var(--accent)">
- Description: 2 lines max from summary, font-size 1rem, max-width 600px, centered
- TWO CTA buttons side by side with gap 16px:
  Button 1 "View Projects": background linear-gradient(135deg, var(--accent), var(--accent-2)), color #000, padding 14px 32px, border-radius 50px, font-weight 700, border none, cursor pointer, box-shadow 0 4px 24px rgba(240,180,41,0.3), transform on hover translateY(-2px)
  Button 2 "Contact Me": background transparent, color var(--accent), border 2px solid var(--accent), padding 14px 32px, border-radius 50px, font-weight 700, hover background var(--accent-glow)
- Scroll indicator at bottom: animated bouncing arrow

===========================================================
ABOUT SECTION — IMPLEMENT EXACTLY
===========================================================

- Section padding: 100px 0
- Section title style: inline-block, font-size 2rem, font-weight 700
  After title: horizontal line that fills remaining width (use flex + hr)
  HR style: flex:1, height 1px, background linear-gradient(90deg, var(--accent), transparent), margin-left 20px
- Two column layout (60/40 split on desktop, stack on mobile):
  LEFT: Summary paragraph, then 3 stat boxes side by side
    Stat box: background var(--bg-card), border 1px solid var(--border), border-radius var(--radius), padding 20px, text-align center
    Stat number: font-size 2.5rem, font-weight 800, color var(--accent)
    Stat label: font-size 0.85rem, color var(--text-muted), text-transform uppercase, letter-spacing 1px
  RIGHT: A styled "quick info" card listing: Location, Email, Role, Status "Open to Work"
    Card: background var(--bg-card), border 1px solid var(--border), border-radius var(--radius-lg), padding 32px
    Each row: icon + label + value, border-bottom 1px solid var(--border) on each row except last

===========================================================
SKILLS SECTION — IMPLEMENT EXACTLY
===========================================================

- Background: var(--bg-secondary)
- Group skills into categories (Programming Languages, Frameworks, Databases, Cloud, AI/ML, DevOps, Tools)
- Each category: heading in accent color, skills as PILL BADGES not progress bars
- Pill badge style: display inline-flex, background var(--bg-card), border 1px solid var(--border),
  border-radius 50px, padding 8px 18px, font-size 0.85rem, color var(--text-secondary),
  margin 4px, transition var(--transition)
- Pill hover: border-color var(--accent), color var(--accent), background var(--accent-glow), transform translateY(-2px)
- Category grid: display grid, grid-template-columns repeat(auto-fit, minmax(280px,1fr)), gap 24px
- Category card: background var(--bg-card), border 1px solid var(--border), border-radius var(--radius-lg), padding 28px
- Category title: font-size 0.75rem, font-weight 700, text-transform uppercase, letter-spacing 2px, color var(--accent), margin-bottom 16px

===========================================================
PROJECTS SECTION — IMPLEMENT EXACTLY
===========================================================

- Grid: display grid, grid-template-columns repeat(auto-fit, minmax(340px,1fr)), gap 24px
- Project card:
  background var(--bg-card)
  border 1px solid var(--border)
  border-radius var(--radius-lg)
  padding 28px
  transition var(--transition)
  position relative
  overflow hidden
  On hover: border-color var(--accent), transform translateY(-4px), box-shadow var(--shadow-glow)
- Top stripe: position absolute, top 0, left 0, right 0, height 3px
  background linear-gradient(90deg, var(--accent), var(--accent-2))
- Project number: position absolute, top 20px, right 20px, font-size 3rem, font-weight 900, color var(--text-muted), opacity 0.3
- Project name: font-size 1.3rem, font-weight 700, color var(--text-primary), margin-bottom 8px
- Description: font-size 0.9rem, color var(--text-secondary), line-height 1.6, margin-bottom 16px
- Tech stack: flex wrap, gap 6px
  Tech badge: background rgba(240,180,41,0.1), border 1px solid rgba(240,180,41,0.3), color var(--accent), border-radius 4px, padding 3px 10px, font-size 0.75rem, font-weight 600
- Buttons at bottom: flex, gap 10px
  GitHub btn: border 1px solid var(--border), background transparent, color var(--text-secondary), padding 8px 16px, border-radius 8px, font-size 0.85rem, hover border-color var(--accent), color var(--accent)
  Live btn: background linear-gradient(135deg,var(--accent),var(--accent-2)), color #000, padding 8px 16px, border-radius 8px, font-size 0.85rem, font-weight 600

===========================================================
EXPERIENCE SECTION — IMPLEMENT EXACTLY
===========================================================

- Background var(--bg-secondary)
- Vertical timeline: position relative, left border line: 2px solid var(--border), margin-left 20px, padding-left 40px
- Each entry: position relative, margin-bottom 40px
  Dot: position absolute, left -49px, top 6px, width 14px, height 14px, border-radius 50%, background var(--accent), box-shadow 0 0 0 4px rgba(240,180,41,0.2)
  Company + dates: flex, justify-content space-between
  Company name: font-size 1.1rem, font-weight 700, color var(--accent)
  Role: font-size 1rem, color var(--text-primary), margin-bottom 4px
  Dates: font-size 0.85rem, color var(--text-muted), background var(--bg-card), padding 4px 12px, border-radius 50px, border 1px solid var(--border)
  Bullets: ul with custom bullet color var(--accent), font-size 0.9rem, color var(--text-secondary)

===========================================================
EDUCATION SECTION — IMPLEMENT EXACTLY
===========================================================

- Grid: repeat(auto-fit, minmax(300px,1fr)), gap 24px
- Education card:
  background var(--bg-card), border 1px solid var(--border), border-radius var(--radius-lg), padding 28px
  Top: large graduation icon ◆ in accent color, font-size 2rem
  Degree: font-size 1.1rem, font-weight 700, color var(--text-primary)
  Institution: font-size 1rem, color var(--accent)
  Year + GPA row: flex, justify-content space-between
  Year: color var(--text-muted), font-size 0.85rem
  GPA badge: background rgba(240,180,41,0.1), color var(--accent), border 1px solid rgba(240,180,41,0.3), padding 2px 10px, border-radius 50px, font-size 0.8rem

===========================================================
CERTIFICATIONS & ACHIEVEMENTS — IMPLEMENT EXACTLY
===========================================================

Certifications: horizontal scroll or grid of badge-style cards
  Card: background var(--bg-card), border 1px solid rgba(240,180,41,0.3), border-radius var(--radius), padding 20px 24px
  Left: ★ icon in accent color, font-size 1.5rem
  Right: cert name font-weight 700, issuer color var(--text-muted)

Achievements: numbered list with large numbers
  Number: font-size 2.5rem, font-weight 900, color var(--accent), opacity 0.4
  Text: font-size 1rem, color var(--text-secondary)

===========================================================
CONTACT SECTION — IMPLEMENT EXACTLY
===========================================================

- Background var(--bg-secondary)
- Two column: LEFT text content, RIGHT contact card
- Heading: "Let's Work Together" font-size 2.5rem, font-weight 800
- Subtext: "Open to opportunities" in accent
- RIGHT card: background var(--bg-card), border 1px solid var(--border), border-radius var(--radius-lg), padding 40px
  Each contact item: flex, align-center, gap 16px, padding 16px 0, border-bottom 1px solid var(--border)
  Icon circle: width 44px, height 44px, border-radius 50%, background var(--accent-glow), border 1px solid var(--border-accent), display flex, align-center, justify-center
  Label: font-size 0.75rem, color var(--text-muted), text-transform uppercase, letter-spacing 1px
  Value: font-size 1rem, color var(--text-primary), font-weight 500
  If clickable (email/linkedin/github): color var(--accent), text-decoration none, hover underline

===========================================================
FOOTER — IMPLEMENT EXACTLY
===========================================================

- Background var(--bg-primary), border-top 1px solid var(--border)
- Padding 40px 0
- Flex: space-between, align-center
- Left: name + " — Portfolio" in accent
- Center: "Built with ◆ using AI" in muted
- Right: social icon links (round buttons)

===========================================================
ANIMATIONS — IMPLEMENT EXACTLY
===========================================================

1. Intersection Observer fade-in:
   All sections start as: opacity 0, transform translateY(30px)
   On intersect: opacity 1, transform translateY(0), transition 0.6s ease
   Add data-animate attribute to every section

2. Hero name: typewriter cursor effect using CSS animation
   @keyframes blink: opacity 0 to 1, 1s infinite step-end

3. Skill pills: stagger animation on scroll — each pill delays by 50ms * index

4. Scroll-to-top button:
   Position fixed, bottom 30px, right 30px
   Width 44px, height 44px, border-radius 50%
   Background linear-gradient(135deg, var(--accent), var(--accent-2))
   Color #000, font-size 1.2rem
   Show only when scrolled > 300px
   Smooth scroll to top on click

5. Nav active link: update on scroll using IntersectionObserver per section

===========================================================
OUTPUT FORMAT — CRITICAL
===========================================================

Return ONLY this exact JSON structure. No markdown. No code fences. No explanation.

{{
    "name": "candidate full name here",
    "title": "candidate job title here",
    "html": "THE_COMPLETE_HTML_FILE_AS_A_JSON_STRING"
}}

The html value must be the COMPLETE document from <!DOCTYPE html> to </html>.
Escape all quotes and special characters properly for valid JSON.
The HTML must render as a stunning premium portfolio when opened in a browser.

Return ONLY the JSON object. Nothing else.
""",
)


# ─────────────────────────────────────────
# Helper: MongoDB profiles collection
# ─────────────────────────────────────────
def get_profiles_collection():
    from auth.database import get_database
    return get_database()["profiles"]


# ─────────────────────────────────────────
# POST /build-profile  (protected)
# ─────────────────────────────────────────
@app.post("/build-profile")
async def build_profile(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    from datetime import datetime, timezone
    from bson import ObjectId

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        context = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract PDF text: {str(e)}")

    if not context.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

    formatted_prompt = DATA_PROMPT.format(context=context[:4000])

    try:
        response = profile_chat.invoke(formatted_prompt)
        raw_content = response.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {str(e)}")

    try:
        cleaned = clean_json_response(raw_content)
        data    = json.loads(cleaned)
    except json.JSONDecodeError as e:
        preview = raw_content[:400].replace("\n", " ")
        raise HTTPException(
            status_code=500,
            detail=f"LLM returned invalid JSON. Error: {e}. Preview: {preview}",
        )

    # Build the full premium HTML from Python template — no token limit issues
    html_content = build_profile_html(data)

    # ── Store in MongoDB ──────────────────────────────────
    collection = get_profiles_collection()
    now = datetime.now(timezone.utc)

    doc = {
        "user_id":    current_user["id"],
        "user_email": current_user["email"],
        "name":       data.get("name", current_user.get("full_name", "")),
        "title":      data.get("title", ""),
        "html":       html_content,
        "created_at": now,
        "updated_at": now,
    }

    # Upsert — one profile per user (overwrite if regenerated)
    existing = await collection.find_one({"user_id": current_user["id"]})
    if existing:
        await collection.update_one(
            {"user_id": current_user["id"]},
            {"$set": {**doc, "created_at": existing["created_at"]}},
        )
        profile_id = str(existing["_id"])
    else:
        insert_result = await collection.insert_one(doc)
        profile_id = str(insert_result.inserted_id)

    return {
        "profile_id":   profile_id,
        "name":         doc["name"],
        "title":        doc["title"],
        "profile_url":  f"/profile/{profile_id}",
        "share_url":    f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/profile/{profile_id}",
    }


# ─────────────────────────────────────────
# GET /profile/{profile_id}  (PUBLIC — shareable link)
# ─────────────────────────────────────────
from fastapi.responses import HTMLResponse

@app.get("/profile/{profile_id}", response_class=HTMLResponse)
async def view_profile(profile_id: str):
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        oid = ObjectId(profile_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="Profile not found.")

    collection = get_profiles_collection()
    doc = await collection.find_one({"_id": oid})

    if not doc:
        raise HTTPException(status_code=404, detail="Profile not found.")

    return HTMLResponse(content=doc["html"], status_code=200)


# ─────────────────────────────────────────
# GET /my-profile  (get current user's profile metadata)
# ─────────────────────────────────────────
@app.get("/my-profile")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    from bson import ObjectId

    collection = get_profiles_collection()
    doc = await collection.find_one({"user_id": current_user["id"]})

    if not doc:
        return {"profile": None}

    return {
        "profile": {
            "profile_id":  str(doc["_id"]),
            "name":        doc["name"],
            "title":       doc["title"],
            "profile_url": f"/profile/{str(doc['_id'])}",
            "share_url":   f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/profile/{str(doc['_id'])}",
            "created_at":  doc["created_at"].isoformat(),
            "updated_at":  doc["updated_at"].isoformat(),
        }
    }


# ─────────────────────────────────────────
# Interview Question Generator Prompt
# ─────────────────────────────────────────
INTERVIEW_PROMPT = PromptTemplate(
    input_variables=["context"],
    template="""
You are an elite Technical Interviewer with 20+ years of experience at FAANG companies.
You have interviewed 10,000+ candidates and know exactly which questions expose real knowledge vs resume padding.

Analyze this resume and generate a comprehensive interview question bank.

RESUME:
{context}

Generate questions ONLY from technologies, skills, and projects in this resume.
Challenge every claim. Think like a skeptical senior engineer.

Return ONLY valid JSON with this exact structure:

{{
  "candidate_summary": {{
    "name": "",
    "title": "",
    "key_skills": [],
    "total_questions": 0,
    "interview_difficulty": "",
    "readiness_score": 0
  }},
  "categories": [
    {{
      "id": "",
      "name": "",
      "icon": "",
      "color": "",
      "description": "",
      "questions": [
        {{
          "id": "",
          "question": "",
          "difficulty": "",
          "category": "",
          "why_asked": "",
          "skill_tested": "",
          "expected_answer": "",
          "red_flags": [],
          "follow_ups": [],
          "estimated_time": ""
        }}
      ]
    }}
  ],
  "report": {{
    "readiness_score": 0,
    "technical_score": 0,
    "project_score": 0,
    "system_design_score": 0,
    "problem_solving_score": 0,
    "strong_areas": [],
    "weak_areas": [],
    "high_priority_topics": [],
    "recommended_roadmap": [],
    "probability_technical_round": "",
    "probability_hr_round": "",
    "final_advice": ""
  }}
}}

Generate 6-8 categories based on the resume. Each category must have 5-8 questions.
Categories to include (only if relevant to resume):
- "Resume Walkthrough" (always include)
- "Technical Deep Dive" (based on their strongest skills)
- "Project Architecture" (for each major project)
- "Coding Challenges" (based on languages they know)
- "System Design" (if backend/AI work present)
- "AI & LLM" (if AI tech present)
- "Database & Optimization" (if DB mentioned)
- "Behavioral & Situational"

Difficulty must be one of: "Easy", "Medium", "Hard", "Expert"
Color must be one of: "blue", "green", "orange", "red", "purple", "pink", "yellow"
Icon must be a single emoji.

Return ONLY the JSON object.
""",
)


# ─────────────────────────────────────────
# Interview Questions endpoint
# ─────────────────────────────────────────
@app.post("/interview-questions")
async def generate_interview_questions(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        context = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract PDF text: {str(e)}")

    if not context.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

    formatted_prompt = INTERVIEW_PROMPT.format(context=context[:4000])

    try:
        response = chat.invoke(formatted_prompt)
        raw_content = response.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {str(e)}")

    try:
        cleaned = clean_json_response(raw_content)
        result = json.loads(cleaned)
    except json.JSONDecodeError as e:
        preview = raw_content[:400].replace("\n", " ")
        raise HTTPException(
            status_code=500,
            detail=f"LLM returned invalid JSON. Error: {e}. Preview: {preview}",
        )

    return result


# ─────────────────────────────────────────
# Career Coach — Streaming Chat Endpoint
# ─────────────────────────────────────────
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

CAREER_COACH_SYSTEM = """You are an expert AI Career Coach, Senior Technical Mentor, Resume Consultant, Technical Interviewer, and Software Engineering Career Advisor with over 20 years of experience.

YOUR ROLE: You are the candidate's personal AI Career Coach. You already have complete knowledge of the candidate's resume below.

CANDIDATE RESUME:
{context}

Never ask the candidate to upload the resume again. Always use the resume as context.

YOUR RESPONSIBILITIES:
• Career Guidance & Role Recommendations
• Resume Improvements & ATS Tips
• Interview Preparation (questions, answers, tips)
• Skill Gap Analysis & Learning Roadmaps
• Project Architecture Reviews
• Technology Deep Dives (explain any skill from resume)
• Company-specific Preparation (Google, Amazon, etc.)
• Salary & Negotiation Guidance
• LinkedIn & GitHub Improvements
• Personal Branding

SKILL MENTOR MODE: If user asks about ANY skill in the resume, explain it like a senior engineer — simple explanation, internal working, real-world example, interview questions, best practices.

PROJECT MENTOR MODE: If user asks about any project from resume, explain architecture, APIs, database design, security, scaling, improvements.

CAREER COACH MODE: Recommend best-fit roles (Backend Engineer, AI Engineer, Full Stack, etc.) based on resume. Explain WHY with specific evidence from their resume.

SKILL GAP: When asked "what should I learn next?", compare current skills with industry requirements. Give specific missing skills, technologies, certifications, projects, time estimates.

IMPORTANT RULES:
- Always personalize answers using the resume
- Never invent information not in the resume
- Be encouraging, practical, and recruiter-focused
- Keep responses clear, structured, and actionable
- Use bullet points and sections for long answers"""


@app.post("/career-coach/init")
async def init_career_coach(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload resume, extract text, return session context."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    try:
        context = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract PDF: {str(e)}")
    if not context.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from PDF.")
    return {
        "context": context[:4000],
        "message": "Resume loaded successfully. Ask me anything about your career!"
    }


@app.post("/career-coach/chat")
async def career_coach_chat(
    request: dict,
    current_user: dict = Depends(get_current_user),
):
    """
    Streaming chat. Body: { context, history: [{role, content}], message }
    Streams text tokens back.
    """
    context    = request.get("context", "")
    history    = request.get("history", [])
    user_msg   = request.get("message", "").strip()

    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    if not context:
        raise HTTPException(status_code=400, detail="No resume context. Upload resume first.")

    # Build message list
    system = SystemMessage(content=CAREER_COACH_SYSTEM.format(context=context))
    msgs   = [system]
    for h in history[-20:]:  # keep last 20 turns to stay within token limits
        role    = h.get("role", "user")
        content = h.get("content", "")
        if role == "user":
            msgs.append(HumanMessage(content=content))
        else:
            msgs.append(AIMessage(content=content))
    msgs.append(HumanMessage(content=user_msg))

    async def stream():
        try:
            for chunk in chat.stream(msgs):
                if chunk.content:
                    yield chunk.content
        except Exception as e:
            yield f"\n\n[Error: {str(e)}]"

    return StreamingResponse(
        stream(),
        media_type="text/plain; charset=utf-8",
    )


# ─────────────────────────────────────────
# Jobs Board — SerpAPI google_jobs engine
# ─────────────────────────────────────────
import httpx

SERPAPI_KEY   = os.getenv("SERPAPI_KEY", "")
SERPAPI_URL   = "https://serpapi.com/search.json"


@app.get("/jobs")
async def get_jobs(
    q:        str = "Software Engineer",
    location: str = "",
    ltype:    str = "",   # "1" = full-time, etc.
    start:    int = 0,
    hl:       str = "en",
):
    if not SERPAPI_KEY:
        raise HTTPException(status_code=500, detail="SerpAPI key not configured.")

    params: dict = {
        "engine":  "google_jobs",
        "q":       q,
        "hl":      hl,
        "api_key": SERPAPI_KEY,
        "start":   start,
    }
    if location: params["location"] = location
    if ltype:    params["ltype"]    = ltype

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(SERPAPI_URL, params=params)

        if resp.status_code == 401:
            raise HTTPException(status_code=502, detail="SerpAPI key is invalid.")
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"SerpAPI error: {resp.status_code}")

        data = resp.json()
        return {
            "jobs_results":    data.get("jobs_results", []),
            "serpapi_pagination": data.get("serpapi_pagination", {}),
        }

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="SerpAPI timed out. Try again.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch jobs: {str(e)}")
