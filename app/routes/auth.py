from fastapi import APIRouter
from app.schemas.auth import SignupRequest, LoginRequest
from app.controllers import auth_controller

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup")
async def signup(data: SignupRequest):
    return await auth_controller.signup(data)


@router.post("/login")
async def login(data: LoginRequest):
    return await auth_controller.login(data)
