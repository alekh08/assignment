from fastapi import HTTPException
from beanie import PydanticObjectId
from datetime import datetime

from app.models.task import Task, TaskStatus
from app.models.project import Project
from app.models.user import User


async def get_dashboard(current_user: User) -> dict:
    # Get all projects user is a member of
    all_projects = await Project.find_all().to_list()
    user_projects = [
        p for p in all_projects
        if any(str(m.user_id) == str(current_user.id) for m in p.members)
    ]

    project_ids = [p.id for p in user_projects]

    # Get all tasks in user's projects
    all_tasks = []
    for pid in project_ids:
        tasks = await Task.find(Task.project_id == pid).to_list()
        all_tasks.extend(tasks)

    now = datetime.utcnow()

    # Tasks grouped by status
    by_status = {
        TaskStatus.todo: 0,
        TaskStatus.in_progress: 0,
        TaskStatus.done: 0,
    }
    for t in all_tasks:
        by_status[t.status] = by_status.get(t.status, 0) + 1

    # Overdue tasks
    overdue = [
        t for t in all_tasks
        if t.due_date and t.due_date.replace(tzinfo=None) < now and t.status != TaskStatus.done
    ]

    # Tasks per user
    tasks_per_user: dict = {}
    for t in all_tasks:
        if t.assigned_to:
            uid = str(t.assigned_to)
            tasks_per_user[uid] = tasks_per_user.get(uid, 0) + 1

    # Enrich tasks_per_user with names
    tasks_per_user_named = []
    for uid, count in tasks_per_user.items():
        user = await User.get(PydanticObjectId(uid))
        tasks_per_user_named.append({
            "user_id": uid,
            "name": user.name if user else "Unknown",
            "task_count": count,
        })

    return {
        "total_tasks": len(all_tasks),
        "total_projects": len(user_projects),
        "by_status": {
            "todo": by_status.get(TaskStatus.todo, 0),
            "in_progress": by_status.get(TaskStatus.in_progress, 0),
            "done": by_status.get(TaskStatus.done, 0),
        },
        "overdue_count": len(overdue),
        "overdue_tasks": [
            {
                "id": str(t.id),
                "title": t.title,
                "due_date": t.due_date,
                "project_id": str(t.project_id),
            }
            for t in overdue
        ],
        "tasks_per_user": tasks_per_user_named,
    }
