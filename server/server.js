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
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: "https://optweare.com", // Autorise seulement ton site
    methods: "GET,POST,OPTIONS",
    allowedHeaders: "Origin, Content-Type, Accept"
}));

// ✅ Middleware CORS (permet les requêtes du frontend)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// ✅ Middleware pour lire JSON et formulaires
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Servir les fichiers statiques (CSS, JS, images)
app.use(express.static(path.join(__dirname, "../")));

// ✅ Route principale
app.get("/", (req, res) => {
    res.send("Serveur en ligne ! ✅");
});

// ✅ Endpoint du formulaire
app.post("/submit-form", async (req, res) => {
    const { name, email, phone, location, link, agree } = req.body;

    if (!agree) {
        return res.status(400).json({
            message: "Veuillez accepter les termes pour collaborer.",
        });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECEIVER_EMAIL) {
        console.error("❌ Erreur : Variables d'environnement SMTP manquantes.");
        return res.status(500).json({
            message: "Erreur de configuration du serveur. Veuillez contacter l'administrateur.",
        });
    }

    // ✅ Configuration de Nodemailer
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    try {
        await transporter.verify();
        console.log("✅ Connexion SMTP réussie !");
    } catch (err) {
        console.error("❌ Erreur de connexion SMTP :", err.message);
        return res.status(500).json({
            message: "Problème de connexion au serveur SMTP.",
            error: err.message,
        });
    }

    // ✅ Options de l'email
    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        to: process.env.RECEIVER_EMAIL,
        subject: `Nouvelle demande de collaboration de ${name}`,
        html: `
            <h3>Nouvelle demande de collaboration</h3>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Numéro de Téléphone :</strong> ${phone || "Non fourni"}</p>
            <p><strong>Localisation :</strong> ${location || "Non spécifiée"}</p>
            <p><strong>Lien Réseau :</strong> <a href="${link}" target="_blank">${link}</a></p>
            <p>Merci de considérer cette demande. Vous pouvez répondre directement à cet e-mail.</p>
        `,
        replyTo: email,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email envoyé :", info.response);
        res.status(200).json({ message: "Votre message a été envoyé avec succès." });
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi de l'email :", error.message);
        res.status(500).json({
            message: "Erreur lors de l'envoi de l'email. Veuillez réessayer plus tard.",
            error: error.message,
        });
    }
});

// ✅ Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur en ligne sur le port ${PORT}`);
});
