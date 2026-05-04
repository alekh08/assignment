from fastapi import HTTPException, status
from beanie import PydanticObjectId
from typing import List

from app.models.project import Project, ProjectMember, MemberRole
from app.models.user import User
from app.models.task import Task
from app.schemas.project import ProjectCreate, MemberAction


def _project_to_dict(project: Project) -> dict:
    return {
        "id": str(project.id),
        "name": project.name,
        "description": project.description,
        "owner_id": str(project.owner_id),
        "members": [
            {"user_id": str(m.user_id), "role": m.role} for m in project.members
        ],
        "created_at": project.created_at,
    }


async def create_project(data: ProjectCreate, current_user: User) -> dict:
    project = Project(
        name=data.name,
        description=data.description,
        owner_id=current_user.id,
        members=[ProjectMember(user_id=current_user.id, role=MemberRole.admin)],
    )
    await project.insert()
    return _project_to_dict(project)


async def get_projects(current_user: User) -> List[dict]:
    # Return projects where user is a member
    all_projects = await Project.find_all().to_list()
    user_projects = [
        p for p in all_projects if any(str(m.user_id) == str(current_user.id) for m in p.members)
    ]
    return [_project_to_dict(p) for p in user_projects]


def _get_member(project: Project, user_id) -> ProjectMember | None:
    for m in project.members:
        if str(m.user_id) == str(user_id):
            return m
    return None


def _is_admin(project: Project, user_id) -> bool:
    member = _get_member(project, user_id)
    return member is not None and member.role == MemberRole.admin


async def add_member(project_id: str, data: MemberAction, current_user: User) -> dict:
    project = await Project.get(PydanticObjectId(project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not _is_admin(project, current_user.id):
        raise HTTPException(status_code=403, detail="Only admins can add members")

    target_user = await User.get(PydanticObjectId(data.user_id))
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if _get_member(project, target_user.id):
        raise HTTPException(status_code=400, detail="User is already a member")

    project.members.append(ProjectMember(user_id=target_user.id, role=MemberRole.member))
    await project.save()
    return _project_to_dict(project)


async def remove_member(project_id: str, data: MemberAction, current_user: User) -> dict:
    project = await Project.get(PydanticObjectId(project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not _is_admin(project, current_user.id):
        raise HTTPException(status_code=403, detail="Only admins can remove members")

    if str(data.user_id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot remove yourself")

    original_count = len(project.members)
    project.members = [m for m in project.members if str(m.user_id) != data.user_id]

    if len(project.members) == original_count:
        raise HTTPException(status_code=404, detail="Member not found in project")

    await project.save()
    return _project_to_dict(project)


async def get_project_members(project_id: str, current_user: User) -> List[dict]:
    project = await Project.get(PydanticObjectId(project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not _get_member(project, current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")

    result = []
    for m in project.members:
        user = await User.get(m.user_id)
        if user:
            result.append({
                "user_id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": m.role,
            })
    return result
