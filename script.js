
/* =========================================================
   KERALA DISASTER RESPONSE SYSTEM
   WorldPop Population Estimation
   Requirements Page Connection
========================================================= */


/* =========================================================
   MAP INITIALIZATION
========================================================= */

const map = L.map("map").setView(
    [10.8505, 76.2711],
    7
);


/* OpenStreetMap */

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);


/* =========================================================
   KERALA BOUNDARY
========================================================= */

const keralaBoundaryURL =
    "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/states/kerala.geojson";


fetch(keralaBoundaryURL)
    .then(response => {

        if (!response.ok) {
            throw new Error("Unable to load Kerala boundary");
        }

        return response.json();

    })
    .then(data => {

        const keralaLayer = L.geoJSON(
            data,
            {
                style: {
                    color: "#087f5b",
                    weight: 3,
                    opacity: 1,
                    fillColor: "#087f5b",
                    fillOpacity: 0.04
                }
            }
        ).addTo(map);


        /* Fit map to Kerala */

        map.fitBounds(
            keralaLayer.getBounds(),
            {
                padding: [20, 20]
            }
        );

    })
    .catch(error => {

        console.error(
            "Kerala boundary error:",
            error
        );

    });


/* =========================================================
   DRAWING
========================================================= */

let disasterGeoJSON = null;


/* Layer for drawn shapes */

const drawnItems = new L.FeatureGroup();

map.addLayer(drawnItems);


/* Drawing controls */

const drawControl = new L.Control.Draw({

    position: "topright",

    edit: {
        featureGroup: drawnItems,
        remove: true
    },

    draw: {

        polygon: {
            allowIntersection: false,
            showArea: true,

            shapeOptions: {
                color: "#087f5b",
                weight: 3,
                fillColor: "#087f5b",
                fillOpacity: 0.20
            }
        },

        rectangle: {
            shapeOptions: {
                color: "#1769aa",
                weight: 3,
                fillColor: "#1769aa",
                fillOpacity: 0.20
            }
        },

        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false

    }

});

map.addControl(drawControl);


/* =========================================================
   DRAW CREATED
========================================================= */

map.on(
    L.Draw.Event.CREATED,
    function (event) {

        /* Remove previous selection */

        drawnItems.clearLayers();


        /* Add new shape */

        const layer = event.layer;

        drawnItems.addLayer(layer);


        /* Convert to GeoJSON */

        disasterGeoJSON =
            layer.toGeoJSON();


        /* Update status */

        updateMapStatus(
            "Affected area selected"
        );

    }
);


/* =========================================================
   DRAW EDITED
========================================================= */

map.on(
    L.Draw.Event.EDITED,
    function (event) {

        event.layers.eachLayer(
            function (layer) {

                disasterGeoJSON =
                    layer.toGeoJSON();

            }
        );

        updateMapStatus(
            "Affected area updated"
        );

    }
);


/* =========================================================
   DRAW DELETED
========================================================= */

map.on(
    L.Draw.Event.DELETED,
    function () {

        disasterGeoJSON = null;

        updateMapStatus(
            "No affected area selected"
        );

    }
);


/* =========================================================
   MAP STATUS
========================================================= */

function updateMapStatus(message) {

    const mapStatus =
        document.getElementById("mapStatus");


    if (!mapStatus) return;


    mapStatus.innerHTML =
        `<span class="status-circle"></span>${message}`;


    if (
        message !==
        "No affected area selected"
    ) {

        mapStatus.classList.add(
            "selected"
        );

    } else {

        mapStatus.classList.remove(
            "selected"
        );

    }

}


/* =========================================================
   REQUIREMENTS PAGE CONNECTION
========================================================= */

const requirementsBtn =
    document.getElementById("requirementsBtn");


/* Initially hide button */

if (requirementsBtn) {

    requirementsBtn.style.display = "none";


    requirementsBtn.addEventListener(
        "click",
        function () {

            const disasterType =
                document.getElementById(
                    "disasterType"
                ).value;


            const location =
                document.getElementById(
                    "location"
                ).value.trim();


            const population =
                document.getElementById(
                    "populationValue"
                ).textContent
                .replace(/,/g, "")
                .trim();


            /* Validate mission details */

            if (
                !disasterType ||
                !location ||
                !population ||
                isNaN(Number(population)) ||
                Number(population) <= 0
            ) {

                alert(
                    "Mission information is incomplete. Please calculate the affected population first."
                );

                return;
            }


            /* Prepare mission data */

            const disasterData = {

                disaster: disasterType,

                location: location,

                population: Number(population)

            };


            /* Save data */

            localStorage.setItem(
                "disasterData",
                JSON.stringify(disasterData)
            );


            /* Build Requirements page URL */

            const url =
                "requirements.html?" +
                "disaster=" +
                encodeURIComponent(disasterType) +
                "&location=" +
                encodeURIComponent(location) +
                "&population=" +
                encodeURIComponent(population);


            /* Navigate */

            window.location.href = url;

        }
    );

}


/* =========================================================
   CALCULATE BUTTON
========================================================= */

document
    .getElementById("calculateBtn")
    .addEventListener(
        "click",
        calculatePopulation
    );


/* =========================================================
   CALCULATE POPULATION
========================================================= */

async function calculatePopulation() {

    const disasterType =
        document.getElementById(
            "disasterType"
        ).value;


    const location =
        document.getElementById(
            "location"
        ).value.trim();


    const button =
        document.getElementById(
            "calculateBtn"
        );


    const result =
        document.getElementById(
            "result"
        );


    const populationValue =
        document.getElementById(
            "populationValue"
        );


    /* Hide old Requirements button before new calculation */

    if (requirementsBtn) {

        requirementsBtn.style.display = "none";

    }


    /* -----------------------------------------------------
       Validation
    ----------------------------------------------------- */

    if (!disasterType) {

        alert(
            "Please select the disaster type."
        );

        return;
    }


    if (!location) {

        alert(
            "Please enter the locality or place."
        );

        return;
    }


    if (!disasterGeoJSON) {

        alert(
            "Please draw the affected area on the map."
        );

        return;
    }


    /* -----------------------------------------------------
       Loading state
    ----------------------------------------------------- */

    button.disabled = true;

    button.innerHTML = `
        <span class="button-icon">◌</span>
        <span>Calculating population...</span>
    `;


    result.classList.remove(
        "show",
        "error"
    );


    /* -----------------------------------------------------
       Backend request
    ----------------------------------------------------- */

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/population/estimate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        disaster_type:
                            disasterType,

                        location:
                            location,

                        geometry:
                            disasterGeoJSON.geometry

                    })
                }
            );


        const data =
            await response.json();


        /* -------------------------------------------------
           Error returned by backend
        ------------------------------------------------- */

        if (
            !response.ok ||
            data.error
        ) {

            throw new Error(
                data.error ||
                "Population estimation failed."
            );

        }


        /* -------------------------------------------------
           Display result
        ------------------------------------------------- */

        const population =
            Number(
                data.affected_population
            );


        if (
            !Number.isFinite(population) ||
            population <= 0
        ) {

            throw new Error(
                "Backend returned an invalid population value."
            );

        }


        populationValue.textContent =
            population.toLocaleString(
                "en-IN"
            );


        result.classList.add(
            "show"
        );


        /* -------------------------------------------------
           Show Generate Requirements button
        ------------------------------------------------- */

        if (requirementsBtn) {

            requirementsBtn.style.display =
                "inline-flex";

        }


        /* -------------------------------------------------
           Scroll result into view
        ------------------------------------------------- */

        setTimeout(
            () => {

                result.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            },
            100
        );

    }


    /* -----------------------------------------------------
       Request error
    ----------------------------------------------------- */

    catch (error) {

        console.error(
            "Population estimation error:",
            error
        );


        populationValue.textContent =
            "Error";


        result.classList.add(
            "show",
            "error"
        );


        /* Hide Requirements button on error */

        if (requirementsBtn) {

            requirementsBtn.style.display =
                "none";

        }


        /* Change result text */

        const resultText =
            result.querySelector(
                ".result-content p"
            );


        if (resultText) {

            resultText.textContent =
                error.message ||
                "Unable to connect to the population estimation server.";

        }

    }


    /* -----------------------------------------------------
       Restore button
    ----------------------------------------------------- */

    finally {

        button.disabled = false;

        button.innerHTML = `
            <span class="button-icon">
                ◈
            </span>

            <span>
                Calculate Affected Population
            </span>

            <span class="button-arrow">
                →
            </span>
        `;

    }

}