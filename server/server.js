const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

console.log("\uD83D\uDCE2 ENV CHARGÉ :");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "❌ Manquant");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✔️ Chargé" : "❌ Manquant");
console.log("RECEIVER_EMAIL:", process.env.RECEIVER_EMAIL || "❌ Manquant");

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Configuration CORS améliorée
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = ["https://optweare.com", "https://www.optweare.com"];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS bloqué"));
        }
    },
    methods: "GET, POST, OPTIONS",
    allowedHeaders: "Origin, Content-Type, Accept",
    credentials: true
};

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origin === "https://optweare.com") {
            callback(null, true);
        } else {
            callback(new Error("CORS bloqué"));
        }
    },
    methods: "GET, POST, OPTIONS",
    allowedHeaders: ["Content-Type"],
    credentials: true
}));

app.options("*", cors()); // Gère les requêtes preflight


// ✅ Middleware global CORS (résout les blocages mobiles et Firefox)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    res.header("Vary", "Origin"); // Important pour Firefox
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// ✅ Middleware JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Fichiers statiques
app.use(express.static(path.join(__dirname, "../")));

// ✅ Route de test
app.get("/test", (req, res) => {
    res.json({ message: "🚀 API OK", status: 200 });
});

// ✅ Route soumission formulaire
app.post("/submit-form", async (req, res) => {
    try {
        console.log("📩 Nouvelle requête reçue sur /submit-form");
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
            return res.status(500).json({ message: "Problème avec SMTP.", error: err.message });
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
            console.error(error); // Ajoute cette ligne pour voir plus de détails
            res.status(500).json({ message: "Erreur d'envoi de l'email." });
        }
    } catch (err) {
        console.error("❌ Erreur inattendue :", err);
        res.status(500).json({ message: "Une erreur est survenue." });
    }
});

// ✅ Démarrage serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur en ligne sur https://opt-backend-w7ff.onrender.com`);
});
