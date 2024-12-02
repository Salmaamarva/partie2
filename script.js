const formatInfo = {
    cog: {
        description: "COG, ou GeoTIFF optimisé pour le cloud, est un format conçu pour de grands ensembles de données raster, permettant un accès rapide aux portions de données stockées dans le cloud.",
        benefits: [
            "Optimisé pour un accès rapide en cloud",
            "Idéal pour les grands ensembles de données raster",
            "Largement pris en charge dans les outils SIG"
        ],
        storageSize: 323
    },
    geojson: {
        description: "GEOJSON est un format basé sur JSON pour encoder des structures de données géographiques, compatible avec des bibliothèques de cartographie comme Leaflet et Esri.",
        benefits: [
            "Léger et facile à analyser",
            "Compatible avec divers outils SIG et cartographiques",
            "Idéal pour les petits et moyens ensembles de données"
        ],
        storageSize: 142
    },
    geoparquet: {
        description: "GEOPARQUET est un format qui combine le stockage colonnaire Parquet avec des données spatiales, idéal pour de grands ensembles de données et un traitement de requêtes efficace.",
        benefits: [
            "Optimisé pour de grands ensembles de données",
            "Stockage colonnaire pour un traitement efficace",
            "Prend en charge des types de données spatiales complexes"
        ],
        storageSize: 25
    },
    zarr: {
        description: "ZARR est un format pour des tableaux N-dimensionnels, découpés et compressés, adapté aux grandes données multidimensionnelles dans le stockage en cloud.",
        benefits: [
            "Efficace pour les données multidimensionnelles",
            "Prend en charge le stockage cloud",
            "Idéal pour les données scientifiques et environnementales"
        ],
        storageSize: 1
    }
};
function hideAllMaps() {
    // Hide the map container and reset its content
    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = '';
    
    // Hide the secondary map container
    const secondaryMap = document.getElementById('map-secondary');
    secondaryMap.innerHTML = '';
    secondaryMap.style.display = 'none';
    
    // Hide the demo section
    document.getElementById('demo').style.display = 'none';

    // Hide the intro text and statistics button
    document.getElementById('intro-text').style.display = 'none';
    document.querySelector('.stat-button').style.display = 'none';
}

function showGeoParquetMap() { 
    hideAllMaps(); // Ensure all other maps are hidden
    document.getElementById('intro').style.display = 'none';
    document.getElementById('comparison').style.display = 'none';

    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = '<iframe src="map_from_geoparquet.html" width="100%" height="500px" frameborder="0"></iframe>';

    const secondaryMap = document.getElementById('map-secondary');
    secondaryMap.innerHTML = '<iframe src="map_visualization_from_url.html" width="100%" height="500px" frameborder="0"></iframe>';
    secondaryMap.style.display = 'block'; // Ensure the second map is visible

    document.getElementById('format-description').innerText = 'Visualisation du fichier GeoParquet.';
    document.getElementById('demo').style.display = 'block'; 
}
function showGeoJsonMap() {
    hideAllMaps(); // Ensure all other maps are hidden
    // Hide other sections
    document.getElementById('intro').style.display = 'none';
    document.getElementById('comparison').style.display = 'none';

    // Get the map container and update it to display the GeoJSON map
    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = '<iframe src="map_with_geojson.html" width="100%" height="500px" frameborder="0"></iframe>';

    const secondaryMap = document.getElementById('map-secondary');
    secondaryMap.innerHTML = '<iframe src="geojsonmap.html" width="100%" height="500px" frameborder="0"></iframe>';
    secondaryMap.style.display = 'block'; // Ensure the second map is visible

    // Update the format description
    document.getElementById('format-description').innerText = 'Visualisation du fichier GeoJSON.';

    // Show the demo section
    document.getElementById('demo').style.display = 'block';
}
function showCOGMap() {
    hideAllMaps(); // Ensure all other maps are hidden
    document.getElementById('intro').style.display = 'none';
    document.getElementById('comparison').style.display = 'none';

    const mapContainer = document.getElementById('map');

    // Dynamically load the GeoTIFF
    const urlToGeoTIFF = "https://georaster-layer-for-leaflet.s3.amazonaws.com/Blue-Earth-Bathymetry-COG.tif";
    
    const moroccoBounds = [[21.327070, -17.102749], [36.055509, -0.996583]]; // Define Morocco's bounds
    
    parseGeoraster(urlToGeoTIFF).then(georaster => {
        const layer = new GeoRasterLayer({
            attribution: "GeoTIFF Example",
            georaster,
            resolution: 128
        });
        
        // Initialize the map
        const map = L.map('map', {
            maxBounds: moroccoBounds, // Restrict the view to Morocco
            maxBoundsViscosity: 1.0 // Ensure the map view stays within the bounds
        }).setView([31.7917, -7.0926], 6); // Center the map on Morocco
        
        // Add a tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
        
        // Add the GeoTIFF layer
        layer.addTo(map);
    
        // Fit the GeoTIFF layer to its bounds (if necessary)
        const layerBounds = layer.getBounds();
        map.fitBounds(layerBounds);
    
        // Optionally, adjust the bounds to Morocco if the GeoTIFF extends beyond it
        if (!L.latLngBounds(moroccoBounds).contains(layerBounds)) {
            map.fitBounds(moroccoBounds); // Use Morocco's bounds if necessary
        }
    }).catch(error => console.error("Error loading GeoTIFF:", error));
    

    // Second map setup (with the GeoTIFF)
    const secondaryMap = document.getElementById('map-secondary');
    secondaryMap.innerHTML = '<iframe src="morocco_cog_visualization.html" width="100%" height="500px" frameborder="0"></iframe>';
    secondaryMap.style.display = 'block'; // Ensure the second map is visible


    // Set description
    document.getElementById('format-description').innerText = 'Visualisation des fichiers COG.';

    // Show demo section
    document.getElementById('demo').style.display = 'block';
}
function showDemo() {
    hideAllMaps(); // Ensure all other maps are hidden
    // Hide other sections
    document.getElementById('intro').style.display = 'none';
    document.getElementById('comparison').style.display = 'none';

    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = '<iframe src="carte_temperature.html" width="100%" height="500px" frameborder="0"></iframe>';

    // Update the format description
    document.getElementById('format-description').innerText = 'Visualisation du fichier Zarr.';

    // Show the demo section
    document.getElementById('demo').style.display = 'block';
}
function showStats() {
    const comparisonBody = document.getElementById("comparison-table-body");
    comparisonBody.innerHTML = "";

    Object.entries(formatInfo).forEach(([format, data]) => {
        const row = document.createElement("tr");

        const formatCell = document.createElement("td");
        formatCell.textContent = format.toUpperCase();
        row.appendChild(formatCell);

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = data.description;
        row.appendChild(descriptionCell);

        const benefitsCell = document.createElement("td");
        benefitsCell.textContent = data.benefits.join(", ");
        row.appendChild(benefitsCell);
        
        const storageCell = document.createElement("td");
        storageCell.textContent = `${data.storageSize} `;
        row.appendChild(storageCell);
        
        comparisonBody.appendChild(row);
    });

    document.getElementById('intro').style.display = 'none';
    document.getElementById('demo').style.display = 'none';
    document.getElementById('comparison').style.display = 'block';

    createChart();
}
function createChart() {
    const ctx = document.getElementById('comparison-chart').getContext('2d');

    // Specify the two formats you want to compare
    const formatA = 'geojson';  // Replace with the actual key of the first format
    const formatB = 'geoparquet';  // Replace with the actual key of the second format

    // Get the storage size for the two formats
    const data = {
        labels: [formatA, formatB], // Only two labels for comparison
        datasets: [{
            label: 'Taille de Fichier (KB)',
            data: [
                formatInfo[formatA].storageSize, 
                formatInfo[formatB].storageSize
            ],
            backgroundColor: ['#d4a090', '#c08a78'], // Different colors for the bars
        }]
    };

    // Create the bar chart
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Taille de Fichier (KB)'
                    }
                }
            }
        }
    });
}

function goBack() {
    document.getElementById('intro').style.display = 'flex';
    document.getElementById('demo').style.display = 'none';
    document.getElementById('comparison').style.display = 'none';

    // Show the intro text and statistics button
    document.getElementById('intro-text').style.display = 'block';
    document.querySelector('.stat-button').style.display = 'inline-block';
}
