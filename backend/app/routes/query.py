from fastapi import APIRouter
from app.models.schemas import QueryRequest
from app.services import rag_basic, rag_self_query, rag_reranker
import time

router = APIRouter()

@router.post("/")
async def query(request: QueryRequest):
    results = {}
    for model in request.models:
        start = time.time()

        if model == "basic":
            response = await rag_basic.answer(request.query)
        elif model == "self_query":
            response = await rag_self_query.answer(request.query)
        elif model == "reranker":
            response = await rag_reranker.answer(request.query)
        else:
            response = {"error": f"Unknown model: {model}"}

        results[model] = {
            **response,
            "latency": round(time.time() - start, 2)
        }

    return results
