var colorDict = {
  selectedCatOutline: getComputedStyle(document.documentElement).getPropertyValue('--selected-cat-outline'),
  selectedCatFill: getComputedStyle(document.documentElement).getPropertyValue('--selected-cat-fill'),
  upstreamCatOutline: getComputedStyle(document.documentElement).getPropertyValue('--upstream-cat-outline'),
  upstreamCatFill: getComputedStyle(document.documentElement).getPropertyValue('--upstream-cat-fill'),
  flowlineToCatOutline: getComputedStyle(document.documentElement).getPropertyValue('--flowline-to-cat-outline'),
  flowlineToNexusOutline: getComputedStyle(document.documentElement).getPropertyValue('--flowline-to-nexus-outline'),
  nexusOutline: getComputedStyle(document.documentElement).getPropertyValue('--nexus-outline'),
  nexusFill: getComputedStyle(document.documentElement).getPropertyValue('--nexus-fill'),
  clearFill: getComputedStyle(document.documentElement).getPropertyValue('--clear-fill')
};

// // A function that creates a cli command from the interface
// function create_cli_command() {
//   const cliPrefix = document.getElementById("cli-prefix");
//   cliPrefix.style.opacity = 1;
//   var selected_basins = $("#selected-basins").text();
//   var start_time = document.getElementById("start-time").value.split("T")[0];
//   var end_time = document.getElementById("end-time").value.split("T")[0];
//   var command = `-i ${selected_basins} --subset --start ${start_time} --end ${end_time} --forcings --realization --run`;
//   var command_all = `-i ${selected_basins} --start ${start_time} --end ${end_time} --all`;
//   if (selected_basins != "None - get clicking!") {
//     $("#cli-command").text(command);
//   }
// }

// function updateCommandPrefix() {
//   const toggleInput = document.getElementById("runcmd-toggle");
//   const cliPrefix = document.getElementById("cli-prefix");
//   const uvxText = "uvx --from ngiab_data_preprocess cli";
//   const pythonText = "python -m ngiab_data_cli";
//   // Set initial handle text based on the default state using data attribute
//   cliPrefix.textContent = toggleInput.checked ? pythonText : uvxText;
// }
// document.getElementById("runcmd-toggle").addEventListener('change', updateCommandPrefix);

// // These functions are exported by data_processing.js
// document.getElementById('map').addEventListener('click', create_cli_command);
// document.getElementById('start-time').addEventListener('change', create_cli_command);
// document.getElementById('end-time').addEventListener('change', create_cli_command);


// add the PMTiles plugin to the maplibregl global.
let protocol = new pmtiles.Protocol({ metadata: true });
maplibregl.addProtocol("pmtiles", protocol.tile);

// select light-style if the browser is in light mode
// select dark-style if the browser is in dark mode
var style = 'https://communityhydrofabric.s3.us-east-1.amazonaws.com/map/styles/light-style.json';
var colorScheme = "light";
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  style = 'https://communityhydrofabric.s3.us-east-1.amazonaws.com/map/styles/dark-style.json';
  colorScheme = "dark";
}
var map = new maplibregl.Map({
  container: "map", // container id
  style: style, // style URL
  center: [-96, 40], // starting position [lng, lat]
  zoom: 4, // starting zoom
});

map.on("load", () => {
  map.addSource("camels_basins", {
    type: "vector",
    url: "pmtiles://https://communityhydrofabric.s3.us-east-1.amazonaws.com/map/camels.pmtiles",
  });
  map.addLayer({
    id: "camels",
    type: "line",
    source: "camels_basins",
    "source-layer": "camels_basins",
    layout: {},
    filter: ["any", ["==", "hru_id", ""]],
    paint: {
      "line-width": 1.5,
      "line-color": ["rgba", 134, 30, 232, 1],
    },
  });
});

if (colorScheme == "light") {
  nwm_paint = {
    "line-width": 1,
    "line-color": ["rgba", 0, 0, 0, 1],
  };
  aorc_paint = {
    "line-width": 1,
    "line-color": ["rgba", 71, 58, 222, 1],
  };
}
if (colorScheme == "dark") {
  nwm_paint = {
    "line-width": 1,
    "line-color": ["rgba", 255, 255, 255, 1],
  };
  aorc_paint = {
    "line-width": 1,
    "line-color": ["rgba", 242, 252, 126, 1],
  };
}


map.on("load", () => {
  map.addSource("nwm_zarr_chunks", {
    type: "vector",
    url: "pmtiles://https://communityhydrofabric.s3.us-east-1.amazonaws.com/map/forcing_chunks/nwm_retro_v3_zarr_chunks.pmtiles",
  });
  map.addSource("aorc_zarr_chunks", {
    type: "vector",
    url: "pmtiles://https://communityhydrofabric.s3.us-east-1.amazonaws.com/map/forcing_chunks/aorc_zarr_chunks.pmtiles",
  });
  map.addLayer({
    id: "nwm_zarr_chunks",
    type: "line",
    source: "nwm_zarr_chunks",
    "source-layer": "nwm_zarr_chunks",
    layout: {},
    filter: ["any"],
    paint: nwm_paint,
  });
  map.addLayer({
    id: "aorc_zarr_chunks",
    type: "line",
    source: "aorc_zarr_chunks",
    "source-layer": "aorc_zarr_chunks",
    layout: {},
    filter: ["any"],
    paint: aorc_paint,
  });
});

function update_map(cat_id, e) {
  $('#selected-basins').text(cat_id)
  map.setFilter('selected-catchments', ['any', ['in', 'divide_id', cat_id]]);
  map.setFilter('upstream-catchments', ['any', ['in', 'divide_id', ""]])
  fetch('/get_upstream_catids', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cat_id),
  })
    .then(response => response.json())
    .then(data => {
      map.setFilter('upstream-catchments', ['any', ['in', 'divide_id', ...data]]);
      if (data.length === 0) {
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML('No upstreams')
          .addTo(map);
      }
    });
}
map.on('click', 'catchments', (e) => {
  cat_id = e.features[0].properties.divide_id;
  update_map(cat_id, e);
});

// Create a popup, but don't add it to the map yet.
const popup = new maplibregl.Popup({
  closeButton: false,
  closeOnClick: false
});

map.on('mouseenter', 'conus_gages', (e) => {
  // Change the cursor style as a UI indicator.
  map.getCanvas().style.cursor = 'pointer';

  const coordinates = e.features[0].geometry.coordinates.slice();
  const description = e.features[0].properties.hl_uri + "<br> click for more info";

  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  // Populate the popup and set its coordinates
  // based on the feature found.
  popup.setLngLat(coordinates).setHTML(description).addTo(map);
});

map.on("mouseleave", "conus_gages", () => {
  map.getCanvas().style.cursor = "";
  popup.remove();
});

map.on("click", "conus_gages", (e) => {
  //  https://waterdata.usgs.gov/monitoring-location/02465000
  window.open(
    "https://waterdata.usgs.gov/monitoring-location/" +
    e.features[0].properties.hl_link,
    "_blank",
  );
});
show = false;

// TOGGLE BUTTON LOGIC
function initializeToggleSwitches() {
  // Find all toggle switches
  const toggleSwitches = document.querySelectorAll(".toggle-switch");
  // Process each toggle switch
  toggleSwitches.forEach((toggleSwitch) => {
    const toggleInput = toggleSwitch.querySelector(".toggle-input");
    const toggleHandle = toggleSwitch.querySelector(".toggle-handle");
    const leftText =
      toggleSwitch.querySelector(".toggle-text-left").textContent;
    const rightText =
      toggleSwitch.querySelector(".toggle-text-right").textContent;
    // Set initial handle text based on the default state using data attribute
    toggleHandle.textContent = toggleInput.checked ? rightText : leftText;
    // Add event listener
    toggleInput.addEventListener("change", function () {
      setTimeout(() => {
        if (this.checked) {
          toggleHandle.textContent = rightText;
        } else {
          toggleHandle.textContent = leftText;
        }
      }, 180);
    });
  });
}
document.addEventListener("DOMContentLoaded", initializeToggleSwitches);

showGages = false;
const toggleButtonGages = document.querySelector("#toggle-button-gages");
toggleButtonGages.addEventListener("click", () => {
  if (showGages) {
    map.setFilter("conus_gages", ["any", ["==", "hl_uri", ""]]);
    toggleButtonGages.innerText = "Show gages";
    showGages = false;
  } else {
    map.setFilter("conus_gages", null);
    toggleButtonGages.innerText = "Hide gages";
    showGages = true;
  }
});

showCamels = false;
const toggleButtonCamels = document.querySelector("#toggle-button-camels");
toggleButtonCamels.addEventListener("click", () => {
  if (showCamels) {
    map.setFilter("camels", ["any", ["==", "hru_id", ""]]);
    toggleButtonCamels.innerText = "Show CAMELS basins";
    showCamels = false;
  } else {
    map.setFilter("camels", null);
    toggleButtonCamels.innerText = "Hide CAMELS basins";
    showCamels = true;
  }
});

showNwm = false;
const toggleButtonNwm = document.querySelector("#toggle-button-nwm");
toggleButtonNwm.addEventListener("click", () => {
  if (showNwm) {
    map.setFilter("nwm_zarr_chunks", ["any"]);
    toggleButtonNwm.innerText = "Overlay NWM chunks";
    showNwm = false;
  } else {
    map.setFilter("nwm_zarr_chunks", null);
    toggleButtonNwm.innerText = "Hide NWM chunks";
    showNwm = true;
  }
});

showAorc = false;
const toggleButtonAorc = document.querySelector("#toggle-button-aorc");
toggleButtonAorc.addEventListener("click", () => {
  if (showAorc) {
    map.setFilter("aorc_zarr_chunks", ["any"]);
    toggleButtonAorc.innerText = "Overlay AORC chunks";
    showAorc = false;
  } else {
    map.setFilter("aorc_zarr_chunks", null);
    toggleButtonAorc.innerText = "Hide AORC chunks";
    showAorc = true;
  }
});


// Set up the map overlay for forecasted precipitation
// We don't have a tilemap ready for this, so we need to create the geometries ourselves

map.on("load", () => {
  map.addSource("forecasted_precip", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });

  map.addLayer({
    id: "forecasted_precip_layer",
    type: "fill",
    source: "forecasted_precip",
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": 0.5
    }
  });
});

showForecastedPrecip = false
const toggleButtonForecastedPrecip = document.querySelector("#toggle-button-forecast");
toggleButtonForecastedPrecip.addEventListener("click", () => {
  if (showForecastedPrecip) {
    map.setFilter("forecasted_precip_layer", ["==", "color", ""]);
    toggleButtonForecastedPrecip.innerText = "Show forecasted precipitation";
    showForecastedPrecip = false;
  } else {
    map.setFilter("forecasted_precip_layer", null);
    toggleButtonForecastedPrecip.innerText = "Hide forecasted precipitation";
    showForecastedPrecip = true;
  }
});

// Function to update the forecasted precipitation overlay with received data
function updateForecastLayer(data) {
  // Data is an object of precipitation values keyed by a composite string of "x,y"
  const minValue = Math.min(...Object.values(data));
  const maxValue = Math.max(...Object.values(data));
  const color = (value) => {
    // Map the value to a color based on a gradient
    const ratio = (value - minValue) / (maxValue - minValue);
    const r = Math.floor(255 * (1 - ratio));
    const g = Math.floor(255 * ratio);
    return `rgba(${r}, ${g}, 0, 1)`; // Green to red gradient
  }
  const features = Object.entries(data).map(([key, value]) => {
    const [x, y] = key.split(',').map(Number);
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [x, y]
      },
      properties: {
        color: color(value),
        value: value
      }
    };
  });
  // Update the source data
  map.getSource("forecasted_precip").setData({
    type: "FeatureCollection",
    features: features
  });
}

// Accessing forecasted forcing data

function updateForecastedPrecipOverlay() {
  fetch('/get_forecast_precip', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Forecasted precipitation data received:', data);
      // Update the map overlay with the received data
      updateForecastLayer(data);
    })
    .catch(error => {
      console.error('Error fetching forecasted precipitation data:', error);
    });
}




document.getElementById('set-time').addEventListener('click', function () {
  const targetTime = document.getElementById('target-time').value;
  const leadTime = document.getElementById('lead-time').value;
  const forecastCycle = document.getElementById('forecast-cycle').value;
  const prevTime = document.getElementById('selected-time').textContent;
  const prevLeadTime = document.getElementById('selected-lead-time').textContent;
  const prevForecastCycle = document.getElementById('selected-forecast-cycle').textContent
  var changed = false;
  // Check if any of the values have changed
  if (targetTime !== prevTime || leadTime !== prevLeadTime || forecastCycle !== prevForecastCycle) {
    changed = true;
  }
  if (changed) {
    document.getElementById('selected-time').textContent = targetTime;
    document.getElementById('selected-lead-time').textContent = leadTime;
    document.getElementById('selected-forecast-cycle').textContent = forecastCycle;

    // Need to send the time as YYYYMMDD, but input provides it as YYYY-MM-DDTHH:MM
    var formattedTime = targetTime.replace(/-/g, '');
    const Tindex = formattedTime.indexOf('T');
    if (Tindex !== -1) {
      formattedTime = formattedTime.substring(0, Tindex);
    }


    // Trigger the time change event
    fetch('/set_time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target_time: formattedTime,
        lead_time: leadTime,
        forecast_cycle: forecastCycle
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Time set successfully:', data);
      })
      .then(() => {
        // Fetch and update the forecasted precipitation data
        updateForecastedPrecipOverlay();
      })
      .catch(error => {
        console.error('Error setting time:', error);
      });
  }
});