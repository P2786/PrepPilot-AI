import uvicorn
import os
import io
import json
import tempfile
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pydub import AudioSegment
import whisper
from openai import OpenAI

load_dotenv()

AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT", 8000))
OPENAI_MODEL_NAME = os.getenv("OPENAI_MODEL_NAME", "gpt-4.1-mini")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI(title="AI Interviewer Microservice", version="1.0")

origins = [os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WHISPER_MODEL = None

try:
    print("Loading Whisper Model ...")
    WHISPER_MODEL = whisper.load_model("base.en")
    print("Whisper Model Loaded Successfully")
except Exception as e:
    print("Error while loading Whisper Model")
    print(e)


class QuestionResquest(BaseModel):
    role: str = "MERN Stack Developer"
    level: str = "Junior"
    count: int = 5
    interview_type: str = "coding-mix"


class QuestionResponse(BaseModel):
    questions: list[str]
    model_used: str


class EvaluationRequest(BaseModel):
    question: str
    question_type: str
    role: str
    level: str
    user_answer: Optional[str] = None
    user_code: Optional[str] = None


class EvaluationResponse(BaseModel):
    technicalScore: int
    confidenceScore: int
    aiFeedback: str
    idealAnswer: str


@app.get("/")
async def root():
    return {
        "message": "Hello from AI Interviewer Microservice!",
        "model": OPENAI_MODEL_NAME
    }


@app.post("/generate-questions", response_model=QuestionResponse)
async def generate_questions(request: QuestionResquest):
    try:
        if request.interview_type == "coding-mix":
            coding_count = max(1, int(request.count * 0.2))
            oral_count = int(request.count) - int(coding_count)

            instruction = (
                f"The first {coding_count} questions MUST be coding challenges requiring function implementation. "
                f"The remaining {oral_count} questions MUST be conceptual oral questions."
            )
        else:
            instruction = (
                "All questions MUST be conceptual oral questions. "
                "Do NOT generate any coding or implementation challenges."
            )

        system_prompt = (
            "You are a professional technical interviewer. "
            "Generate interview questions only. "
            "No conversational text. No numbering. "
            "Output exactly one question per line. "
            f"{instruction}"
        )

        user_prompt = (
            f"Generate exactly {request.count} unique interview questions for a "
            f"{request.level} level {request.role}."
        )

        response = client.chat.completions.create(
            model=OPENAI_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.6,
        )

        raw_text = response.choices[0].message.content.strip()
        questions = [q.strip("- ").strip() for q in raw_text.split("\n") if q.strip()]
        return QuestionResponse(
            questions=questions[:request.count],
            model_used=OPENAI_MODEL_NAME
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        audio_in_memory = io.BytesIO(audio_bytes)
        audio_segment = AudioSegment.from_file(audio_in_memory)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            temp_audio_path = tmp.name
            audio_segment.export(temp_audio_path, format="mp3")

        if not WHISPER_MODEL:
            raise HTTPException(status_code=503, detail="Whisper Model is not loaded")

        result = WHISPER_MODEL.transcribe(temp_audio_path)

        os.remove(temp_audio_path)
        return {"transcription": result["text"].strip()}

    except Exception as e:
        if 'temp_audio_path' in locals() and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(request: EvaluationRequest):
    try:
        if request.question_type == "oral":
            assessment_instruction = (
                "This is a conceptual oral question. Focus on the candidate's verbal explanation only. "
                "Ignore code. If the answer is empty, nonsense, or irrelevant, give 0 scores."
            )
        else:
            assessment_instruction = (
                "This is a coding challenge. Evaluate code correctness, logic, and efficiency. "
                "Use verbal answer only as supporting context. If code is empty, undefined, random, or irrelevant, give 0 scores."
            )

        system_prompt = (
            "You are a strict technical interviewer. "
            "Respond ONLY in valid JSON format. "
            "Return keys exactly as: technicalScore, confidenceScore, aiFeedback, idealAnswer. "
            "technicalScore and confidenceScore must be integers from 0 to 100. "
            f"{assessment_instruction}"
        )

        user_prompt = (
            f"Role: {request.role}\n"
            f"Level: {request.level}\n"
            f"Question: {request.question}\n"
            f"Question Type: {request.question_type}\n"
            f"Verbal Answer: {request.user_answer or 'No verbal answer provided'}\n"
            f"Code Answer: {request.user_code or 'No code provided'}\n"
            "Return only JSON."
        )

        response = client.chat.completions.create(
            model=OPENAI_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.1,
            response_format={"type": "json_object"},
        )

        response_text = response.choices[0].message.content.strip()
        evaluation_data = json.loads(response_text)

        if "idealAnswer" in evaluation_data and not isinstance(evaluation_data["idealAnswer"], str):
            evaluation_data["idealAnswer"] = json.dumps(evaluation_data["idealAnswer"])

        return EvaluationResponse(**evaluation_data)

    except Exception as e:
        print(f"Failed to generate response: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=AI_SERVICE_PORT)
