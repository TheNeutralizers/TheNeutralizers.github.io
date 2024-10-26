// Initialize the map
const map = new maplibregl.Map({
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [13.388, 52.517],
    zoom: 2,
    container: 'map',
});

// Array to store markers for easy removal during data refresh
let markers = [];

// Show loading overlay
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// Fetch data and update map and list
function fetchDataAndUpdate() {
    showLoading();  // Show loading overlay before fetching data

    fetch('https://app.nocodb.com/api/v2/tables/m2zl15jsfkzxfrz/records', {
        method: 'GET',
        headers: {
            'xc-token': 'YOUR_API_TOKEN', // Replace with your actual token
            'Content-Type': 'application/json'
        },
        mode: 'cors'
    })
    .then(response => response.json())
    .then(data => {
        const locations = data.list || data.records || data;
        if (!locations || locations.length === 0) {
            console.warn('No data found or incorrect data structure.');
            return;
        }
        
        clearMarkersAndList();  // Clear previous markers and list items

        for (let location of locations) {
            const coords = getCoordinates(location.Title);
            if (!coords) {
                console.warn(`Coordinates not found for city: ${location.Title}`);
                continue;
            }

            const marker = new maplibregl.Marker({
                color: getMarkerColor(location.AvailableEnergy, location.RequiredEnergy)
            })
            .setLngLat(coords)
            .setPopup(new maplibregl.Popup({ offset: 25 })
                .setText(`Available: ${location.AvailableEnergy} kWh, Required: ${location.RequiredEnergy} kWh, Renewable: ${location.RenewableEnergy}%, CO2 Emissions: ${location.CarbonEmissions} g/kWh, Light Index: ${location.LightIndex}%`))
            .addTo(map);

            markers.push(marker);

            addEnergyItem(location, coords);  // Add the list item
        }
    })
    .catch(error => console.error('Error fetching data:', error))
    .finally(() => hideLoading());  // Hide loading overlay after data loads
}

// Rest of the helper functions (getCoordinates, getMarkerColor, addEnergyItem, etc.) here

// Initial data fetch
fetchDataAndUpdate();

// Refresh data every 5 minutes
setInterval(fetchDataAndUpdate, 300000);
    