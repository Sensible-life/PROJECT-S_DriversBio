class StudyRepository:
    """Repository boundary for notes, chunks, study points, sessions, and generated artifacts."""

    def save_source_artifacts(self, payload: dict) -> dict:
        return {"saved": True, "payload": payload}

    def load_user_profile(self, user_id: str) -> dict:
        return {"user_id": user_id}

    def save_dialogue_turn(self, payload: dict) -> dict:
        return {"saved": True, "payload": payload}

    def save_exam_set(self, payload: dict) -> dict:
        return {"saved": True, "payload": payload}
