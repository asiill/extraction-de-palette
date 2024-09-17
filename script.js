const displayPalette = (colours) => {
    const palette = document.getElementById("palette");
    palette.textContent = "";

    colours.forEach(colour => {
        const colourBox = document.createElement("div");
        colourBox.classList.add("colour-box");
        colourBox.style.backgroundColor = `rgb(${colour})`;
        palette.appendChild(colourBox);
    });
};

const extractPalette = (data) => {
    // Nombre de couleurs les plus fréquentes à retourner
    const colourCount = 5;

    // Un objet stockant les occurrences de chaque couleur dans les données de pixels
    const colourMap = {};

    // Un tableau contenant les couleurs extraites, triées par ordre de fréquence
    const colours = [];

    for (let i = 0; i < data.length; i +=4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const rgb = `${r},${g},${b}`;

        if (colourMap[rgb]) {
            colourMap[rgb]++;
        } else {
            colourMap[rgb] = 1;
        }
    }

    // Object.entries(colourMap) renvoie un tableau de paires clé-valeur avec la valeur rgb et son compte
    // Le tableau est trié par ordre décroissant de fréquence
    const sorted = Object.entries(colourMap).sort((a, b) => b[1] - a[1]);

    // Obtenir les 5 couleurs les plus fréquentes
    for (let i = 0; i < colourCount && i < sorted.length; i++) {
        colours.push(sorted[i][0]);
    }

    return colours;
};

const uploadArea = document.querySelector('.border-dashed');
uploadArea.addEventListener('click', () => {
    imageInput.click();
});
const image = document.getElementById("imageInput");
imageInput.addEventListener("change", (e) => {

    // e.target.files est un objet FileList des fichiers sélectionnés par l'utilisateur
    // Récupérer le premier fichier de cette liste
    const file = e.target.files[0];

    if (!file) {
        return
    }

    // Créer un objet Image pour stocker les données de l'image
    const img = new Image();
    // Créer un objet FileReader pour lire le contenu du fichier
    const reader = new FileReader();

    // Obtenir l'URL de données du fichier lorsque le fichier est lu avec succès
    reader.onload = (e) => {
        img.src = e.target.result;
    }

    // Dessiner l'image sur l'élément "canvas" lorsqu'elle a fini de charger
    img.onload = () => {
        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");

        let drawWidth, drawHeight;

        //  Calculer les rapports d'aspect de l'image et du canvas
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;

        // Si l'image est plus large que le canvas
        if (imgRatio > canvasRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / canvasRatio;
        } else { // l'image est plus haute que le canvas
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
        }

        // Centrer l'image sur le canvas
        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;

        // Effacer le canvas et dessiner l'image sélectionnée sur le canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, x, y, drawWidth, drawHeight);

        // Obtenir les données de pixels du canvas
        // Cela renvoie un objet ImageData contenant les valeurs RGBA de chaque pixel
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // imageData.data contient les données de pixels de l'objet ImageData
        // Les données de pixels sont stockées sous forme de tableau 1d dans la forme [R, G, B, A, R, G, B, A, ...]
        // L'ordre se fait par lignes du pixel en haut à gauche au pixel en bas à droite
        const colours = extractPalette(imageData.data);

        // Afficher la palette
        displayPalette(colours);
    }
    
    // Lire le fichier
    // Cela déclenchera l'événement onload lorsque le fichier a été lu avec succès
    reader.readAsDataURL(file);
});