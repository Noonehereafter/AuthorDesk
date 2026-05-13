from fastapi import APIRouter

router = APIRouter()

@router.post("/")
def create_chapter(project_id: str):
    return {"id": "ch_018", "title": "New Chapter"}

@router.get("/")
def list_chapters(project_id: str):
    return []
