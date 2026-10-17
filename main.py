from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict
from pydantic import BaseModel
from .services.requirement_service import generate_requirements

from .services.populationservices import calculate_affected_population

from shapely.geometry import shape


app = FastAPI(
    title="Disaster Population Estimation API"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request model
# --------------------------------------------------

class PopulationRequest(BaseModel):
    disaster_type: str
    location: str = ""
    geometry: Dict[str, Any]


# --------------------------------------------------
# Home route
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Disaster Population Estimation API is running"
    }


# --------------------------------------------------
# Population estimation
# --------------------------------------------------

@app.post("/population/estimate")
def estimate_population(request: PopulationRequest):

    # Check geometry type
    if request.geometry.get("type") != "Polygon":
        return {
            "error": "Only Polygon geometry is supported"
        }

    # Check coordinates
    coordinates = request.geometry.get("coordinates")

    if not coordinates:
        return {
            "error": "Polygon coordinates are missing"
        }

    try:

        # Convert GeoJSON into Shapely polygon
        polygon = shape(request.geometry)

        # Convert polygon to GeoJSON-like format
        disaster_geometry = polygon.__geo_interface__

        # Calculate population using WorldPop
        affected_population = calculate_affected_population(
            disaster_geometry
        )

        # Return result to frontend
        return {
            "disaster_type": request.disaster_type,
            "location": request.location,
            "affected_population": affected_population
        }

    except Exception as e:

        return {
            "error": str(e)
        }
class RequirementRequest(BaseModel):
    disaster_type: str
    location: str
    affected_population: int
@app.post("/requirements/generate")
def generate_resource_requirements(request: RequirementRequest):

    if request.affected_population <= 0:
        return {
            "success": False,
            "message": "Affected population must be greater than 0"
        }

    requirements = generate_requirements(
        request.affected_population
    )

    return {
        "success": True,
        "disaster_type": request.disaster_type,
        "location": request.location,
        "affected_population": request.affected_population,
        "requirements": requirements
    }