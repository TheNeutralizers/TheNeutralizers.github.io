// Initialize the map
const map = new maplibregl.Map({
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [13.388, 52.517],
    zoom: 2,
    container: 'map',
});

// Array to store markers for easy removal during data refresh
let markers = [];

// Function to fetch data and update the map and list
function fetchDataAndUpdate() {
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
        
        // Clear previous markers and list items
        clearMarkersAndList();

        // Loop through locations to create markers and list items
        for (let location of locations) {
            const coords = getCoordinates(location.Title);
            if (!coords) {
                console.warn(`Coordinates not found for city: ${location.Title}`);
                continue;
            }

            // Add marker to the map with energy details
            const marker = new maplibregl.Marker({
                color: getMarkerColor(location.AvailableEnergy, location.RequiredEnergy)
            })
            .setLngLat(coords)
            .setPopup(new maplibregl.Popup({ offset: 25 })
                .setText(`Available: ${location.AvailableEnergy} kWh, Required: ${location.RequiredEnergy} kWh, Renewable: ${location.RenewableEnergy}%, CO2 Emissions: ${location.CarbonEmissions} g/kWh, Light Index: ${location.LightIndex}%`))
            .addTo(map);

            markers.push(marker);

            // Add the list item with zoom feature on click
            addEnergyItem(location, coords);
        }
    })
    .catch(error => console.error('Error fetching data:', error));
}

// Helper function to clear markers and list items
function clearMarkersAndList() {
    markers.forEach(marker => marker.remove());
    markers = [];

    document.getElementById('list-container').innerHTML = '';
}

// Helper function for city coordinates
function getCoordinates(city) {
    const coordinates = {
        'Frankfurt': [8.6821, 50.1109],
        'Ohio': [-82.9988, 39.9612],
        'Canada': [-79.3470, 43.6510],
        'Ireland': [-6.2603, 53.3498],
        'Cologne': [6.9603, 50.9375]
    };
    return coordinates[city];
}

// Determine marker color based on energy surplus or shortage
function getMarkerColor(availableEnergy, requiredEnergy) {
    const difference = availableEnergy - requiredEnergy;
    return difference > 50 ? 'green' : difference < 0 ? 'red' : 'grey';
}

// Create list item with zoom-in functionality
function addEnergyItem(locationData, coords) {
    const listContainer = document.getElementById('list-container');
    const energyItem = document.createElement('div');
    energyItem.className = 'weather-item';

    energyItem.innerHTML = `
        <strong>${locationData.Title}</strong><br>
        Available Energy: ${locationData.AvailableEnergy} kWh<br>
        Required Energy: ${locationData.RequiredEnergy} kWh<br>
        Renewable Energy: ${locationData.RenewableEnergy}%<br>
        CO2 Emissions: ${locationData.CarbonEmissions} g/kWh<br>
        Light Index: ${locationData.LightIndex}%
    `;

    energyItem.addEventListener('click', () => {
        map.flyTo({ center: coords, zoom: 10, essential: true });
    });

    listContainer.appendChild(energyItem);
}

// Disable map rotation using right-click + drag
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

// Initial data fetch
fetchDataAndUpdate();

// Refresh data every 5 minutes
setInterval(fetchDataAndUpdate, 300000);
