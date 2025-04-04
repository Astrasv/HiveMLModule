from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import List
from sentiment_model import SentimentAnalyzer, Config
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="YouTube Comment Sentiment Analysis API",
    description="API to analyze sentiment and provide detailed insights on YouTube video comments",
    version="1.5.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

analyzer = SentimentAnalyzer()

class CommentInput(BaseModel):
    comments: List[str]

    @validator('comments')
    def validate_comments(cls, v):
        if any(len(c) > Config.MAX_LENGTH for c in v):
            raise ValueError(f"Comments must not exceed {Config.MAX_LENGTH} characters")
        return v

    class Config:
        schema_extra = {
            "example": {
                "comments": ["This video is amazing!", "Terrible content", "It's okay"]
            }
        }

@app.post("/analyze-sentiments/", 
    response_description="Returns sentiment percentages, summary, themes, length analysis, top comments, and suggestions",
    response_model=dict
)
async def analyze_comments(comment_input: CommentInput):
    try:
        logger.info(f"Received request with {len(comment_input.comments)} comments")
        result = analyzer.analyze_cached(tuple(comment_input.comments))
        return result
    except ValueError as e:
        logger.warning(f"Invalid input: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)