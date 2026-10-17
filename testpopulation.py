from shapely.geometry import Polygon
from services.populationservices import calculate_affected_population


# Example disaster-affected region
# Coordinates are longitude, latitude
disaster_area = Polygon([
    (76.25, 10.05),
    (76.27, 10.05),
    (76.27, 10.07),
    (76.25, 10.07),
    (76.25, 10.05)
])


# Calculate affected population
population = calculate_affected_population(disaster_area)


print("--------------------------------")
print("DISASTER POPULATION ESTIMATION")
print("--------------------------------")
print("Affected population:", population)
print("--------------------------------")