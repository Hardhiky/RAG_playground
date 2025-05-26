from fastapi import APIRouter, UploadFile, File
from app.services.pdf_processor import process_pdf

router = APIRouter()

@router.post("/")
async def upload_pdfs(files: list[UploadFile] = File(...)):
    """Handle multiple PDF uploads"""
    doc_ids = []
    for file in files:
        doc_id = await process_pdf(file)
        doc_ids.append({
            "filename": file.filename,
            "doc_id": doc_id
        })
    return {
        "status": "success",
        "uploaded_files": doc_ids
    }
