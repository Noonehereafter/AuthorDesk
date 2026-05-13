from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ProjectCreate(BaseModel):
    name: str
    type: str
    projectLanguage: str
    uiLanguage: str
    groundingLevel: int

@router.post("/")
def create_project(project: ProjectCreate):
    return {
        "id": "proj_abc123",
        "name": project.name,
        "type": project.type,
        "status": "active"
    }

@router.get("/")
def list_projects():
    return []
