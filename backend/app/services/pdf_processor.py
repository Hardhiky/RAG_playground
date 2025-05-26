import fitz
from app.utils.qdrant_client import store_embeddings
from sentence_transformers import SentenceTransformer
import uuid

model = SentenceTransformer("all-MiniLM-L6-v2")

async def process_pdf(file):
    """Process a single PDF file into chunks with embeddings"""
    print("Processing file:", file.filename)
    doc = fitz.open(stream=await file.read(), filetype="pdf")
    texts = [page.get_text() for page in doc]
    chunks = [chunk for text in texts for chunk in text.split("\n\n") if len(chunk.strip()) > 50]
    print(f"Extracted {len(chunks)} chunks")
    embeddings = model.encode(chunks).tolist()
    doc_id = str(uuid.uuid4())
    store_embeddings(doc_id, chunks, embeddings)
    return doc_id
