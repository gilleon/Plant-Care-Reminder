const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const app = express();

app.use(cors());
app.use(express.json());
app.use(multer().none());


// Connect to MongoDB
const dbURI =
  "mongodb+srv://sd6200:89ZFJLQ40YR51QdF@cluster0.j6q3g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(dbURI, { dbName: "plantDb" })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Plant Schema
const plantSchema = new mongoose.Schema({
  common_name: { type: String, required: true },
  scientific_name: { type: String, required: true },
  family: { type: String, required: true },
  sunlight: { type: String, required: true },
  watering: { type: String, required: true },
  image_url: { type: String, required: false }
});

// Create the Plant model from the plantSchema
const Plant = mongoose.model("Plant", plantSchema);

// Get All Plants
app.get("/plants", async (req, res) => {
    try {
        const plants = await Plant.find();
        res.json(plants);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch plants", error: error.message });
    }
});

// Get Single Plant by ID
app.get("/plants/:id", async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.id);
        if (!plant) return res.status(404).json({ message: "Plant not found" });
        res.json(plant);
    } catch (error) {
        res.status(500).json({ message: "Error fetching plant", error: error.message });
    }
});

// Create a New Plant
app.post("/plants", async (req, res) => {
    try {
        const { common_name, scientific_name, family, sunlight, watering, image_url } = req.body;

        // Check if all required fields are present and not empty
        if (!common_name?.trim() || !scientific_name?.trim() || !family?.trim() || !sunlight?.trim() || !watering?.trim()) {
            return res.status(400).json({ message: "All fields except image_url are required and cannot be empty." });
        }

        // Create new plant
        const newPlant = new Plant(req.body);
        //const newPlant = new Plant({ common_name, scientific_name, family, sunlight, watering, image_url: image_url?.trim() || "" });
        await newPlant.save();

        res.status(201).json({ message: "Plant added successfully", plant: newPlant });
    } catch (error) {
        res.status(500).json({ message: "Server error while adding plant", error: error.message });
    }
});

// Update an Existing Plant
app.put("/plants/:id", async (req, res) => {
    try {
        const updatedPlant = await Plant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPlant) return res.status(404).json({ message: "Plant not found" });
        res.json({ message: "Plant updated successfully", plant: updatedPlant });
    } catch (error) {
        res.status(500).json({ message: "Error updating plant", error: error.message });
    }
});

// Delete a Plant
app.delete("/plants/:id", async (req, res) => {
    try {
        const deletedPlant = await Plant.findByIdAndDelete(req.params.id);
        if (!deletedPlant) return res.status(404).json({ message: "Plant not found" });
        res.json({ message: "Plant deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting plant", error: error.message });
    }
});

app.use(express.static("client"));

app.listen(3000, () => {
  console.log("Server running...");
});