from fastapi import APIRouter

router = APIRouter()

@router.post("/population")
def estimate_population(...):

    # receive polygon
    # call population_service
    # return population

    pass