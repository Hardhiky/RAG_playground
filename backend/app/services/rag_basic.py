import os
from app.utils.qdrant_client import search_embeddings
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
)

async def answer(query: str):
    context = search_embeddings(query)
    prompt = f"Context:\n{context}\n\nAnswer the query: {query}"
    response = client.chat.completions.create(
        model="google/gemini-2.0-flash-exp:free",
        messages=[{"role": "user", "content": prompt}]
    )
    return {
        "answer": response.choices[0].message.content,
        "context": context
    }
