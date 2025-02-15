// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const axios = require("axios");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: Number,
  genre: String,
});

const Book = mongoose.model("Book", bookSchema);

// Routes
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Error fetching books" });
  }
});

app.post("/books", async (req, res) => {
  try {
    const { title, author, year, genre } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: "Title and author are required" });
    }
    const newBook = new Book({ title, author, year, genre });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: "Error adding book" });
  }
});

app.put("/books/:id", async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: "Error updating book" });
  }
});

app.delete("/books/:id", async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting book" });
  }
});

// Third-party API Integration (Weather API)
app.get("/weather/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const weatherData = {
      city: response.data.name,
      temperature: `${response.data.main.temp}°C`,
      condition: response.data.weather[0].description,
    };
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching weather data" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
