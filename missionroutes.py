from fastapi import APIRouter
from schemas.mission_schema import MissionInput
from services.geocoding_service import geocode_location
from services.geography_service import create_affected_area

router = APIRouter()

@router.post("/mission")
def create_mission(data: MissionInput):

    location_data = geocode_location(data.location)

    if location_data is None:
        return {"error": "Location not found"}

    affected_area = create_affected_area(
        location_data["latitude"],
        location_data["longitude"],
        data.radius
    )

    return {
        "location": location_data,
        "affected_area": affected_area
    }