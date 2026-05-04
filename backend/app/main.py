from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.database import connect_db
from app.routes import auth, projects, tasks, dashboard

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield


app = FastAPI(
    title="Team Task Manager API",
    description="A collaborative task management system with role-based access control",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Team Task Manager API is running 🚀"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
