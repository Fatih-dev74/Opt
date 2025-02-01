const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000; // Port du serveur

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir les fichiers statiques (index.html inclus)
app.use(express.static(path.join(__dirname, "../")));

// Route pour la page d'accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html")); // Servir le fichier HTML
});

// Endpoint pour tester l'envoi d'e-mails
app.post("/submit-form", async (req, res) => {
  const { name, email, phone, location, link, agree } = req.body;

  // Vérifie si la case à cocher "agree" est cochée
  if (!agree) {
    return res.status(400).json({
      message: "Veuillez accepter les termes pour collaborer.",
    });
  }

  // Configurer le transporteur Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Adresse Gmail
      pass: process.env.EMAIL_PASS, // Mot de passe spécifique pour les applications
    },
  });

  // Définir les options de l'e-mail
  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER}>`, // Nom et adresse de l'expéditeur
    to: process.env.RECEIVER_EMAIL || "destinataire@exemple.com", // Adresse de destination
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
    // Envoyer l'e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé :", info.response);

    res.status(200).json({
      message: "Votre message a été envoyé avec succès. Merci pour votre collaboration",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error.message);
    res.status(500).json({
      message: "Erreur lors de l'envoi de l'email. Veuillez réessayer plus tard.",
      error: error.message,
    });
  }
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => console.log(`Serveur en cours d'exécution sur https://147.93.94.253:${PORT}`));
