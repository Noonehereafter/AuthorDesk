from fastapi import FastAPI
from app.api.v1 import projects, chapters

app = FastAPI(
    title="AuthorDesk Orchestrator API",
    version="1.0.0",
    description="API for AuthorDesk Writing Operating System"
)

app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(chapters.router, prefix="/api/v1/projects/{project_id}/chapters", tags=["chapters"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
