import folium
import requests

geojson_url = "https://salmaamarva.github.io/geojson/1.geojson"

try:
    # Fetch GeoJSON from URL with timeout
    response = requests.get(geojson_url, timeout=10)
    response.raise_for_status()  # Raise error if the request fails
    geojson_data = response.json()

    # Create a map
    m = folium.Map(location=[33.5731, -7.5898], zoom_start=6)

    # Add GeoJSON to the map
    folium.GeoJson(
        geojson_data,
        name="GeoJSON Data"
    ).add_to(m)

    # Save the map to an HTML file
    m.save("map_with_geojson.html")
    print("Map created and saved as 'map_with_geojson.html'.")

except requests.exceptions.RequestException as e:
    print(f"Error fetching GeoJSON: {e}")
