from pydantic import BaseModel

class MissionInput(BaseModel):
    location: str
    disaster: str
    severity: str
    duration: int
    radius: float