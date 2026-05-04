from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv

from app.models.user import User
from app.models.project import Project
from app.models.task import Task

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "taskmanager")


async def connect_db():
    client = AsyncIOMotorClient(MONGO_URI)
    await init_beanie(
        database=client[DATABASE_NAME],
        document_models=[User, Project, Task],
    )
    print(f"Connected to MongoDB: {DATABASE_NAME}")


async def close_db():
    pass
