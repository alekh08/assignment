from fastapi import HTTPException, status
from beanie import PydanticObjectId
from datetime import datetime
from typing import List, Optional

from app.models.task import Task, TaskStatus
from app.models.project import Project
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate


def _task_to_dict(task: Task) -> dict:
    now = datetime.utcnow()
    due_date_naive = task.due_date.replace(tzinfo=None) if task.due_date else None
    is_overdue = (
        due_date_naive is not None
        and due_date_naive < now
        and task.status != TaskStatus.done
    )
    return {
        "id": str(task.id),
        "title": task.title,
        "description": task.description,
        "project_id": str(task.project_id),
        "assigned_to": str(task.assigned_to) if task.assigned_to else None,
        "created_by": str(task.created_by),
        "status": task.status,
        "priority": task.priority,
        "due_date": task.due_date,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "is_overdue": is_overdue,
    }


def _is_project_member(project: Project, user_id) -> bool:
    return any(str(m.user_id) == str(user_id) for m in project.members)


def _is_project_admin(project: Project, user_id) -> bool:
    from app.models.project import MemberRole
    for m in project.members:
        if str(m.user_id) == str(user_id) and m.role.value == "admin":
            return True
    return False


async def create_task(data: TaskCreate, current_user: User) -> dict:
    project = await Project.get(PydanticObjectId(data.project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not _is_project_member(project, current_user.id):
        raise HTTPException(status_code=403, detail="Access denied to this project")

    assigned_to = None
    if data.assigned_to:
        assigned_user = await User.get(PydanticObjectId(data.assigned_to))
        if not assigned_user:
            raise HTTPException(status_code=404, detail="Assigned user not found")
        if not _is_project_member(project, assigned_user.id):
            raise HTTPException(status_code=400, detail="Assigned user is not a project member")
        assigned_to = assigned_user.id

    task = Task(
        title=data.title,
        description=data.description,
        project_id=PydanticObjectId(data.project_id),
        assigned_to=assigned_to,
        created_by=current_user.id,
        priority=data.priority,
        due_date=data.due_date,
    )
    await task.insert()
    return _task_to_dict(task)


async def get_tasks(
    project_id: str,
    current_user: User,
    my_tasks: bool = False,
) -> List[dict]:
    project = await Project.get(PydanticObjectId(project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not _is_project_member(project, current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")

    query = Task.find(Task.project_id == PydanticObjectId(project_id))
    tasks = await query.to_list()

    if my_tasks:
        tasks = [t for t in tasks if str(t.assigned_to) == str(current_user.id)]

    return [_task_to_dict(t) for t in tasks]


async def get_overdue_tasks(current_user: User) -> List[dict]:
    all_projects = await Project.find_all().to_list()
    user_projects = [
        p for p in all_projects
        if any(str(m.user_id) == str(current_user.id) for m in p.members)
    ]
    project_ids = [p.id for p in user_projects]

    all_tasks = []
    for pid in project_ids:
        tasks = await Task.find(Task.project_id == pid).to_list()
        all_tasks.extend(tasks)

    now = datetime.utcnow()
    overdue = [
        t for t in all_tasks
        if t.due_date and t.due_date.replace(tzinfo=None) < now and t.status != TaskStatus.done
    ]
    return [_task_to_dict(t) for t in overdue]


async def update_task(task_id: str, data: TaskUpdate, current_user: User) -> dict:
    task = await Task.get(PydanticObjectId(task_id))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = await Project.get(task.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_admin = _is_project_admin(project, current_user.id)
    is_assigned = task.assigned_to and str(task.assigned_to) == str(current_user.id)

    if not is_admin and not is_assigned:
        raise HTTPException(
            status_code=403,
            detail="Only admins or the assigned user can update this task",
        )

    update_data = data.model_dump(exclude_unset=True)

    if "assigned_to" in update_data and update_data["assigned_to"]:
        assigned_user = await User.get(PydanticObjectId(update_data["assigned_to"]))
        if not assigned_user:
            raise HTTPException(status_code=404, detail="Assigned user not found")
        update_data["assigned_to"] = assigned_user.id

    for key, value in update_data.items():
        setattr(task, key, value)

    task.updated_at = datetime.utcnow()
    await task.save()
    return _task_to_dict(task)


async def delete_task(task_id: str, current_user: User) -> dict:
    task = await Task.get(PydanticObjectId(task_id))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = await Project.get(task.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not _is_project_admin(project, current_user.id):
        raise HTTPException(status_code=403, detail="Only project admins can delete tasks")

    await task.delete()
    return {"message": "Task deleted successfully"}
