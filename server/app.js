const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require("dotenv").config();
const app = express();
const axios = require("axios");

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const url = process.env.MONGO_URL;
console.log(url);
console.log('printing')
mongoose.connect(url)
    .then(() => {
        console.log('Mongoose Connected');
    }).catch(e => {
        console.error("Mongoose Not Connected", e);
    });



const multer = require('multer');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });






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
    cv : {
        type : String,
        require : false
    }
});

const application = mongoose.model("register", newSchema);

app.post("/submit", upload.single('cv'), async (req, res) => {
    const { name, email, number, country, jobTitle, message, 'g-recaptcha-response': token } = req.body;

    // ✅ Step 1: Check for reCAPTCHA token
    if (!token) {
        return res.status(400).send("reCAPTCHA token missing");
    }

    // ✅ Step 2: Verify with Google
    const secretKey = process.env.RECAPTCHA_SECRET; // Must be set in your .env or Vercel environment
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify`;

    try {
        const response = await axios.post(verifyURL, null, {
            params: {
                secret: secretKey,
                response: token
            }
        });

        if (!response.data.success) {
            return res.status(403).send("Failed reCAPTCHA verification");
        }

        // ✅ Step 3: Proceed to save application data
        const cvPath = req.file.path;

        const newData = new application({
            name,
            email,
            number,
            country,
            jobTitle,
            message,
            cv: cvPath
        });

        await newData.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error saving data or verifying reCAPTCHA:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
