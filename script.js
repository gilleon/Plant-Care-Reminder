// Helper function to get DOM elements
const getElement = (id) => document.getElementById(id);

// Get all required DOM elements
const plantSearchInput = getElement("plant-search");
const suggestionList = getElement("suggestion-list");
const plantTableBody = getElement("plant-table-body");
const plantModal = getElement("plant-modal");
const modalCloseButton = getElement("close-modal");
const modalContent = getElement("modal-body");
const plantFormModal = getElement("plant-form-modal");
const openFormModalBtn = getElement("open-form-modal");
const closeFormModalBtn = getElement("close-form-modal");
const plantForm = getElement("plant-form");
const submitButton = getElement("submit-button");

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

// Helper function to get form data
function getFormValues() {
  return {
    common_name: getElement("common_name").value.trim(),
    scientific_name: getElement("scientific_name").value.trim(),
    family: getElement("family").value.trim(),
    sunlight: getElement("sunlight").value,
    watering: getElement("watering").value,
    image_url: getElement("image_url").value.trim(),
  };
}

// Helper function to reset form
function resetForm() {
  plantForm.reset();
  delete plantForm.dataset.id;
}

// Show & Hide Modals
function openModal(title, buttonText) {
  getElement("form-title").innerText = title;
  submitButton.innerText = buttonText;
  plantFormModal.style.display = "block";
}

function closeModal() {
  plantFormModal.style.display = "none";
}

// Create or Update a Plant
async function savePlant(event) {
  event.preventDefault();
  const plantId = plantForm.dataset.id;
  const plantData = getFormValues();
  const url = plantId ? `${SERVER_API_URL}/${plantId}` : SERVER_API_URL;
  const method = plantId ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plantData),
    });

    if (!response.ok)
      throw new Error(`Failed to ${plantId ? "update" : "add"} plant`);

    fetchPlants();
    resetForm();
    closeModal();
  } catch (error) {
    console.error(`Error ${plantId ? "updating" : "adding"} plant:`, error);
  }
}

// Load Plant for Editing
async function editPlant(id) {
  try {
    const response = await fetch(`${SERVER_API_URL}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch plant details");

    const plant = await response.json();

    // Populate the form with plant data
    Object.keys(plant).forEach((key) => {
      if (getElement(key)) getElement(key).value = plant[key];
    });

    // Set plant ID for updating and open the modal
    plantForm.dataset.id = id;
    openModal("Edit Plant", "Update Plant");
  } catch (error) {
    console.error("Error fetching plant for edit:", error);
  }
}

// Delete a Plant
async function deletePlant(id) {
  if (!confirm("Are you sure you want to delete this plant?")) return;

  try {
    const response = await fetch(`${SERVER_API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete plant");

    fetchPlants();
  } catch (error) {
    console.error("Error deleting plant:", error);
  }
}

// Display Plants in a Table
function displayPlants(plants) {
  plantTableBody.innerHTML = "";

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
    plantTableBody.appendChild(row);
  });
}

// Open modal for adding a new plant
openFormModalBtn.addEventListener("click", () => {
  resetForm();
  openModal("Add a New Plant", "Add Plant");
});

// Close modal when clicking the close button or outside content
closeFormModalBtn.addEventListener("click", closeModal);
window.addEventListener("click", (event) => {
  if (event.target === plantFormModal) closeModal();
});

// Attach form submission event listener
plantForm.addEventListener("submit", savePlant);

// Load plants when the page loads
document.addEventListener("DOMContentLoaded", fetchPlants);



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
