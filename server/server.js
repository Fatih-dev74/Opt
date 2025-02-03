const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

console.log("📢 ENV CHARGÉ :");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "❌ Manquant");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✔️ Chargé" : "❌ Manquant");
console.log("RECEIVER_EMAIL:", process.env.RECEIVER_EMAIL || "❌ Manquant");

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ CONFIGURATION CORS : Autoriser uniquement ton frontend
app.use(cors({
    origin: "https://optweare.com", // Lien du frontend
    methods: "GET, POST, OPTIONS",
    allowedHeaders: ["Content-Type"],
    credentials: true
}));

// ✅ GESTION DES PRÉ-FLIGHT REQUESTS (OPTIONS)
app.options("*", cors()); 

// ✅ Middleware JSON
app.use(express.json());

// ✅ Middleware Static Files (si besoin)
app.use(express.static(path.join(__dirname, "../")));

// ✅ ROUTE PRINCIPALE TEST API
app.get("/test", (req, res) => {
    res.json({ message: "🚀 API OK", status: 200 });
});

// ✅ ROUTE SOUMISSION FORMULAIRE
app.post("/submit-form", async (req, res) => {
    console.log("📩 Requête reçue sur /submit-form");
    console.log("Données reçues :", req.body);

    const { name, email, phone, location, link, agree } = req.body;

    if (!agree) {
        return res.status(400).json({ message: "Veuillez accepter les termes pour collaborer." });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECEIVER_EMAIL) {
        console.error("❌ Erreur SMTP : Variables manquantes.");
        return res.status(500).json({ message: "Erreur de configuration du serveur." });
    }

    // ✅ CONFIGURATION SMTP NODEMAILER
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: { rejectUnauthorized: false },
    });

    try {
        await transporter.verify();
        console.log("✅ Connexion SMTP réussie !");
    } catch (err) {
        console.error("❌ Erreur SMTP :", err.message);
        return res.status(500).json({ message: "Problème avec SMTP." });
    }

    // ✅ CRÉATION EMAIL
    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        to: process.env.RECEIVER_EMAIL,
        subject: `Nouvelle demande de collaboration de ${name}`,
        html: `
            <h3>Nouvelle demande de collaboration</h3>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Téléphone :</strong> ${phone || "Non fourni"}</p>
            <p><strong>Localisation :</strong> ${location || "Non spécifiée"}</p>
            <p><strong>Lien Réseau :</strong> <a href="${link}" target="_blank">${link}</a></p>
        `,
        replyTo: email,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email envoyé :", info.response);
        res.status(200).json({ message: "Votre message a été envoyé avec succès." });
    } catch (error) {
        console.error("❌ Erreur d'envoi email :", error.message);
        res.status(500).json({ message: "Erreur d'envoi de l'email." });
    }
});

// ✅ DÉMARRAGE SERVEUR
app.listen(PORT, () => {
    console.log(`🚀 Serveur en ligne sur https://opt-backend-w7ff.onrender.com`);
});
