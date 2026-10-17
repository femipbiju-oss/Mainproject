import rasterio
from rasterio.mask import mask
from pathlib import Path


# Get the project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# WorldPop raster
WORLDPOP_FILE = PROJECT_ROOT / "data" / "worldpop" / "kerala_population.tif"


def calculate_affected_population(disaster_geometry):

    with rasterio.open(WORLDPOP_FILE) as src:

        # Check CRS
        print("WorldPop CRS:", src.crs)

        # Extract population pixels inside disaster region
        out_image, out_transform = mask(
            src,
            [disaster_geometry],
            crop=True,
            filled=False
        )

        # Get first band
        population = out_image[0]

        # Remove invalid / NoData values
        population = population.compressed()

        # Keep only valid population values
        population = population[population >= 0]

        # Calculate total
        total_population = population.sum()

        return round(float(total_population))