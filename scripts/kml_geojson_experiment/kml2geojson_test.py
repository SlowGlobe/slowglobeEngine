from kml2geojson.main import convert
from shapely.geometry import LineString
import geopandas as gpd
import pandas as pd
import os


def checkCrossing(coordinates):
    """Check if coordinates cross the 180th meridian."""
    for idx in range(1, len(coordinates)):
        lon1, lon2 = coordinates[idx - 1][0], coordinates[idx][0]
        if abs(lon2 - lon1) > 180.0:
            return True, idx
    return False, -1


def intersection_point(point1, point2):
    """Basic function to find where line crosses the 180th meridian"""
    x1, y1, z1 = point1
    x2, y2, z2 = point2
    x_vert = 180.0

    x1_out, x2_out = (x_vert, x_vert)

    # Ensure that we're working in a positive longitude space
    if x1 < 0:
        x1 += 360.0
        x1_out = -x_vert
    if x2 < 0:
        x2 += 360.0
        x2_out = -x_vert

    m = (y2 - y1) / (x2 - x1)
    c = y1 - m * x1

    lat_out = m * x_vert + c

    return (x1_out, lat_out, z1), (x2_out, lat_out, z2)


def kml_to_geojson(kml_file):
    """Convert KML to GeoJSON and handle antimeridian crossing geometries."""

    # Parse KML as GeoJSON
    geojson = convert(kml_file, separate_folders=True)
    gdf = gpd.GeoDataFrame.from_features(geojson[0]["features"])

    # Drop unnecessary columns for readability
    gdf.drop(["times", "description"], axis=1, errors="ignore", inplace=True)

    for index, row in gdf.iterrows():
        if row["geometry"].geom_type == "Point":
            # TODO: Do we want point-rename functionality?
            # print("\nCurrent name of point:", gdf.at[index, 'name'])
            # gdf.at[index, 'name'] = input("Desired name of point: ")
            gdf.at[index, "icon"] = "target"
        if row["geometry"].geom_type == "LineString":
            gdf.at[index, "type"] = "flight"

            test, split_idx = checkCrossing(row["geometry"].coords)
            if test:
                # Split the LineString into two separate LineStrings
                coordinates = list(row["geometry"].coords)
                pre_meridian = coordinates[:split_idx]
                post_meridian = coordinates[split_idx:]
                point_1, point_2 = intersection_point(
                    pre_meridian[-1], post_meridian[0]
                )
                pre_meridian.append(point_1)
                post_meridian.insert(0, point_2)

                gdf.at[index, "geometry"] = LineString(pre_meridian)
                # TODO: Figure out cleaner way to append to GeoDataFrame (there is no 'append' function)
                gdf.at[index + 1, "geometry"] = LineString(post_meridian)
                gdf.at[index + 1, "type"] = "flight"
                gdf.at[index + 1, "name"] = gdf.at[index, "name"]

    return gdf


if __name__ == "__main__":
    output_to_save = None
    directory = "./flight_data"
    for idx, filename in enumerate(os.listdir(directory)):
        output = kml_to_geojson(os.path.join(directory, filename))
        output_to_save = output if idx == 0 else pd.concat([output_to_save, output])

    # Remove duplicate points (repeat airports)
    output_to_save.drop_duplicates(inplace=True)
    # TODO: Figure out how to get rid of CRS warning/error
    output_to_save.to_file("output_file.json", driver="GeoJSON", crs=output_to_save.crs)
