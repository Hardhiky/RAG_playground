from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, query
from qdrant_client import QdrantClient
from fastapi import APIRouter

app = FastAPI(title="RAG Playground API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(query.router, prefix="/query", tags=["Query"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
