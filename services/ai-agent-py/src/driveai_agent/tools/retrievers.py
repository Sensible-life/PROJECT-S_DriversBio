class StudyRetriever:
    """Boundary for semantic retrieval over chunks, weak points, and study metadata."""

    def retrieve(self, query: str, source_ids: list[str] | None = None) -> list[dict]:
        return [
            {
                "source_id": source_ids[0] if source_ids else "source_1",
                "chunk_id": "chunk_1",
                "text": f"Placeholder retrieval for query: {query}",
                "relevance_score": 0.7,
            }
        ]
