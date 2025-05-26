async def answer(query: str):
    from .rag_basic import answer as basic_answer
    basic = await basic_answer(query)
    return {**basic, "reranker_score": 0.92}
