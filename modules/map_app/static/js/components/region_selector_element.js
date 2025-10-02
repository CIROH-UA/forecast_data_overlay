/**
 * @typedef {Object} regionBounds
 * @property {number} rowMin - The minimum row (y) index (inclusive)
 * @property {number} rowMax - The maximum row (y) index (exclusive)
 * @property {number} colMin - The minimum column (x) index (inclusive)
 * @property {number} colMax - The maximum column (x) index (exclusive)
 */
/**
 * @typedef {Object} regionBoundArgs
 * @property {number?} rowMin - The minimum row (y) index (inclusive), or null if unchanged
 * @property {number?} rowMax - The maximum row (y) index (exclusive), or null if unchanged
 * @property {number?} colMin - The minimum column (x) index (inclusive), or null if unchanged
 * @property {number?} colMax - The maximum column (x) index (exclusive), or null if unchanged
 */
/**
 * @callback regionSetCallback
 * @param {regionBoundArgs} bounds - The new values
 */
/**
 * @callback regionSelectionCallback
 * @param {regionBoundArgs} bounds - The new selection values
 */

class region_selector extends HTMLElement {
    constructor() {
        super();
        // this.shadow = this.attachShadow({ mode: 'open' });

        // Element attributes
        this.titleElement = null;
        this.xMinSlider = null;
        this.xMaxSlider = null;
        this.yMinSlider = null;
        this.yMaxSlider = null;
        this.setButton = null;
        this.container = null;

        /**
         * Functions to call when the region is set
         * @type {Object.<string, regionSetCallback>}
         */
        this.regionSetCallbacks = {};
        /**
         * Functions to call when the region selection changes
         * @type {Object.<string, regionSelectionCallback>}
         */
        this.regionSelectionCallbacks = {};

        this.locked = true; // Whether the x and y scales are locked together
        this.uuid = region_selector.id++;
    }

    connectedCallback() {
        console.log('Region selector ' + this.uuid + ' loaded successfully. Building...');

        this.build();
    }

    // Callback registration functions
    /**
     * Add a function to be called when any region is set
     * @param {string} key - A unique key to identify the callback
     * @param {regionSetCallback} func - The function to call when the region is set
     */
    addOnRegionSetFunction(key, func) {
        if (this.regionSetCallbacks[key]) {
            // fail loudly, this shouldn't happen
            console.error('An onRegionSet callback with key ' + key + ' already exists. Choose a different key.');
            return;
        }
        this.regionSetCallbacks[key] = func;
    }
    /**
     * Remove a previously added onRegionSet callback
     * @param {string} key - The unique key identifying the callback to remove
     */
    removeOnRegionSetFunction(key) {
        if (!this.regionSetCallbacks[key]) {
            console.error('No onRegionSet callback with key ' + key + ' exists. Cannot remove.');
            return;
        }
        delete this.regionSetCallbacks[key];
    }
    /**
     * Trigger all registered onRegionSet callbacks
     * @param {regionBoundArgs} options - The new region set values
     */
    triggerOnRegionSet(options) {
        for (const key in this.regionSetCallbacks) {
            this.regionSetCallbacks[key](options);
        }
    }
    /**
     * Add a function to be called when any region selection changes
     * @param {string} key - A unique key to identify the callback
     * @param {regionSelectionCallback} func - The function to call when the region selection changes
     */
    addOnRegionSelectionFunction(key, func) {
        if (this.regionSelectionCallbacks[key]) {
            // fail loudly, this shouldn't happen
            console.error('An onRegionSelection callback with key ' + key + ' already exists. Choose a different key.');
            return;
        }
        this.regionSelectionCallbacks[key] = func;
    }
    /**
     * Remove a previously added onRegionSelection callback
     * @param {string} key - The unique key identifying the callback to remove
     */
    removeOnRegionSelectionFunction(key) {
        if (!this.regionSelectionCallbacks[key]) {
            console.error('No onRegionSelection callback with key ' + key + ' exists. Cannot remove.');
            return;
        }
        delete this.regionSelectionCallbacks[key];
    }
    /**
     * Trigger all registered onRegionSelection callbacks
     * @param {regionBoundArgs} options - The new region selection values
     */
    triggerOnRegionSelection(options) {
        for (const key in this.regionSelectionCallbacks) {
            this.regionSelectionCallbacks[key](options);
        }
    }

    /**
     * Set the selection values of the sliders
     * @param {regionBoundArgs} options - The new selection values to set
     */
    setSelection({rowMin = null, rowMax = null, colMin = null, colMax = null}={}) {
        if (rowMin !== null) {
            this.yMinSlider.setExternally({selectionValue: rowMin, silent: true});
        }
        if (rowMax !== null) {
            this.yMaxSlider.setExternally({selectionValue: rowMax, silent: true});
        }
        if (colMin !== null) {
            this.xMinSlider.setExternally({selectionValue: colMin, silent: true});
        }
        if (colMax !== null) {
            this.xMaxSlider.setExternally({selectionValue: colMax, silent: true});
        }
        this.triggerOnRegionSelection({rowMin: rowMin, rowMax: rowMax, colMin: colMin, colMax: colMax});
    }

    /**
     * Set the set values of the sliders (the values used when "Set Scale" is clicked)
     * @param {regionBoundArgs} options - The new set values to set
     */
    setSet({rowMin = null, rowMax = null, colMin = null, colMax = null}={}) {
        if (rowMin !== null) {
            this.yMinSlider.setExternally({setValue: rowMin, silent: true});
        }
        if (rowMax !== null) {
            this.yMaxSlider.setExternally({setValue: rowMax, silent: true});
        }
        if (colMin !== null) {
            this.xMinSlider.setExternally({setValue: colMin, silent: true});
        }
        if (colMax !== null) {
            this.xMaxSlider.setExternally({setValue: colMax, silent: true});
        }
        this.triggerOnRegionSet({rowMin: rowMin, rowMax: rowMax, colMin: colMin, colMax: colMax});
    }
    
    /**
     * Set both the selection and set values of the sliders
     * @param {regionBoundArgs} options - The new values to set
     */
    setFull({rowMin = null, rowMax = null, colMin = null, colMax = null}={}) {
        this.setSelection({rowMin: rowMin, rowMax: rowMax, colMin: colMin, colMax: colMax});
        this.setSet({rowMin: rowMin, rowMax: rowMax, colMin: colMin, colMax: colMax});
    }

    /**
     * Handle changes in selection sliders
     * @param {regionBoundArgs} changed - The changed values
     */
    onRegionSelectionChange(changed) {
        // Probably need to handle dynamic constraints here
        // i.e. prevent min from being changed to be >= max, etc.
        // For now, do nothing
    }

    onSetButtonClick() {
        this.xMinSlider.setButton();
        this.xMaxSlider.setButton();
        this.yMinSlider.setButton();
        this.yMaxSlider.setButton();
        this.triggerOnRegionSet({
            rowMin: this.yMinSlider.setValue,
            rowMax: this.yMaxSlider.setValue,
            colMin: this.xMinSlider.setValue,
            colMax: this.xMaxSlider.setValue
        });
    }

    build() {
        var title_string = 'Region Selection:';
        var xrange_label_string = 'Column Range (x direction):';
        var yrange_label_string = 'Row Range (y direction):';
        // Create the container element
        this.container = document.createElement('div');
        this.container.id = 'region-settings';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';

        // Set up the title label
        this.titleElement = document.createElement('label');
        this.titleElement.textContent = title_string;

        // externalSetRegionBounds(
        //     0, 3840, // rowMin, rowMax
        //     0, 4608, // colMin, colMax
        //     16, 16 // rowStep, colStep
        // )
        // externalSetRegionValues(656, 1264, 1952, 2416); // rowMin, rowMax, colMin, colMax

        // Row sliders label
        var yrangeLabel = document.createElement('label');
        yrangeLabel.textContent = yrange_label_string;
        // Row min slider
        this.yMinSlider = double_labeled_slider.newInstance({
            min: 0,
            max: 3840,
            step: 16,
            value: 656,
            width: '300px',
        })
        this.yMaxSlider = double_labeled_slider.newInstance({
            min: 0,
            max: 3840,
            step: 16,
            value: 1264,
            width: '300px',
        })

        // Column sliders label
        var xrangeLabel = document.createElement('label');
        xrangeLabel.textContent = xrange_label_string;
        // Column min slider
        this.xMinSlider = double_labeled_slider.newInstance({
            min: 0,
            max: 4608,
            step: 16,
            value: 1952,
            width: '300px',
        })
        this.xMaxSlider = double_labeled_slider.newInstance({
            min: 0,
            max: 4608,
            step: 16,
            value: 2416,
            width: '300px',
        })


        // Set Button
        this.setButton = document.createElement('button');
        this.setButton.id = 'set-region';
        this.setButton.textContent = 'Set Region';
        this.setButton.style.alignSelf = 'center';
        
        this.setButton.addEventListener('click', this.onSetButtonClick.bind(this));

        // Assemble the main container
        this.container.appendChild(this.titleElement);
        this.container.appendChild(xrangeLabel);
        this.container.appendChild(this.xMinSlider);
        this.container.appendChild(this.xMaxSlider);
        this.container.appendChild(yrangeLabel);
        this.container.appendChild(this.yMinSlider);
        this.container.appendChild(this.yMaxSlider);
        this.container.appendChild(this.setButton);

        // this.shadow.appendChild(this.container);
        this.appendChild(this.container);
    }
}
region_selector.id = 0; 
// Leaving the 'uuid'/'id' infrastructure in place, 
// but this should be largely unused
customElements.define('region-selector', region_selector);