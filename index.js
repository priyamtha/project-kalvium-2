const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json()); // Middleware to parse JSON

// Connect to MongoDB

const mongoURI = process.env.connect || "your_mongodb_atlas_connection_string_here";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));


// Define Schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
});

// Create Model
const MenuItem = mongoose.model("MenuItem", menuItemSchema);

// **POST /menu** - Add new menu item
app.post("/menu", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Name and Price are required" });
    }

    const newItem = new MenuItem({ name, description, price });
    await newItem.save();
    res.status(201).json({ message: "Menu item added successfully!", menuItem: newItem });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// **GET /menu** - Fetch all menu items
app.get("/menu", async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// **PUT /menu/:id** - Update a menu item
app.put("/menu/:id", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.status(200).json({ message: "Menu item updated successfully!", menuItem: updatedItem });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// **DELETE /menu/:id** - Delete a menu item
app.delete("/menu/:id", async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.status(200).json({ message: "Menu item deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
