// Initialize the map
const map = new maplibregl.Map({
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [13.388, 52.517],
    zoom: 2,
    container: 'map',
});

// Disable map rotation using right click + drag
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

fillLocationData("initial");

// Auto-refresh data every 5 secodns
setInterval('autoRefresh()', 5000);

// FUNCTIONS

function autoRefresh() {
    fillLocationData("update");
}

function fillLocationData(loadType)
{
    // Load the energy data from the backend API
fetch('https://app.nocodb.com/api/v2/tables/m2zl15jsfkzxfrz/records', {
    method: 'GET',
    headers: {
        'xc-token': '4nyQ6gxB1B7yiVF0fHykBEUxhPA2WZCOmeM0WhHw',
        'Content-Type': 'application/json'
    },
    mode: 'cors'
})
.then(response => response.json())
.then(data => {
    console.log('Fetched data:', data);
    
    locations = data.list

    // Loop through locations to create markers and list items
    for (let i = 0; i < locations.length; i++) {
        const locationData = locations[i];
        console.log('Processing location:', locationData);

        const coords = getCoordinates(locationData.Title);
        if (!coords) {
            console.warn(`Coordinates not found for city: ${locationData.Title}`);
            continue;
        }

        // Add marker to the map with energy details
        const marker = new maplibregl.Marker({
            color: getMarkerColor(locationData.AvailableEnergy, locationData.RequiredEnergy)
        })
        .setLngLat(coords)
        .setPopup(new maplibregl.Popup({ offset: 25 })
            .setText(`Available: ${locationData.AvailableEnergy} kWh, Required: ${locationData.RequiredEnergy} kWh, CO2 Emissions: ${locationData.CarbonEmissions} g/kWh, Light Index: ${locationData.LightIndex}`))
        .addTo(map);

        // Add the list item with zoom feature on click
        if (loadType == "initial") {
            addEnergyItem(locationData, coords);
        }
        else {
            updateEnergyItem(locationData, coords);
        }
        
    }
})
.catch(error => console.error('Error fetching data:', error));
}

// Helper function for city coordinates
function getCoordinates(city) {
    const coordinates = {
        'Frankfurt': [8.6821, 50.1109],
        'Ohio': [-82.9988, 39.9612],
        'Canada': [-79.3470, 43.6510],
        'Ireland': [-6.2603, 53.3498],
        'Cologne': [6.9603, 50.9375],
        'Casablanca': [-7.5898, 33.5731]
    };
    return coordinates[city];
}

// Determine marker color based on energy surplus or shortage
function getMarkerColor(availableEnergy, requiredEnergy) {
    const difference = availableEnergy - requiredEnergy;
    if (difference > 50) return 'green';
    else if (difference < 0) return 'red';
    return 'grey';
}

// Create list item with zoom-in functionality
function addEnergyItem(locationData, coords) {
    const listContainer = document.getElementById('list-container');
    const energyItem = document.createElement('div');
    energyItem.id = locationData.Title + "_card"
    energyItem.className = 'weather-item';

    // Populate the list item with city and energy info
    energyItem.innerHTML = `
        <strong>${locationData.Title}</strong><br>
        Available Energy: ${locationData.AvailableEnergy} kWh<br>
        Required Energy: ${locationData.RequiredEnergy} kWh<br>
        CO2 Emissions: ${locationData.CarbonEmissions} g/kWh<br>
        Light Index: ${locationData.LightIndex}%
    `;

    // Add a click event to fly to the city location on the map
    energyItem.addEventListener('click', () => {
        console.log(`Zooming into ${locationData.Title} at ${coords}`);
        map.flyTo({ center: coords, zoom: 10, essential: true });
    });

    listContainer.appendChild(energyItem);
}

// Update list item with zoom-in functionality
function updateEnergyItem(locationData, coords) {
    const listContainer = document.getElementById('list-container');
    const energyItem = document.getElementById(locationData.Title + '_card');
    energyItem.className = 'weather-item';

    // Populate the list item with city and energy info
    energyItem.innerHTML = `
        <strong>${locationData.Title}</strong><br>
        Available Energy: ${locationData.AvailableEnergy} kWh<br>
        Required Energy: ${locationData.RequiredEnergy} kWh<br>
        CO2 Emissions: ${locationData.CarbonEmissions} g/kWh<br>
        Light Index: ${locationData.LightIndex}%
    `;

    // Add a click event to fly to the city location on the map
    energyItem.addEventListener('click', () => {
        console.log(`Zooming into ${locationData.Title} at ${coords}`);
        map.flyTo({ center: coords, zoom: 10, essential: true });
    });

    listContainer.appendChild(energyItem);
}
