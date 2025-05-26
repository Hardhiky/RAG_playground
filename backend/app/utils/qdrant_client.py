from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
import uuid


client = QdrantClient("localhost", port=6333)

client.recreate_collection(
    collection_name="docs",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)


model = SentenceTransformer("all-MiniLM-L6-v2")


def store_embeddings(doc_id, chunks, vectors):
    points = [
        PointStruct(
            id=uuid.uuid5(uuid.NAMESPACE_DNS, f"{doc_id}_{i}"),
            vector=vec,
            payload={"text": text}
        )
        for i, (vec, text) in enumerate(zip(vectors, chunks))
    ]
    client.upload_points("docs", points)


def search_embeddings(query):
    q_vec = model.encode(query).tolist()
    hits = client.search(collection_name="docs", query_vector=q_vec, limit=5)
    return "\n".join([hit.payload["text"] for hit in hits])


if __name__ == "__main__":

    doc_id = "example-doc"
    chunks = ["This is the first chunk.", "Second part of the doc.", "More content here."]
    vectors = model.encode(chunks).tolist()


    store_embeddings(doc_id, chunks, vectors)


    print("Search results:")
    print(search_embeddings("What is in the second part?"))
