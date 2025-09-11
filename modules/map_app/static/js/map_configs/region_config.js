
// Set up the #region-col-selection and #region-row-selection interface elements
function setupMinMaxSliders(parentDivId) {
    // Create the min and max sliders and their labels
    // then return the created elements
    const parentDiv = document.getElementById(parentDivId);

    // Create min label
    const minLabel = document.createElement("label");
    minLabel.for = `${parentDivId}-min`;
    minLabel.innerText = "Min:";
    minLabel.style.width = "40px"; // fixed width for alignment

    // Create min slider
    const minSlider = document.createElement("input");
    minSlider.type = "range";
    minSlider.id = `${parentDivId}-min`;
    minSlider.name = `${parentDivId}-min`;
    minSlider.step = "1";
    // leave the sliders unconfigured for now

    const minSliderCurrentValue = document.createElement("span");
    minSliderCurrentValue.id = `${parentDivId}-min-current-value`;
    minSliderCurrentValue.style.width = "30px";
    minSliderCurrentValue.innerText = "";

    const minSliderSetValue = document.createElement("span");
    minSliderSetValue.id = `${parentDivId}-min-set-value`;
    minSliderSetValue.style.width = "30px";
    minSliderSetValue.innerText = "";

    

    

    // Create min container div for horizontal arrangement
    const minContainer = document.createElement("div");
    minContainer.style.display = "flex";
    minContainer.style.alignItems = "center";
    minContainer.style.gap = "10px"; // space between label and slider
    minContainer.appendChild(minLabel);
    minContainer.appendChild(minSlider);
    minContainer.appendChild(minSliderCurrentValue);
    minContainer.appendChild(minSliderSetValue);

    parentDiv.appendChild(minContainer);

    // Create max label
    const maxLabel = document.createElement("label");
    maxLabel.for = `${parentDivId}-max`;
    maxLabel.innerText = "Max:";
    maxLabel.style.width = "40px"; // fixed width for alignment

    // Create max slider
    const maxSlider = document.createElement("input");
    maxSlider.type = "range";
    maxSlider.id = `${parentDivId}-max`;
    maxSlider.name = `${parentDivId}-max`;
    maxSlider.step = "1";
    // leave the sliders unconfigured for now

    const maxSliderCurrentValue = document.createElement("span");
    maxSliderCurrentValue.id = `${parentDivId}-max-current-value`;
    maxSliderCurrentValue.style.width = "30px";
    maxSliderCurrentValue.innerText = "";

    const maxSliderSetValue = document.createElement("span");
    maxSliderSetValue.id = `${parentDivId}-max-set-value`;
    maxSliderSetValue.style.width = "30px";
    maxSliderSetValue.innerText = "";

    // Functions to modify the behavior of the sliders

    const minValueSelector = (targetValue) => {
        if (targetValue < parseInt(minSlider.min)) {
            targetValue = parseInt(minSlider.min);
        }
        if (targetValue >= parseInt(maxSlider.value)) {
            targetValue = parseInt(maxSlider.value) - 1;
        }
        minSlider.value = targetValue;
        minSliderCurrentValue.innerText = targetValue;
    } // Logic for limiting the selected value, can be used externally if needed

    const maxValueSelector = (targetValue) => {
        if (targetValue > parseInt(maxSlider.max)) {
            targetValue = parseInt(maxSlider.max);
        }
        if (targetValue <= parseInt(minSlider.value)) {
            targetValue = parseInt(minSlider.value) + 1;
        }
        maxSlider.value = targetValue;
        maxSliderCurrentValue.innerText = targetValue;
    } // Logic for limiting the selected value, can be used externally if needed

    const minValueSetter = () => {
        minSliderSetValue.innerText = minSlider.value;
    }; // To be returned and used externally with the "Set Region" button

    const minValueSetterExternal = (value) => {
        minValueSelector(value);
        minValueSetter();
    }; // To be used when resuming a session or otherwise externally

    const maxValueSetter = () => {
        maxSliderSetValue.innerText = maxSlider.value;
    }; // To be returned and used externally with the "Set Region" button

    const maxValueSetterExternal = (value) => {
        maxValueSelector(value);
        maxValueSetter();
    }; // To be used when resuming a session or otherwise externally

    // Configure the input listeners
    minSlider.addEventListener("input", (event) => {
        minValueSelector(event.target.value);
    });
    maxSlider.addEventListener("input", (event) => {
        maxValueSelector(event.target.value);
    });
    // Create max container div for horizontal arrangement
    const maxContainer = document.createElement("div");
    maxContainer.style.display = "flex";
    maxContainer.style.alignItems = "center";
    maxContainer.style.gap = "10px"; // space between label and slider
    maxContainer.appendChild(maxLabel);
    maxContainer.appendChild(maxSlider);
    maxContainer.appendChild(maxSliderCurrentValue);
    maxContainer.appendChild(maxSliderSetValue);

    parentDiv.appendChild(maxContainer);

    return {
        minSlider,
        minSliderCurrentValue,
        minSliderSetValue,
        minValueSelector,
        minValueSetter,
        minValueSetterExternal,
        maxSlider,
        maxSliderCurrentValue,
        maxSliderSetValue,
        maxValueSelector,
        maxValueSetter,
        maxValueSetterExternal,
    };
}

const rowElements = setupMinMaxSliders("region-row-selection");
const colElements = setupMinMaxSliders("region-col-selection");


function updateSetValues() {
    rowElements.minValueSetter();
    rowElements.maxValueSetter();
    colElements.minValueSetter();
    colElements.maxValueSetter();
}

function getSelectedRegion() {
    return {
        rowMin: parseInt(rowElements.minSliderSetValue.innerText),
        rowMax: parseInt(rowElements.maxSliderSetValue.innerText),
        colMin: parseInt(colElements.minSliderSetValue.innerText),
        colMax: parseInt(colElements.maxSliderSetValue.innerText),
    };
}


// Store the target region bounds globally for access when fetching data
var targetRegionBounds = { rowMin: null, rowMax: null, colMin: null, colMax: null };
// Store the properties of the region sliders for use when they change due to other actions
var regionProperties = {
    minimumRow: null,
    maximumRow: null,
    stepRow: 1,
    minimumCol: null,
    maximumCol: null,
    stepCol: 1,
}

function sendSelectedRegion() {
    const region = getSelectedRegion();
    var send_object = { ...region};
    // Include the region slider properties as well
    send_object["regionRowMin"] = regionProperties.minimumRow;
    send_object["regionRowMax"] = regionProperties.maximumRow;
    send_object["regionColMin"] = regionProperties.minimumCol;
    send_object["regionColMax"] = regionProperties.maximumCol;
    console.log("Sending selected region to server:", send_object);
    fetch('/set_region_bounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(region),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Region bounds sent to server:', region);
            console.log('Server response:', data);
        })
        .catch(error => {
            console.error('Error sending region bounds to server:', error);
        }
    );
}


function setSliderProperties(sliderElements, min, max, step) {
    // Set the slider properties
    sliderElements.minSlider.min = min;
    sliderElements.minSlider.max = max;
    sliderElements.minSlider.step = step;
    sliderElements.maxSlider.min = min;
    sliderElements.maxSlider.max = max;
    sliderElements.maxSlider.step = step;
    // If there are existing values, we will want to shift them to the nearest step
    const currentMin = sliderElements.minSliderSetValue.innerText;
    const currentMax = sliderElements.maxSliderSetValue.innerText;
    // Adjust existing values to be within new min/max and aligned to step
    if (currentMin != "") {
        console.log("Current min value:", currentMin);
        let currentMinValue = parseInt(currentMin);
        if (currentMinValue < min) {
            sliderElements.minSlider.value = min;
        } else if (currentMinValue > max) {
            sliderElements.minSlider.value = max;
        } else {
            let roundedMin = Math.round((currentMinValue - min) / step) * step + min;
            sliderElements.minSlider.value = roundedMin;
        }
    } else {
        console.log("No current min value, setting to min:", min);
        sliderElements.minSlider.value = min;
    }
    if (currentMax != "") {
        console.log("Current max value:", currentMax);
        let currentMaxValue = parseInt(currentMax);
        if (currentMaxValue < min) {
            sliderElements.maxSlider.value = min;
        } else if (currentMaxValue > max) {
            sliderElements.maxSlider.value = max;
        } else {
            let roundedMax = Math.round((currentMaxValue - min) / step) * step + min;
            sliderElements.maxSlider.value = roundedMax;
        }
    } else {
        console.log("No current max value, setting to max:", max);
        sliderElements.maxSlider.value = max;
    }
    

    // Update the displayed current and set values
    sliderElements.minSliderCurrentValue.innerText = sliderElements.minSlider.value;
    sliderElements.minSliderSetValue.innerText = sliderElements.minSlider.value;
    sliderElements.maxSliderCurrentValue.innerText = sliderElements.maxSlider.value;
    sliderElements.maxSliderSetValue.innerText = sliderElements.maxSlider.value;
}

var setRegionCallbacks = [];
function callSetRegion() {
    setRegionCallbacks.forEach((callback) => {
        callback();
    });
}

function externalSetRegionBounds(rowMin, rowMax, colMin, colMax, rowStep, colStep) {
    // Force steps to be 16 always
    // rowStep = 16;
    // colStep = 16;
    console.log("Externally setting region sliders to:", { rowMin, rowMax, colMin, colMax, rowStep, colStep });
    setSliderProperties(rowElements, rowMin, rowMax, rowStep);
    setSliderProperties(colElements, colMin, colMax, colStep);
    // Update the regionProperties object
    regionProperties.minimumRow = rowMin;
    regionProperties.maximumRow = rowMax;
    regionProperties.stepRow = rowStep;
    regionProperties.minimumCol = colMin;
    regionProperties.maximumCol = colMax;
    regionProperties.stepCol = colStep;
    // Update the targetRegionBounds to match the new slider values
    targetRegionBounds = getSelectedRegion();
    callSetRegion();
    console.log("Region sliders externally set. Target region bounds now:", targetRegionBounds);
}

function externalSetRegionValues(rowMin, rowMax, colMin, colMax) {
    console.log("Externally setting region slider values to:", { rowMin, rowMax, colMin, colMax });
    // Adjust the values and setValues to the provided values
    rowElements.minValueSetterExternal(rowMin);
    rowElements.maxValueSetterExternal(rowMax);
    colElements.minValueSetterExternal(colMin);
    colElements.maxValueSetterExternal(colMax);
    targetRegionBounds = getSelectedRegion();
    console.log("Region slider values externally set. Target region bounds now:", targetRegionBounds);
}



// When the "Set Region" button is clicked, we update the targetRegionBounds
document.getElementById("set-region").addEventListener("click", () => {
    updateSetValues();
    targetRegionBounds = getSelectedRegion();
    callSetRegion();
    sendSelectedRegion();
    console.log("Target region bounds set to:", targetRegionBounds);
});

externalSetRegionBounds(
    0, 3840,
    0, 4608,
    16, 16
)
// colElements.minValueSetterExternal(1952);
// colElements.maxValueSetterExternal(2416);
// rowElements.minValueSetterExternal(656);
// rowElements.maxValueSetterExternal(1264);
externalSetRegionValues(656, 1264, 1952, 2416);
// on load, send the initial region to the server
map.on('load', () => {
    sendSelectedRegion();
});