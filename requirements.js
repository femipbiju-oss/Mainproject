// ==========================================
// REQUIREMENTS PAGE - requirements.js
// ==========================================

// Backend API
const API_URL = "http://127.0.0.1:8000/requirements/generate";


// ==========================================
// READ DATA FROM URL
// ==========================================

const params = new URLSearchParams(window.location.search);

let disasterType = params.get("disaster");
let locationName = params.get("location");
let affectedPopulation = params.get("population");


// ==========================================
// FALLBACK: LOCAL STORAGE
// ==========================================

if (!disasterType || !locationName || !affectedPopulation) {

    const savedData = localStorage.getItem("disasterData");

    if (savedData) {

        try {

            const data = JSON.parse(savedData);

            disasterType = disasterType || data.disaster;
            locationName = locationName || data.location;
            affectedPopulation = affectedPopulation || data.population;

        } catch (error) {

            console.error(
                "Error reading disaster data:",
                error
            );

        }
    }
}


// ==========================================
// HTML ELEMENTS
// ==========================================

const disasterElement =
    document.getElementById("disasterType");

const locationElement =
    document.getElementById("location");

const populationElement =
    document.getElementById("population");

const generateButton =
    document.getElementById("generateBtn");

const resultSection =
    document.getElementById("requirementsResult");

const resultPopulation =
    document.getElementById("resultPopulation");

const requirementsTable =
    document.getElementById("requirementsTable");

const nextStep =
    document.getElementById("nextStep");

const vendorButton =
    document.getElementById("vendorBtn");


// ==========================================
// DISPLAY MISSION DETAILS
// ==========================================

if (disasterElement) {

    disasterElement.textContent =
        disasterType || "—";
}


if (locationElement) {

    locationElement.textContent =
        locationName || "—";
}


if (populationElement) {

    if (affectedPopulation) {

        populationElement.textContent =
            Number(affectedPopulation)
                .toLocaleString("en-IN");

    } else {

        populationElement.textContent = "—";
    }
}


// ==========================================
// HIDE RESULT UNTIL GENERATED
// ==========================================

if (resultSection) {

    resultSection.style.display = "none";
}

if (nextStep) {

    nextStep.style.display = "none";
}


// ==========================================
// GENERATE REQUIREMENTS
// ==========================================

if (generateButton) {

    generateButton.addEventListener(
        "click",
        async function () {

            // ----------------------------------
            // Validate data
            // ----------------------------------

            const population =
                Number(affectedPopulation);


            if (
                !disasterType ||
                !locationName ||
                !population ||
                population <= 0
            ) {

                alert(
                    "Mission information is missing.\n\n" +
                    "Please return to the population estimation page " +
                    "and calculate the affected population first."
                );

                return;
            }


            // ----------------------------------
            // Loading state
            // ----------------------------------

            generateButton.disabled = true;

            generateButton.innerHTML = `
                <span class="button-icon">◈</span>
                <span>Generating...</span>
            `;


            try {

                // ----------------------------------
                // Data sent to backend
                // ----------------------------------

                const requestData = {

                    disaster_type: disasterType,

                    location: locationName,

                    affected_population: population

                };


                console.log(
                    "Sending requirement request:",
                    requestData
                );


                // ----------------------------------
                // CALL FASTAPI
                // ----------------------------------

                const response = await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(requestData)
                    }
                );


                // ----------------------------------
                // CHECK RESPONSE
                // ----------------------------------

                if (!response.ok) {

                    throw new Error(
                        "Backend error: " +
                        response.status
                    );
                }


                const data =
                    await response.json();


                console.log(
                    "Backend response:",
                    data
                );


                // ----------------------------------
                // CHECK API SUCCESS
                // ----------------------------------

                if (!data.success) {

                    throw new Error(
                        data.message ||
                        "Requirement generation failed."
                    );
                }


                // ==================================
                // DISPLAY POPULATION
                // ==================================

                if (resultPopulation) {

                    resultPopulation.textContent =
                        Number(
                            data.affected_population
                        ).toLocaleString("en-IN");
                }


                // ==================================
                // CLEAR OLD TABLE
                // ==================================

                requirementsTable.innerHTML = "";


                // ==================================
                // ADD REQUIREMENTS TO TABLE
                // ==================================

                data.requirements.forEach(
                    function (item, index) {

                        const row =
                            document.createElement("tr");


                        row.innerHTML = `

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                <strong>
                                    ${item.resource}
                                </strong>
                            </td>

                            <td>
                                <strong>
                                    ${Number(
                                        item.quantity
                                    ).toLocaleString("en-IN")}
                                </strong>
                            </td>

                            <td>
                                ${item.unit}
                            </td>

                            <td>
                                ${item.planning_basis}
                            </td>

                        `;


                        requirementsTable.appendChild(row);

                    }
                );


                // ==================================
                // SHOW RESULT
                // ==================================

                if (resultSection) {

                    resultSection.style.display =
                        "block";
                }


                // ==================================
                // SHOW NEXT MODULE
                // ==================================

                if (nextStep) {

                    nextStep.style.display =
                        "flex";
                }


                // ==================================
                // SCROLL TO RESULT
                // ==================================

                if (resultSection) {

                    resultSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }


            } catch (error) {

                console.error(
                    "Requirement generation error:",
                    error
                );


                alert(
                    "Unable to generate requirements.\n\n" +
                    "Please make sure the FastAPI backend is running.\n\n" +
                    "Error: " +
                    error.message
                );

            } finally {

                // ----------------------------------
                // RESTORE BUTTON
                // ----------------------------------

                generateButton.disabled = false;

                generateButton.innerHTML = `
                    <span class="button-icon">◈</span>

                    <span>
                        Generate Requirements
                    </span>

                    <span class="button-arrow">
                        →
                    </span>
                `;
            }

        }
    );

}


// ==========================================
// VENDOR COMPARISON BUTTON
// ==========================================

if (vendorButton) {

    vendorButton.addEventListener(
        "click",
        function () {

            alert(
                "Vendor Comparison module will be developed next."
            );

        }
    );

}