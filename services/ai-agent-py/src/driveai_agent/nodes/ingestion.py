from ..schemas.ingestion import EmphasisSpan, IngestionState, RankedStudyPoint, StudyChunk


def normalize_source(state: IngestionState) -> IngestionState:
    source_text = (state.get("source_text") or "").strip()
    return {
        "source_text": source_text,
        "normalized_text": source_text,
    }


def extract_emphasis_signals(state: IngestionState) -> IngestionState:
    normalized_text = state.get("normalized_text", "")
    emphasis_spans: list[EmphasisSpan] = []

    if "**" in normalized_text:
        emphasis_spans.append(
            EmphasisSpan(
                label="bold_text",
                signal_type="markdown_bold",
                text="Potential bolded concept detected",
                weight=0.9,
            )
        )

    if "==" in normalized_text:
        emphasis_spans.append(
            EmphasisSpan(
                label="highlight_text",
                signal_type="markdown_highlight",
                text="Potential highlighted concept detected",
                weight=0.95,
            )
        )

    return {"emphasis_spans": emphasis_spans}


def segment_document(state: IngestionState) -> IngestionState:
    normalized_text = state.get("normalized_text", "")
    sections = [section.strip() for section in normalized_text.split("\n\n") if section.strip()]
    chunks = [
        StudyChunk(
            chunk_id=f"chunk_{index + 1}",
            heading=f"Section {index + 1}",
            body=section,
        )
        for index, section in enumerate(sections)
    ]
    return {"chunks": chunks}


def rank_study_points(state: IngestionState) -> IngestionState:
    emphasis_spans = state.get("emphasis_spans", [])
    chunks = state.get("chunks", [])
    points: list[RankedStudyPoint] = []

    for index, chunk in enumerate(chunks):
        points.append(
            RankedStudyPoint(
                point_id=f"point_{index + 1}",
                title=chunk.heading,
                rationale="Initial heuristic ranking based on chunk order and emphasis signals.",
                priority_score=0.8 if emphasis_spans else 0.55,
                source_chunk_ids=[chunk.chunk_id],
            )
        )

    return {"ranked_points": points}


def persist_source_artifacts(state: IngestionState) -> IngestionState:
    return {
        "persisted": True,
        "persistence_summary": {
            "source_saved": True,
            "chunk_count": len(state.get("chunks", [])),
            "ranked_point_count": len(state.get("ranked_points", [])),
        },
    }
