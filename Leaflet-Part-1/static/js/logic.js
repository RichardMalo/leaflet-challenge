// Define a function to set the color of the circle based on the depth.
function depthColor(depth) {
  if (depth > 90) {
    return "Red";
  } else if (depth > 70) {
    return "DarkOrange";
  } else if (depth > 50) {
    return "Orange";
  } else if (depth > 30) {
    return "Yellow";
  } else if (depth > 10) {
    return "LightGreen";
  } else {
    return "Turquoise";
  }
};

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake, as well as its magnitude and depth.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
  };

  // Define a function to set the size of the circle based on the magnitude.
  function markerSize(magnitude) {
    return magnitude * 5;
  };

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: depthColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    }
  });

  // Send our earthquakes layer to the createMap function.
  createMap(earthquakes);
};

// Adding items to the tilelayer and create a basemap object.
function createMap(earthquakes) {
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
let myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 3,
  layers: [street, earthquakes]
});

// Create a layer control.
// Pass it our baseMaps and overlayMaps.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Create a legend control
let legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  let div = L.DomUtil.create("div", "info legend"),
    depths = [-10, 10, 30, 50, 70, 90],
    labels = [];
  
    // Add background color
  div.style.backgroundColor = "white"; 
  // Add border
  div.style.border = "5px solid black"; 

  // Depth legend
  // Define the legend HTML template
let legendTemplate = '<strong>Depth (km)</strong><br>';

// Loop through the depths array and add color squares and labels to the legend
for (var i = 0; i < depths.length; i++) {
  let color = depthColor(depths[i] + 1);
  let label = depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
  let colorSquare = `<i style="background:${color}; width: 10px; height: 10px; display: inline-block;"></i>`;
  legendTemplate += colorSquare + ' ' + label;
}

// Add the legend HTML to the div element
div.innerHTML += legendTemplate;

  return div;
};

// Add legend to the map
legend.addTo(myMap);
};