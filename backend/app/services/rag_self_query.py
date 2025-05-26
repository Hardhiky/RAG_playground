async def answer(query: str):
    filtered_query = f"(Filter Applied) {query}"
    from .rag_basic import answer as basic_answer
    return await basic_answer(filtered_query)
