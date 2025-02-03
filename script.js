// ===== Blocage des versions tablette et desktop ===== //
document.addEventListener("DOMContentLoaded", function () {
    if (window.innerWidth >= 768) {
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #000;
                color: #fff;
                text-align: center;
                font-size: 1.5rem;
                padding: 20px;
            ">
                <p>⚠️ Ce site est actuellement disponible uniquement sur mobile. <br> Veuillez accéder via un smartphone.</p>
            </div>
        `;
    }
});

// ===== Gestion du formulaire ===== //

// Sélection des éléments du formulaire
const form = document.getElementById('collaboration-form');
const agreeCheckbox = document.getElementById('agree');
const submitButton = document.querySelector('.submit-button');
const formMessage = document.createElement('p'); // Élément pour afficher les messages
formMessage.style.marginTop = '10px';
formMessage.style.fontSize = '1rem';
formMessage.style.fontWeight = 'bold';
formMessage.style.textAlign = 'center'; // Centrer le texte du message
form.appendChild(formMessage); // Ajoute le message sous le formulaire

// Sélectionne uniquement les champs obligatoires (nom, email, lien réseau)
const requiredInputs = form.querySelectorAll('input[required]');

// Fonction pour vérifier si tous les champs obligatoires sont remplis
function checkFormCompletion() {
    let allFilled = true;

    // Vérifie que tous les champs obligatoires sont remplis
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            allFilled = false;
        }
    });

    // Active/désactive le bouton en fonction des conditions
    submitButton.disabled = !(allFilled && agreeCheckbox.checked);
}

// Ajoute des événements pour vérifier les champs et la case
requiredInputs.forEach(input => {
    input.addEventListener('input', checkFormCompletion);
});
agreeCheckbox.addEventListener('change', checkFormCompletion);

// Ajoute un événement de soumission pour gérer l'envoi via fetch
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Affiche un message de progression
    formMessage.textContent = "Envoi en cours...";
    formMessage.style.color = "#ffffff"; // Blanc pour le texte en cours d'envoi

    // Récupère les données du formulaire
    const formData = new FormData(form);
    const jsonData = Object.fromEntries(formData);

    try {
        // Envoie les données au serveur via fetch
        const response = await fetch("https://opt-backend-w7ff.onrender.com/submit-form", { 
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json'
            }
        });        

        if (!response.ok) {
            throw new Error(`Erreur serveur: ${response.status}`);
        }

        const data = await response.json(); // Récupère la réponse JSON
        formMessage.textContent = data.message || "Votre message a été envoyé avec succès !";
        formMessage.style.color = "#6ce49f"; // Couleur verte de succès

        // Réinitialise le formulaire après l'envoi
        form.reset();
        submitButton.disabled = true;

    } catch (error) {
        // Affiche un message d'erreur
        formMessage.textContent = "Erreur lors de l'envoi. Veuillez réessayer.";
        formMessage.style.color = "#ff3333"; // Couleur rouge pour l'erreur
        console.error("Erreur lors de la requête:", error);
    }
});

// ===== Gestion du menu burger ===== //

// Sélection des éléments du menu burger
const menuToggle = document.getElementById('menu-toggle');
const menuLinks = document.querySelectorAll('.nav-menu a');

// Fermer le menu burger après un clic sur un lien
menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.checked = false; // Décoche la case pour fermer le menu
    });
});
