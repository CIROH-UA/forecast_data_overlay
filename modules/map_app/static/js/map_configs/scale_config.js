// function updateYScale(value) {
//     const yScaleInput = document.getElementById('scale-y');
//     yScaleInput.value = value;
//     document.getElementById('scale-y-value').textContent = value;
// }
// function updateXScale(value) {
//     const xScaleInput = document.getElementById('scale-x');
//     xScaleInput.value = value;
//     document.getElementById('scale-x-value').textContent = value;
// }
// // document.getElementById('scale-axis-lock').addEventListener('change', function () {
// //     if (this.checked) {
// //         // If locking is enabled, set both to the max of the two
// //         const maxScale = Math.max(parseInt(document.getElementById('scale-x').value), parseInt(document.getElementById('scale-y').value));
// //         updateXScale(maxScale);
// //         updateYScale(maxScale);
// //     }
// // });
// document.getElementById('scale-axis-lock').addEventListener('change', function (event) {
//     if (event.target.checked) {
//         // If locking is enabled, set both to the max of the two
//         const maxScale = Math.max(parseInt(document.getElementById('scale-x').value), parseInt(document.getElementById('scale-y').value));
//         updateXScale(maxScale);
//         updateYScale(maxScale);
//     }
// });

// updateXScale(document.getElementById('scale-x').value);
// document.getElementById('scale-x').addEventListener('input', function () {
//     updateXScale(this.value);
//     if (document.getElementById('scale-axis-lock').checked) {
//         updateYScale(this.value);
//     }
// });

// updateYScale(document.getElementById('scale-y').value);
// document.getElementById('scale-y').addEventListener('input', function () {
//     updateYScale(this.value);
//     if (document.getElementById('scale-axis-lock').checked) {
//         updateXScale(this.value);
//     }
// });


// function setScaleLogic() {
//     // Get the temporary scale values from scale-y-value and scale-x-value spans
//     // Then we try to set the scale values server-side.
//     // If it succeeds, we try to update the map with the new scale values.
//     // If that succeeds, we update the scale values in the UI.
//     const scaleX = document.getElementById('scale-x-value').textContent;
//     const scaleY = document.getElementById('scale-y-value').textContent;
//     const oldScaleX = document.getElementById('set-scale-x-value').textContent;
//     const oldScaleY = document.getElementById('set-scale-y-value').textContent
//     // Check if the scale values have changed
//     // if (scaleX === oldScaleX && scaleY === oldScaleY) {
//     //     console.log('Scale values have not changed, skipping update.');
//     //     return; // No need to update if the values haven't changed
//     // }
//     console.log('Setting scale to:', scaleX, scaleY);
//     result = sendScaleValues(scaleX, scaleY);
//     // If the set-time values are set, we can try to update the forecasted precipitation overlay
//     return result; // Return the promise chain for further handling if needed
// }



// function sendScaleValues(scaleX, scaleY) {
//     // Takes scaleX and scaleY as strings, sends them to the server
//     // Returns a promise that resolves to the response from the server
//     // This allows us to have logic based on the success or failure of the request
//     local_cache["scaleX"] = scaleX;
//     local_cache["scaleY"] = scaleY;
//     document.getElementById('set-scale-x-value').textContent = scaleX;
//     document.getElementById('set-scale-y-value').textContent = scaleY;
//     console.log('Set local cache scaleX and scaleY to:', scaleX, scaleY);
//     return Promise.resolve(true); // Simulate a successful server response
// }


// // set-scale button logic
// document.getElementById('set-scale').addEventListener('click', setScaleLogic);


// Modify to use the new scale-config component
/**
 * @type {scale_config}
 */
const scaleConfigElement = document.getElementById('scale-config');
// Nearly all logic is now handled in components/scale_config_element.js
// Cache interaction is not handled in the component, so we still need to set that up here
// by preparing a callback for when the scales are set
if (!scaleConfigElement) {
    throw new Error('Scale config element not found');
}
scaleConfigElement.addOnScaleSetFunction(
    'scale-config-cache-update',
    ({xScale = null, yScale = null}={}) => {
        if (xScale !== null) {
            var prev_scaleX = local_cache["scaleX"];
            local_cache["scaleX"] = xScale;
            console.log('Updated local_cache scaleX from', prev_scaleX, 'to:', xScale);
        }
        if (yScale !== null) {
            var prev_scaleY = local_cache["scaleY"];
            local_cache["scaleY"] = yScale;
            console.log('Updated local_cache scaleY from', prev_scaleY, 'to:', yScale);
        }
    }
)