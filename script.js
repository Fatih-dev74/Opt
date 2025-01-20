// ===== Gestion du formulaire ===== //

// Sélection des éléments du formulaire
const form = document.getElementById('collaboration-form');
const agreeCheckbox = document.getElementById('agree');
const submitButton = document.querySelector('.submit-button');

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
    if (allFilled && agreeCheckbox.checked) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}

// Ajoute des événements pour vérifier les champs et la case
requiredInputs.forEach(input => {
    input.addEventListener('input', checkFormCompletion);
});
agreeCheckbox.addEventListener('change', checkFormCompletion);

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
