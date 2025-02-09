const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 8080;

// Middleware to handle form data and JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Allows form data with multipart

const url = process.env.MONGO_URL;
console.log(url);
console.log('printing');
mongoose.connect(url)
    .then(() => {
        console.log('Mongoose Connected');
    }).catch(e => {
        console.error("Mongoose Not Connected", e);
    });

const static_path = path.join(__dirname, "/");
app.use(express.static(static_path));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/submit', (req, res) => {
    res.sendFile(path.join(__dirname, './submit.html'));
});

const newSchema = new mongoose.Schema({
    name: String,
    email: String,
    number: Number,
    country: String,
    jobTitle: String,
    message: String,
});


// Ensure model creation does not overwrite the existing one
const application = mongoose.models.applications || mongoose.model("applications", newSchema);

app.post("/api/submit", async (req, res) => {
    const { name, email, number, country, jobTitle, message } = req.body;

    console.log('Form Data:', req.body);  // Add this line to check if data is correctly coming through
    
    const newData = new application({
        name: name,
        email: email,
        number: number,
        country: country,
        jobTitle: jobTitle,
        message: message,
    });

    try {
        await newData.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
