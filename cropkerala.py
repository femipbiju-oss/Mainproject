import geopandas as gpd
import rasterio
from rasterio.mask import mask
from pathlib import Path


# =========================================================
# 1. PROJECT PATHS
# =========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

# India state boundaries
KERALA_BOUNDARY = (
    PROJECT_ROOT
    / "data"
    / "boundaries"
    / "india_states.geojson"
)

# WorldPop India raster
WORLDPOP_FILE = (
    PROJECT_ROOT
    / "data"
    / "worldpop"
    / "india_population.tif"
)

# Output Kerala raster
KERALA_OUTPUT = (
    PROJECT_ROOT
    / "data"
    / "worldpop"
    / "kerala_population.tif"
)


# =========================================================
# 2. CHECK FILES
# =========================================================

print("Boundary file:")
print(KERALA_BOUNDARY)

print("Boundary exists:", KERALA_BOUNDARY.exists())

print("\nWorldPop file:")
print(WORLDPOP_FILE)

print("WorldPop exists:", WORLDPOP_FILE.exists())


# =========================================================
# 3. READ INDIA STATE BOUNDARIES
# =========================================================

states = gpd.read_file(KERALA_BOUNDARY)

print("\nBoundary columns:")
print(states.columns)


# =========================================================
# 4. FIND KERALA
# =========================================================

kerala = states[states["NAME"] == "Kerala"]

if kerala.empty:
    raise ValueError("Kerala boundary was not found!")


print("\nKerala boundary found!")

print(kerala[["NAME", "geometry"]])


# =========================================================
# 5. OPEN WORLDPOP RASTER
# =========================================================

with rasterio.open(WORLDPOP_FILE) as src:

    print("\nWorldPop information:")
    print("CRS:", src.crs)
    print("Width:", src.width)
    print("Height:", src.height)
    print("Resolution:", src.res)
    print("Bounds:", src.bounds)
    print("NoData:", src.nodata)


    # =====================================================
    # 6. CONVERT KERALA BOUNDARY TO RASTER CRS
    # =====================================================

    kerala = kerala.to_crs(src.crs)


    # =====================================================
    # 7. CROP WORLDPOP USING KERALA BOUNDARY
    # =====================================================

    cropped_image, cropped_transform = mask(
        src,
        kerala.geometry,
        crop=True,
        nodata=src.nodata
    )


    # =====================================================
    # 8. UPDATE RASTER METADATA
    # =====================================================

    output_meta = src.meta.copy()

    output_meta.update({
        "driver": "GTiff",
        "height": cropped_image.shape[1],
        "width": cropped_image.shape[2],
        "transform": cropped_transform
    })


    # =====================================================
    # 9. SAVE KERALA RASTER
    # =====================================================

    with rasterio.open(
        KERALA_OUTPUT,
        "w",
        **output_meta
    ) as dst:

        dst.write(cropped_image)


print("\n======================================")
print("Kerala population raster created!")
print("======================================")
print(KERALA_OUTPUT)