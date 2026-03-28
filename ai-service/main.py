import os
import re
import json
import tempfile
from typing import List, Optional

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from google import genai
from google.genai import types

load_dotenv()

AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT", 8000))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Stable defaults; change in .env if needed
GEMINI_TEXT_MODEL = os.getenv("GEMINI_TEXT_MODEL", "gemini-2.5-flash")
GEMINI_AUDIO_MODEL = os.getenv("GEMINI_AUDIO_MODEL", "gemini-2.5-flash")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing in environment variables.")

client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="AI Interviewer Microservice", version="2.0")

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Request / Response Schemas
# -----------------------------
class QuestionRequest(BaseModel):
    role: str = "MERN Stack Developer"
    level: str = "Junior"
    count: int = 5
    interview_type: str = "coding-mix"

    @field_validator("count")
    @classmethod
    def validate_count(cls, value: int) -> int:
        if value < 1 or value > 20:
            raise ValueError("count must be between 1 and 20")
        return value


class QuestionResponse(BaseModel):
    questions: List[str]
    model_used: str


class QuestionsSchema(BaseModel):
    questions: List[str] = Field(
        description="List of interview questions, one item per question"
    )


class EvaluationRequest(BaseModel):
    question: str
    question_type: str  # "oral" or "coding"
    role: str
    level: str
    user_answer: Optional[str] = None
    user_code: Optional[str] = None


class EvaluationResponse(BaseModel):
    technicalScore: int = Field(ge=0, le=100)
    confidenceScore: int = Field(ge=0, le=100)
    aiFeedback: str
    idealAnswer: str


# -----------------------------
# Helpers
# -----------------------------
def clean_question_list(items: List[str], expected_count: int) -> List[str]:
    cleaned: List[str] = []

    for item in items:
        if not item:
            continue

        q = item.strip()
        q = re.sub(r"^\d+[\).\-\s]+", "", q)   # remove "1. ", "1) ", etc.
        q = re.sub(r"^[-*•]\s*", "", q)        # remove bullets
        q = q.strip()

        if q and q not in cleaned:
            cleaned.append(q)

    return cleaned[:expected_count]


def extract_json_text(text: str) -> str:
    """
    Tries to extract JSON from markdown code fences if model wraps it.
    """
    if not text:
        return text

    text = text.strip()

    # ```json ... ```
    fenced_match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    if fenced_match:
        return fenced_match.group(1).strip()

    return text


# -----------------------------
# Routes
# -----------------------------
@app.get("/")
async def root():
    return {
        "message": "Hello from AI Interviewer Microservice!",
        "text_model": GEMINI_TEXT_MODEL,
        "audio_model": GEMINI_AUDIO_MODEL,
    }


@app.post("/generate-questions", response_model=QuestionResponse)
async def generate_questions(request: QuestionRequest):
    try:
        if request.interview_type == "coding-mix":
            coding_count = max(1, int(request.count * 0.2))
            oral_count = request.count - coding_count

            instruction = (
                f"Generate exactly {request.count} interview questions.\n"
                f"- First {coding_count} questions must be coding/function implementation challenges.\n"
                f"- Remaining {oral_count} questions must be conceptual oral questions.\n"
                f"- Keep them appropriate for a {request.level} {request.role} candidate.\n"
                f"- Do not include answers.\n"
                f"- Do not include headings or explanations."
            )
        else:
            instruction = (
                f"Generate exactly {request.count} conceptual oral interview questions "
                f"for a {request.level} {request.role} candidate.\n"
                f"- Do not generate coding challenges.\n"
                f"- Do not include answers.\n"
                f"- Do not include headings or explanations."
            )

        response = client.models.generate_content(
            model=GEMINI_TEXT_MODEL,
            contents=instruction,
            config=types.GenerateContentConfig(
                temperature=0.6,
                response_mime_type="application/json",
                response_schema=QuestionsSchema,
            ),
        )

        raw_text = response.text or ""
        parsed_text = extract_json_text(raw_text)

        try:
            data = QuestionsSchema.model_validate_json(parsed_text)
        except Exception:
            # fallback if SDK returns parseable structure differently
            maybe = json.loads(parsed_text)
            data = QuestionsSchema(**maybe)

        questions = clean_question_list(data.questions, request.count)

        if len(questions) < request.count:
            raise HTTPException(
                status_code=500,
                detail="Gemini returned fewer questions than expected.",
            )

        return QuestionResponse(
            questions=questions,
            model_used=GEMINI_TEXT_MODEL,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_audio_path = None

    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded.")

        suffix = os.path.splitext(file.filename)[1] or ".mp3"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            temp_audio_path = tmp.name
            tmp.write(await file.read())

        uploaded_file = client.files.upload(file=temp_audio_path)

        prompt = (
            "Transcribe this audio accurately. "
            "Return only the spoken transcript text. "
            "Do not add notes, labels, timestamps, headings, or explanations."
        )

        response = client.models.generate_content(
            model=GEMINI_AUDIO_MODEL,
            contents=[prompt, uploaded_file],
            config=types.GenerateContentConfig(
                temperature=0,
            ),
        )

        transcript = (response.text or "").strip()

        if not transcript:
            raise HTTPException(status_code=500, detail="Empty transcription returned by Gemini.")

        return {"transcription": transcript}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)


@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(request: EvaluationRequest):
    try:
        question_type = (request.question_type or "").strip().lower()

        if question_type == "oral":
            assessment_instruction = (
                "This is a conceptual oral interview question.\n"
                "- Evaluate only the user's verbal/conceptual explanation.\n"
                "- Ignore code unless it directly supports the explanation.\n"
                "- If the answer is empty, nonsense, irrelevant, or filler-only, both scores must be 0."
            )
        else:
            assessment_instruction = (
                "This is a coding interview question.\n"
                "- Evaluate correctness, logic, edge cases, and efficiency of the submitted code.\n"
                "- Use verbal answer only as supporting context.\n"
                "- If code is missing, nonsense, random characters, or irrelevant, technicalScore must be 0."
            )

        prompt = f"""
You are a strict technical interviewer.

Return a JSON object with exactly these keys:
- technicalScore (integer 0 to 100)
- confidenceScore (integer 0 to 100)
- aiFeedback (string)
- idealAnswer (string)

Scoring rules:
- Do not hallucinate positive feedback for weak or irrelevant answers.
- If answer is missing, gibberish, testing text, or irrelevant, set both scores to 0.
- aiFeedback must be concise but useful, and explain strengths + weaknesses.
- idealAnswer must be a clean markdown-ready string, not a nested JSON object.

Context:
{assessment_instruction}

Candidate details:
Role: {request.role}
Level: {request.level}
Question: {request.question}
Question Type: {question_type}
Verbal Answer: {request.user_answer or "No verbal answer provided"}
Code Answer: {request.user_code or "No code provided"}
""".strip()

        response = client.models.generate_content(
            model=GEMINI_TEXT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
                response_schema=EvaluationResponse,
            ),
        )

        raw_text = response.text or ""
        parsed_text = extract_json_text(raw_text)

        try:
            data = EvaluationResponse.model_validate_json(parsed_text)
            return data
        except Exception:
            maybe = json.loads(parsed_text)

            # defensive cleanup
            if "idealAnswer" in maybe and not isinstance(maybe["idealAnswer"], str):
                maybe["idealAnswer"] = json.dumps(maybe["idealAnswer"], ensure_ascii=False)

            maybe.setdefault("technicalScore", 0)
            maybe.setdefault("confidenceScore", 0)
            maybe.setdefault("aiFeedback", "Failed to parse Gemini evaluation properly.")
            maybe.setdefault("idealAnswer", "No ideal answer available.")

            return EvaluationResponse(**maybe)

    except Exception as e:
        print(f"Failed to generate evaluation response: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=AI_SERVICE_PORT)
