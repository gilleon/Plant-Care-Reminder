document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search-button");
  const plantSearchInput = document.getElementById("plant-search");
  const plantInfoContainer = document.getElementById("plant-info");
  const careInfoContainer = document.getElementById("care-info");
  const reminderSection = document.getElementById("reminder-section");
  const reminderMessage = document.getElementById("reminder-message");
  const plantNameElement = document.getElementById("plant-name");
  const setReminderButton = document.getElementById("set-reminder-button");

  // Trefle API endpoint on the server
  const SERVER_API_URL = "http://localhost:5001/api/plants";

  searchButton.addEventListener("click", () => {
    const query = plantSearchInput.value.trim();
    if (query !== "") {
      fetchPlantInfo(query);
    }
  });

  async function fetchPlantInfo(query) {
    try {
      const response = await fetch(`${SERVER_API_URL}?q=${query}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      // Filter results to ensure it matches exactly the common name or scientific name
      const filteredData = data.data.filter(
        (plant) =>
          plant.common_name?.toLowerCase() === query.toLowerCase() ||
          plant.scientific_name?.toLowerCase() === query.toLowerCase()
      );
      displayPlantInfo(filteredData);
    } catch (error) {
      console.error("Error fetching plant info:", error);
    }
  }

  function displayPlantInfo(plants) {
    plantInfoContainer.innerHTML = "";
    careInfoContainer.style.display = "none";
    reminderSection.style.display = "none";
    reminderMessage.style.display = "none";

    if (plants.length === 0) {
      plantInfoContainer.innerHTML =
        "<p>No plants found. Try another search!</p>";
      plantInfoContainer.style.display = "block";
      return;
    }

    // Create a list of plants found
    const plantList = document.createElement("ul");
    plantList.style.listStyle = "none";
    plantList.style.padding = "0";

    plants.forEach((plant, index) => {
      const listItem = document.createElement("li");
      listItem.style.cursor = "pointer";
      listItem.style.marginBottom = "10px";
      listItem.innerHTML = `
      <h4>${plant.common_name || "Unknown Plant"} (${
        plant.scientific_name
      })</h4>
      <img src="${plant.image_url}" alt="${plant.common_name}" width="100" />
    `;

      // Add click event listener to show detailed info of the selected plant
      listItem.addEventListener("click", () => {
        showDetailedPlantInfo(plant);
      });

      plantList.appendChild(listItem);
    });

    plantInfoContainer.appendChild(plantList);
    plantInfoContainer.style.display = "block";
  }

  function showDetailedPlantInfo(plant) {
    // Show plant information in detail
    const html = `
    <h3>${plant.common_name || "Unknown Plant"}</h3>
    <p><strong>Scientific Name:</strong> ${plant.scientific_name}</p>
    <p><strong>Family:</strong> ${plant.family_common_name || "Unknown"}</p>
    <img src="${plant.image_url}" alt="${plant.common_name}" width="200" />
  `;
    plantInfoContainer.innerHTML = html;
    plantInfoContainer.style.display = "block";

    // Display care information if available
    const sunlight = plant.sunlight || "No information available";
    const wateringFrequency = plant.watering || "No information available";
    const careTips = plant.care_tips || "No tips available";

    document.getElementById("sunlight").textContent = sunlight;
    document.getElementById("watering-frequency").textContent =
      wateringFrequency;
    document.getElementById("care-tips").textContent = careTips;

    careInfoContainer.style.display = "block";

    // Show reminder section and set the plant name
    plantNameElement.textContent = plant.common_name || "this plant";
    reminderSection.style.display = "block";
  }

  setReminderButton.addEventListener("click", () => {
    const frequency = document.getElementById("reminder-frequency").value;
    const plantName = plantNameElement.textContent;
    reminderMessage.innerHTML = `Reminder set to water <strong>${plantName}</strong> every <strong>${frequency}</strong>.`;
    reminderMessage.style.display = "block";
  });
});
