import os
import httpx
from app.utils.qdrant_client import search_embeddings
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

# Load config
llm_provider = os.getenv("LLM_PROVIDER", "mistral")
mistral_api_key = os.getenv("MISTRAL_API_KEY")
mistral_model = os.getenv("MISTRAL_MODEL_NAME", "open-mistral-7b")

if llm_provider != "mistral":
    raise ValueError(f"Unsupported LLM provider: {llm_provider}")

async def answer(query: str):
    try:
        context = search_embeddings(query)

        prompt = f"""Context:\n{context}\n\nAnswer the query: {query}
        Be concise and only use information from the context."""

        # Use raw HTTPX to avoid OpenAI SDK path issues
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {mistral_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": mistral_model,
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.2,
                    "max_tokens": 300,
                    "stream": False,
                    "random_seed": 0,
                    "response_format": {
                        "type": "text"
                    },
                    "tools": [],
                    "tool_choice": "auto",
                    "presence_penalty": 0,
                    "frequency_penalty": 0,
                    "n": 1,
                    "prediction": {
                        "type": "content",
                        "content": ""
                    },
                    "parallel_tool_calls": True,
                    "safe_prompt": False
                }
            )

        if response.status_code != 200:
            logger.error(f"Mistral API error: {response.text}")
            return {
                "answer": f"API Error: {response.status_code} - {response.text}",
                "sources": context
            }

        data = response.json()
        return {
            "answer": data["choices"][0]["message"]["content"],
            "sources": context
        }

    except Exception as e:
        logger.error(f"Error in RAG pipeline: {str(e)}", exc_info=True)
        return {
            "answer": f"I encountered an error processing your request: {str(e)}",
            "sources": []
        }
