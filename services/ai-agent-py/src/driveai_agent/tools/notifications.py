class NotificationGateway:
    """Boundary for APNs, FCM, or any future scheduling provider."""

    def __init__(self, provider: str = "mock") -> None:
        self.provider = provider

    def queue_push(self, payload: dict) -> dict:
        return {"provider": self.provider, "queued": True, "payload": payload}
