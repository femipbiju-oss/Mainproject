import rasterio
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]

KERALA_FILE = (
    PROJECT_ROOT
    / "data"
    / "worldpop"
    / "kerala_population.tif"
)


print("File:", KERALA_FILE)
print("Exists:", KERALA_FILE.exists())


if KERALA_FILE.exists():

    with rasterio.open(KERALA_FILE) as src:

        print("\nKerala raster opened successfully!")
        print("CRS:", src.crs)
        print("Width:", src.width)
        print("Height:", src.height)
        print("Bands:", src.count)
        print("Resolution:", src.res)
        print("Bounds:", src.bounds)
        print("NoData:", src.nodata)