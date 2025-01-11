// Define streetmap and darkmap layers
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 10,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
});

// Create the map
var myMap = L.map("map", {
  center: [37.09, -97.71],
  zoom: 5,
});

streetmap.addTo(myMap);

// Define the API endpoint
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryUrl).then(function(data) {

  // Define functions for style, color, and radius
  function mapStyle(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: mapColor(feature.properties.mag),
      color: "#000000",
      radius: mapRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  function mapColor(mag) {
    const colors = ["#2c99ea", "#2ceabf", "#92ea2c", "#d5ea2c", "#eaa92c", "#ea2c2c"];
    return mag > 5 ? colors[5] :
           mag > 4 ? colors[4] :
           mag > 3 ? colors[3] :
           mag > 2 ? colors[2] :
           mag > 1 ? colors[1] :
                     colors[0];
  }

  function mapRadius(mag) {
    return mag === 0 ? 1 : mag * 4;
  }

  // Use MarkerClusterGroup for clustering
  var markers = L.markerClusterGroup();

  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: mapStyle,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<strong>Magnitude:</strong> " + feature.properties.mag +
                      "<br><strong>Location:</strong> " + feature.properties.place);
    }
  }).addTo(markers);

  myMap.addLayer(markers);

  // Add a legend
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var grades = [0, 1, 2, 3, 4, 5];
    var colors = ["#2c99ea", "#2ceabf", "#92ea2c", "#d5ea2c", "#eaa92c", "#ea2c2c"];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  legend.addTo(myMap);
});
