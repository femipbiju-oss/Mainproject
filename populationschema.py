from pydantic import BaseModel

class PopulationRequest(BaseModel):
    mission_id: int
    polygon: dict