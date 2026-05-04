from fastapi import APIRouter, Depends
from app.schemas.project import ProjectCreate, MemberAction
from app.controllers import project_controller
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("")
async def create_project(
    data: ProjectCreate, current_user: User = Depends(get_current_user)
):
    return await project_controller.create_project(data, current_user)


@router.get("")
async def get_projects(current_user: User = Depends(get_current_user)):
    return await project_controller.get_projects(current_user)


@router.post("/{project_id}/add-member")
async def add_member(
    project_id: str,
    data: MemberAction,
    current_user: User = Depends(get_current_user),
):
    return await project_controller.add_member(project_id, data, current_user)


@router.delete("/{project_id}/remove-member")
async def remove_member(
    project_id: str,
    data: MemberAction,
    current_user: User = Depends(get_current_user),
):
    return await project_controller.remove_member(project_id, data, current_user)


@router.get("/{project_id}/members")
async def get_members(
    project_id: str, current_user: User = Depends(get_current_user)
):
    return await project_controller.get_project_members(project_id, current_user)
