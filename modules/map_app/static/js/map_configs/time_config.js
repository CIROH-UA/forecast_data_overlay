// Lead time selector
document.getElementById('lead-time-value').textContent = document.getElementById('lead-time').value;
document.getElementById('lead-time').addEventListener('input', function () {
    document.getElementById('lead-time-value').textContent = this.value;
});
// Forecast cycle selector
document.getElementById('forecast-cycle-value').textContent = document.getElementById('forecast-cycle').value;
document.getElementById('forecast-cycle').addEventListener('input', function () {
    document.getElementById('forecast-cycle-value').textContent = this.value;
});


// set-time button logic
document.getElementById('set-time').addEventListener('click', function () {
    const targetTime = document.getElementById('target-time').value;
    const leadTime = document.getElementById('lead-time').value;
    const forecastCycle = document.getElementById('forecast-cycle').value;
    const prevTime = document.getElementById('selected-time').textContent;
    const prevLeadTime = document.getElementById('selected-lead-time').textContent;
    const prevForecastCycle = document.getElementById('selected-forecast-cycle').textContent
    var changed = true;
    console.log("Setting time to:", targetTime, leadTime, forecastCycle);
    console.log("Previous time was:", prevTime, prevLeadTime, prevForecastCycle);
    // If any of the values have changed, we proceed to set the time
    // Just always treat as changed. 
    // If they want to re-request the same time, that's fine.
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

        local_cache["target_time"] = formattedTime;
        local_cache["lead_time"] = leadTime;
        local_cache["forecast_cycle"] = forecastCycle;

        updateForecastedPrecipOverlay();
    }
});
