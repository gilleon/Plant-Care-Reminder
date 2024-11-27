const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 5001;
const API_TOKEN = "b9ooy39ulRa-0IB6e9Gl79silWQ4k0nvKdyQu87P-Ik";

// Allow CORS from all origins
app.use(cors());

app.get("/api/plants", async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).send('Query parameter "q" is required');
  }

  try {
    const response = await axios.get(`https://trefle.io/api/v1/plants`, {
      params: {
        token: API_TOKEN,
        q: q,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data from Trefle API:", error.message);
    res.status(500).send("Failed to fetch plant information");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
