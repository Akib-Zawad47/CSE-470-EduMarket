from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="EduMarket AI Microservice", description="Handles Recommendations and Lead Scoring")

class UserRequest(BaseModel):
    user_id: int

@app.get("/health")
def health_check():
    return {"status": "AI Microservice is running and ready for Spring Boot requests"}

@app.post("/api/v1/ai/recommend-courses")
def recommend_courses(req: UserRequest):
    # TODO: Implement Scikit-learn KNN recommendation logic here
    # 1. Fetch user data (browsing history/interests) from PostgreSQL
    # 2. Run model
    # 3. Return course IDs
    return {"user_id": req.user_id, "recommended_course_ids": [101, 105, 203]}
