// ===== Gestion du formulaire ===== //
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

// Ajoute un événement de soumission pour gérer l'envoi via le formulaire
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Affiche un message de progression
    formMessage.textContent = "Envoi en cours...";  
    formMessage.style.color = "#ffffff"; 

    // Soumettre le formulaire avec les données
    form.submit();
});
