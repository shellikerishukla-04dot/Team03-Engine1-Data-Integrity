const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Homepage
app.get("/", (req, res) => {
  res.send("Interior Design Recommendation System Backend is Running!");
});

// Test database connection
app.get("/api/test", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({
      success: true,
      message: "Backend and MySQL connected successfully!"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Diagnostic route
app.get("/api/debug-db", async (req, res) => {
  try {
    const [database] = await db.query(
      "SELECT DATABASE() AS databaseName"
    );

    const [rows] = await db.query(
      "SELECT COUNT(*) AS totalRows FROM Rooms"
    );

    res.json({
      database: database[0].databaseName,
      roomsRows: rows[0].totalRows
    });
  } catch (error) {
    console.error("Database diagnostic error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Save preferences
app.post("/api/preferences", async (req, res) => {
  try {
    const {
      roomType,
      length,
      width,
      style,
      colour,
      budget
    } = req.body;

    if (!roomType || !length || !width || !style || !colour || !budget) {
      return res.status(400).json({
        success: false,
        message: "Please provide all preference details."
      });
    }

    const [result] = await db.execute(
      `INSERT INTO Rooms
       (room_type, length, width, style, colour, budget)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        roomType,
        Number(length),
        Number(width),
        style,
        colour,
        Number(budget)
      ]
    );

    res.status(201).json({
      success: true,
      message: "Preferences saved successfully!",
      roomId: result.insertId
    });

  } catch (error) {
    console.error("Preference saving error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to save preferences."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
