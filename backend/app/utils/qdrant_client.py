from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
import uuid

client = QdrantClient("localhost", port=6333)
model = SentenceTransformer("all-MiniLM-L6-v2")


try:
    client.get_collection("docs")
except:
    client.create_collection(
        collection_name="docs",
        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
    )

def store_embeddings(doc_id: str, chunks: list[str], embeddings: list[list[float]]):
    """Store chunks with metadata in Qdrant"""
    points = [
        PointStruct(
            id=str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{doc_id}_{i}")),
            vector=embedding,
            payload={
                "text": chunk,
                "doc_id": doc_id,
                "source": f"Page {i//10 + 1}"  # Simplified page tracking
            }
        )
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
    ]
    client.upsert(collection_name="docs", points=points)

def search_embeddings(query: str):
    """Search across all documents with metadata"""
    q_vec = model.encode([query])[0].tolist()
    hits = client.search(collection_name="docs", query_vector=q_vec, limit=5)

    return [
        {
            "text": hit.payload["text"],
            "doc_id": hit.payload["doc_id"],
            "score": hit.score,
            "source": hit.payload.get("source", "Unknown")
        }
        for hit in hits
    ]
