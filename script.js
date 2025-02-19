const plantSearchInput = document.getElementById("plant-search");
const suggestionList = document.getElementById("suggestion-list");
const plantList = document.getElementById("plant-list");
const plantModal = document.getElementById("plant-modal");
const modalCloseButton = document.getElementById("close-modal");
const modalContent = document.getElementById("modal-body");
const plantFormModal = document.getElementById("plant-form-modal");
const openFormModalBtn = document.getElementById("open-form-modal");
const closeFormModalBtn = document.getElementById("close-form-modal");

// API endpoint on the server
const SERVER_API_URL = "http://localhost:3000/plants";

// Fetch All Plants
async function fetchPlants() {
  try {
    const response = await fetch(SERVER_API_URL);
    if (!response.ok) throw new Error("Failed to fetch plants");

    const plants = await response.json();
    displayPlants(plants);
  } catch (error) {
    console.error("Error fetching plants:", error);
  }
}

// Create a New Plant
async function addPlant(event) {
  event.preventDefault();

  const newPlant = {
    common_name: document.getElementById("common_name").value,
    scientific_name: document.getElementById("scientific_name").value,
    family: document.getElementById("family").value,
    sunlight: document.getElementById("sunlight").value,
    watering: document.getElementById("watering").value,
    image_url: document.getElementById("image_url").value,
  };

  try {
    const response = await fetch(SERVER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPlant),
    });

    if (!response.ok) throw new Error("Failed to add plant");

    fetchPlants();
    
    document.getElementById("plant-form-modal").style.display = "none";
  } catch (error) {
    console.error("Error adding plant:", error);
  }
}

// Load Plant for UPDATE in Modal
async function editPlant(id) {
  try {
    const response = await fetch(`${SERVER_API_URL}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch plant details");

    const plant = await response.json();

    // Populate the modal form fields with plant data
    document.getElementById("common_name").value = plant.common_name;
    document.getElementById("scientific_name").value = plant.scientific_name;
    document.getElementById("family").value = plant.family;
    document.getElementById("sunlight").value = plant.sunlight;
    document.getElementById("watering").value = plant.watering;
    document.getElementById("image_url").value = plant.image_url;

    // Update modal UI elements
    document.getElementById("form-title").innerText = "Edit Plant";
    document.getElementById("submit-button").innerText = "Update Plant";
    document.getElementById("plant-form").dataset.id = id;

    document.getElementById("plant-form-modal").style.display = "block";
  } catch (error) {
    console.error("Error fetching plant for edit:", error);
  }
}

// Submit the Updated Plant Data
async function updatePlant(event) {
  event.preventDefault();
  const plantId = document.getElementById("plant-form").dataset.id;
  if (!plantId) return addPlant(event); // If no ID, create new plant instead

  const updatedPlant = {
    common_name: document.getElementById("common_name").value,
    scientific_name: document.getElementById("scientific_name").value,
    family: document.getElementById("family").value,
    sunlight: document.getElementById("sunlight").value,
    watering: document.getElementById("watering").value,
    image_url: document.getElementById("image_url").value,
  };

  try {
    const response = await fetch(`${SERVER_API_URL}/${plantId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPlant),
    });

    if (!response.ok) throw new Error("Failed to update plant");

    document.getElementById("plant-form").reset();
    document.getElementById("submit-button").innerText = "Add Plant";
    delete document.getElementById("plant-form").dataset.id;

    fetchPlants();

    document.getElementById("plant-form-modal").style.display = "none";
  } catch (error) {
    console.error("Error updating plant:", error);
  }
}

// Delete a Plant
async function deletePlant(id) {
  if (!confirm("Are you sure you want to delete this plant?")) return;

  try {
    const response = await fetch(`${SERVER_API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete plant");

    fetchPlants();
  } catch (error) {
    console.error("Error deleting plant:", error);
  }
}

// Load plants when the page loads
document.addEventListener("DOMContentLoaded", fetchPlants);

// Attach form submission event listener
document.getElementById("plant-form").addEventListener("submit", updatePlant);


// Open modal when clicking "Add New Plant" button
openFormModalBtn.addEventListener("click", () => {
  document.getElementById("form-title").innerText = "Add a New Plant";
  document.getElementById("submit-button").innerText = "Add Plant";
  document.getElementById("plant-form").reset();
  delete document.getElementById("plant-form").dataset.id;
  plantFormModal.style.display = "block";
});

// Close modal when clicking the close button
closeFormModalBtn.addEventListener("click", () => {
  plantFormModal.style.display = "none";
});

// Close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
  if (event.target === plantFormModal) {
    plantFormModal.style.display = "none";
  }
});

// ==================== OLD CODES FROM LAST SEM ==================== //
//dynamic populate search input
plantSearchInput.addEventListener("input", () => {
  const query = plantSearchInput.value.trim();
  if (query !== "") {
    fetchPlantSuggestions(query);
  } else {
    suggestionList.innerHTML = "";
  }
});

// Get plant suggest based on input field
async function fetchPlantSuggestions(query) {
  try {
    const response = await fetch(`${SERVER_API_URL}?q=${query}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("API Response:", data); 

    const filteredData = data.filter(
      (plant) =>
        plant.common_name?.toLowerCase().includes(query.toLowerCase()) ||
        plant.scientific_name?.toLowerCase().includes(query.toLowerCase())
    );
    displaySuggestions(filteredData);
  } catch (error) {
    console.error("Error fetching plant suggestions:", error);
  }
}

function displaySuggestions(plants) {
  suggestionList.innerHTML = "";

  if (plants.length === 0) {
    suggestionList.innerHTML = "<li class='no-result'>No result found</li>";
    return;
  }

  plants.forEach((plant) => {
    const suggestionItem = document.createElement("li");
    suggestionItem.className = "suggestion-item";
    suggestionItem.innerHTML = `
        <span class="suggestion-icon">🌿</span> ${
          plant.common_name || "Unknown Plant"
        }
      `;
    suggestionItem.addEventListener("click", () => {
      showPlantModal(plant);
      suggestionList.innerHTML = "";
    });
    suggestionList.appendChild(suggestionItem);
  });
}

function showPlantModal(plant) {
  const html = `
      <div class="modal-header">
        <img src="${plant.image_url}" alt="${
    plant.common_name
  }" class="plant-image" />
        <h3>${plant.common_name || "Unknown Plant"}</h3>
        <p>Scientifically known as <strong>${
          plant.scientific_name || "[scientific-name]"
        }</strong> from the plant family of <strong>${
    plant.family || "[family-name]"
  }</strong></p>
      </div>
      <button id="learn-more" class="learn-more-button">Learn more about this plant</button>

      <div class="accordion">
        <button class="accordion-button"><span class="suggestion-icon">🌿</span>Plant care information</button>
        <div class="accordion-content">
          <p><strong>Sunlight Requirements:</strong> ${
            plant.sunlight || "No information available"
          }</p>
          <p><strong>Watering Frequency:</strong> ${
            plant.watering || "No information available"
          }</p>
          <p><strong>Care Tips:</strong> ${
            plant.care_tips || "No tips available"
          }</p>
        </div>

        <button class="accordion-button"><span class="suggestion-icon">⏰</span>Set a reminder</button>
        <div class="accordion-content">
          <p>Remind me to water ${plant.common_name || "this plant"} every:</p>
          <select id="reminder-frequency">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
          </select>
          <button id="set-reminder-button" class="set-reminder-button">Set Reminder</button>
        </div>
      </div>
    `;
  modalContent.innerHTML = html;
  plantModal.style.display = "block";

  // Attach event listeners for accordion
  const accordionButtons = document.querySelectorAll(".accordion-button");
  accordionButtons.forEach((button) =>
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      const content = button.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    })
  );

  // Attach event listener for setting a reminder
  document
    .getElementById("set-reminder-button")
    .addEventListener("click", () => {
      const frequency = document.getElementById("reminder-frequency").value;
      const reminderMessage = document.createElement("p");
      reminderMessage.innerHTML = `Reminder set to water <strong>${plant.common_name}</strong> every <strong>${frequency}</strong>.`;
      modalContent.appendChild(reminderMessage);
    });
}

// Display Plants in a Table
function displayPlants(plants) {
  const tableBody = document.getElementById("plant-table-body");
  tableBody.innerHTML = "";

  plants.forEach((plant) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${plant.common_name}</td>
        <td>${plant.scientific_name}</td>
        <td>${plant.family}</td>
        <td>${plant.sunlight}</td>
        <td>${plant.watering}</td>
        <td><img src="${plant.image_url}" alt="${plant.common_name}" width="50"></td>
        <td>
            <button onclick="editPlant('${plant._id}')">✏️</button>
            <button onclick="deletePlant('${plant._id}')">🗑️</button>
        </td>
    `;
    tableBody.appendChild(row);
  });
}

// Close modal when clicking the close button
modalCloseButton.addEventListener("click", () => {
  plantModal.style.display = "none";
});

// Close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
  if (event.target === plantModal) {
    plantModal.style.display = "none";
  }
});