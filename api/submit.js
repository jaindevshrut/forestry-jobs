const mongoose = require('mongoose');
const multer = require('multer');
const { IncomingForm } = require('formidable');
const fs = require('fs');
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const newSchema = new mongoose.Schema({
    name: String,
    email: String,
    number: String,
    country: String,
    jobTitle: String,
    message: String,
    cv: String // Store only file URL
});

const Application = mongoose.model("register", newSchema);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: "Error parsing the form" });
        }

        const { name, email, number, country, jobTitle, message } = fields;
        const file = files.cv;

        if (!file) {
            return res.status(400).json({ error: "File upload required" });
        }

        // Upload file to a cloud storage (e.g., S3, Cloudinary)
        const fileUrl = `/uploads/${file.originalFilename}`; // Replace with cloud storage URL

        const newData = new Application({
            name,
            email,
            number,
            country,
            jobTitle,
            message,
            cv: fileUrl
        });

        try {
            await newData.save();
            return res.status(200).json({ message: "Application submitted successfully!" });
        } catch (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
}
