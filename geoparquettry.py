

import pydeck as pdk
import geopandas as gpd
import requests
from io import BytesIO

# URL of the GeoParquet file
url = "https://salmaamarva.github.io/GEOJ/pop.parquet"

# Download the GeoParquet file
response = requests.get(url)
file = BytesIO(response.content)

# Load the GeoParquet file into a GeoDataFrame
gdf = gpd.read_parquet(file)

# Ensure the data is in WGS84 (EPSG:4326)
if gdf.crs != 'EPSG:4326':
    gdf = gdf.to_crs(epsg=4326)
    print("CRS transformed to WGS84 (EPSG:4326)")

# Check the first few rows and geometry column to ensure correct structure
print(gdf.head())
print(gdf.geometry.head())  # Print the first few geometries

# If the geometry type is not Point, extract the coordinates correctly
if gdf.geometry.geom_type[0] != 'Point':
    print("Warning: Geometry is not of type Point. This needs to be handled.")
    # If geometries are polygons or other types, you would need to handle accordingly
    # For now, I'll assume you are working with Points, so we extract the first coordinate
    gdf['longitude'] = gdf.geometry.x
    gdf['latitude'] = gdf.geometry.y
else:
    # If it's Point geometry, extract directly the coordinates
    gdf['longitude'] = gdf.geometry.x
    gdf['latitude'] = gdf.geometry.y

# Display the first few coordinates to verify they are correct
print(gdf[['longitude', 'latitude']].head())

# Create a pydeck visualization
deck = pdk.Deck(
    initial_view_state=pdk.ViewState(
        latitude=31.7917,  # Central coordinates for Morocco
        longitude=-7.0926,
        zoom=6,  # Zoom level
        pitch=0,  # No tilt
        bearing=0,  # No rotation
    ),
    layers=[
        pdk.Layer(
            'ScatterplotLayer',  # Layer type
            data=gdf,
            get_position='[longitude, latitude]',  # Use the explicit longitude and latitude columns
            get_color='[255, 0, 0, 160]',  # Red color for the dots
            get_radius=2000,  # Set radius for better visibility
            pickable=True,  # Enable interactivity
            tooltip=True,  # Show tooltips
        ),
    ],
    map_style='https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',  # Carto style
)

# Export the visualization to an HTML file
deck.to_html('map_visualization_from_url.html', notebook_display=False)
