import folium
from folium.raster_layers import ImageOverlay
from rio_tiler.io import COGReader
from rio_tiler.colormap import cmap
import numpy as np
from PIL import Image
import tempfile
# COG URL
url_to_cog = "https://georaster-layer-for-leaflet.s3.amazonaws.com/Blue-Earth-Bathymetry-COG.tif"
# Define Morocco's bounding box: [west, south, east, north]
morocco_bounds = [-17.0, 21.0, -1.0, 36.0]
# Function to render COG preview for Morocco
def render_cog_for_morocco(cog_url, bounds, max_size=1024):
    with COGReader(cog_url) as cog:
        # Crop the COG to Morocco's bounding box
        tile_data, mask = cog.part(bounds)
        # Normalize the data to 8-bit range (0-255)
        min_val = np.nanmin(tile_data)
        max_val = np.nanmax(tile_data)
        tile_data = ((tile_data - min_val) / (max_val - min_val) * 255).astype(np.uint8)
        # Apply colormap (viridis)
        viridis = cmap.get("viridis")
        rgba = np.zeros((tile_data.shape[1], tile_data.shape[2], 4), dtype=np.uint8)
        for i in range(tile_data.shape[1]):
            for j in range(tile_data.shape[2]):
                rgba[i, j] = viridis[tile_data[0, i, j]]

        # Convert to an image
        img = Image.fromarray(rgba)
        return img, bounds
# Render COG cropped to Morocco and save it temporarily
image, bounds = render_cog_for_morocco(url_to_cog, morocco_bounds)
temp_file = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
image.save(temp_file.name)
# Create the Folium map centered on Morocco
map_center = [(bounds[1] + bounds[3]) / 2, (bounds[0] + bounds[2]) / 2]
m = folium.Map(location=map_center, zoom_start=6)
# Add the cropped image as an overlay
ImageOverlay(
    image=temp_file.name,
    bounds=[[bounds[1], bounds[0]], [bounds[3], bounds[2]]],
    opacity=0.7,
).add_to(m)
# Add layer controls
folium.LayerControl().add_to(m)
# Save the map
m.save("morocco_cog_visualization.html")
print("Map has been saved as 'morocco_cog_visualization.html'. Open this file in your browser to view the map.")


