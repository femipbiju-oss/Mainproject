from shapely.geometry import Point
from pyproj import Transformer

def create_affected_area(lat, lon, radius_km):

    transformer_to_utm = Transformer.from_crs(
        "EPSG:4326",
        "EPSG:32643",
        always_xy=True
    )

    transformer_to_wgs = Transformer.from_crs(
        "EPSG:32643",
        "EPSG:4326",
        always_xy=True
    )

    x, y = transformer_to_utm.transform(lon, lat)

    point = Point(x, y)

    area = point.buffer(radius_km * 1000)

    coordinates = []

    for x, y in area.exterior.coords:
        lon2, lat2 = transformer_to_wgs.transform(x, y)
        coordinates.append([lon2, lat2])

    return {
        "type": "Polygon",
        "coordinates": [coordinates]
    }