
//2
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/photos", express.static(path.join(__dirname, "photos")));



// Connect to MongoDB
mongoose.connect( "mongodb://localhost:27017/bid_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});

// Define Schema and Model
const itemSchema = new mongoose.Schema({
    name: String,
    basePrice: Number,
    auctionDate: String,
    image: String,
});

const Item = mongoose.model("Item", itemSchema);

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    phone: String,
    DOB:String,
    password: String,
    country: String,
    state: String,
    district: String,
    pincode: String,
    mandal: String,
    village: String,
    street: String,
    photo:String,
});
const User = mongoose.model('User', userSchema);

//add
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save images to 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage: storage });

//add

//UserRoutes
const store = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'photos/');  // Store photos in 'uploads/photos' directory
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);  // Store the file with a unique timestamp
    },
  });
  
const up = multer({ storage: store });
app.post("/register", up.single("photo"), async (req, res) => {
    try {
        const { body } = req;
        const photoPath = req.file ? `/photos/${req.file.filename}` : null;
        const user = new User({ ...body, photo: photoPath });
        await user.save();
        res.status(201).json({ message: "Registration successful" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
});
//login api
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful' });
});

//userPhoto
 
//userPhoto
 
//UserRoutes

// API Endpoint to Fetch Items
app.get("/api/items", async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).send("Internal Server Error");
    }
});

//add
app.post("/api/sell", upload.single("image"), async (req, res) => {
    try {
        const { name, history, auctionDate, basePrice } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !history || !auctionDate || !basePrice || !image) {
            return res.status(400).send("All fields are required.");
        }

        const newItem = new Item({ name, history, auctionDate, basePrice, image });
        await newItem.save();
        res.status(201).send("Item added to auction successfully.");
    } catch (error) {
        console.error("Error adding item:", error);
        res.status(500).send("Internal Server Error.");
    }
});
//add

//delete
app.delete("/api/items/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`Attempting to delete item with id: ${id}`);

    try {
        // Find the item by id and delete it
        const item = await Item.findByIdAndDelete(id);

        if (!item) {
            console.log("Item not found");
            return res.status(404).send("Item not found.");
        }

        // Optional: Delete the image from the file system if it exists
        if (item.image) {
            const fs = require("fs");
            const imagePath = path.join(__dirname, "uploads", item.image.replace("/uploads/", ""));
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Error deleting the image file:", err);
                }
            });
        }

        console.log(`Item with id ${id} deleted successfully`);
        res.status(200).send("Item deleted successfully.");
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).send("Internal Server Error");
    }
});
//delete

//update
// API Endpoint to Update Item
app.put("/api/items/:id", upload.single("image"), async (req, res) => {
    const { id } = req.params;
    const { name, basePrice, auctionDate } = req.body;
    let image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // Find item and update it
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).send("Item not found.");
        }

        item.name = name;
        item.basePrice = basePrice;
        item.auctionDate = auctionDate;
        if (image) {
            item.image = image;  // Update the image if a new one is uploaded
        }

        await item.save();
        res.status(200).send("Item updated successfully.");
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).send("Internal Server Error");
    }
});
//update

// Start Server
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
