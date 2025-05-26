from fastapi import APIRouter, UploadFile, File
from app.services.pdf_processor import process_pdf

router = APIRouter()

@router.post("/")
async def upload_pdf(file: UploadFile = File(...)):
    doc_id = await process_pdf(file)
    return {"status": "success", "doc_id": doc_id}
