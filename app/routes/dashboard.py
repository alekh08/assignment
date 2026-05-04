from fastapi import APIRouter, Depends
from app.controllers import dashboard_controller
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
async def get_dashboard(current_user: User = Depends(get_current_user)):
    return await dashboard_controller.get_dashboard(current_user)
