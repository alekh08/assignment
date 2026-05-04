from fastapi import APIRouter, Depends, Query
from app.schemas.task import TaskCreate, TaskUpdate
from app.controllers import task_controller
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("")
async def create_task(data: TaskCreate, current_user: User = Depends(get_current_user)):
    return await task_controller.create_task(data, current_user)


@router.get("")
async def get_tasks(
    project_id: str = Query(..., description="Filter tasks by project ID"),
    my_tasks: bool = Query(False, description="Show only my tasks"),
    current_user: User = Depends(get_current_user),
):
    return await task_controller.get_tasks(project_id, current_user, my_tasks)


@router.put("/{task_id}")
async def update_task(
    task_id: str,
    data: TaskUpdate,
    current_user: User = Depends(get_current_user),
):
    return await task_controller.update_task(task_id, data, current_user)


@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user: User = Depends(get_current_user)):
    return await task_controller.delete_task(task_id, current_user)
