const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS)),
});

const db = admin.firestore();

const SECRET_KEY = process.env.JWT_SECRET || "supersecret";

// User registration
app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("users").doc(email).set({
        email,
        password: hashedPassword,
    });

    res.json({ message: "User registered!" });
});

// User login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return res.status(400).json({ message: "User not found!" });

    const userData = userDoc.data();
    const isValid = await bcrypt.compare(password, userData.password);

    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

// Save diary entry
app.post("/diary", async (req, res) => {
    const { token, entry } = req.body;
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const email = decoded.email;

        await db.collection("diary").add({
            email,
            entry,
            timestamp: new Date(),
        });

        res.json({ message: "Diary entry saved!" });
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
});

// Fetch diary entries
app.get("/diary", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const email = decoded.email;

        const entries = await db.collection("diary").where("email", "==", email).get();
        const data = entries.docs.map(doc => doc.data());

        res.json(data);
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
