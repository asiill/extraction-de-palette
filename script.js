let isImageLoaded = false;
let imageData;
let colourCount = 5;

const image = document.getElementById("imageInput");

let uploadArea = document.querySelector(".upload-area");
uploadArea.addEventListener("click", () => {
    imageInput.click();
});

const createNotification = (message) => {
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
};

const rgbToHex = (r, g, b) => {
    // Assurez-vous que les valeurs sont entre 0 et 255
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // Convertissez chaque composant en hexadécimal et
    // remplissez les valeurs hexadécimales avec des zéros non significatifs si nécessaire pour qu'il s'agit de deux chiffres
    const hexR = r.toString(16).padStart(2, "0");
    const hexG = g.toString(16).padStart(2, "0");
    const hexB = b.toString(16).padStart(2, "0");

    return `#${hexR}${hexG}${hexB}`;
};

const displayPalette = (colours) => {
    const palette = document.getElementById("palette");
    palette.textContent = "";

    colours.forEach(colour => {
        const rgb = colour.split(",");
        const hexCode = rgbToHex(rgb[0], rgb[1], rgb[2]);

        const colourBox = document.createElement("div");
        colourBox.classList.add("colour-box");
        colourBox.style.backgroundColor = `rgb(${colour})`;

        const colourCode = document.createElement("div");
        colourCode.classList.add("colour-code");
        colourCode.textContent = hexCode;

        colourBox.addEventListener("click", () => {
            const text = colourCode.textContent;
            navigator.clipboard.writeText(text)
                .then(() => {
                    createNotification("Copied to clipboard");
                })
                .catch(err => {
                    console.error("Failed to copy: ", err);
                });
        });

        colourBox.appendChild(colourCode);

        palette.appendChild(colourBox);
    });
};

const colourDistance = (rgb1, rgb2) => {
    const [r1, g1, b1] = rgb1.split(",").map(Number);
    const [r2, g2, b2] = rgb2.split(",").map(Number);
    
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
};

const extractPalette = (data) => {
    // Un tableau pour stocker les couleurs uniques
    let colourSet = [];

    // Un tableau contenant les couleurs finales
    let colours = [];

    const minDistance = 100;

    for (let i = 0; i < data.length; i +=4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const rgb = `${r},${g},${b}`;

        let isDiffEnough = true;

        for (const existingColour of colourSet) {
            if (colourDistance(rgb, existingColour) < minDistance) {
                isDiffEnough = false;
                break;
            }
        }

        if (isDiffEnough) {
            colourSet.push(rgb);
        }
    }

    colours = colourSet.slice(0, colourCount);

    return colours;
};

const drawImageToCanvas = (img) => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    const maxWidth = 300;
    const maxHeight = 300;

    let drawWidth, drawHeight;

    // Calculer le rapport hauteur/largeur
    const imgRatio = img.width / img.height;

    if (img.width > img.height) {
        // Orientation paysage
        drawWidth = Math.min(maxWidth, img.width);
        drawHeight = drawWidth / imgRatio;
        if (drawHeight > maxHeight) {
            drawHeight = maxHeight;
            drawWidth = drawHeight * imgRatio;
        }
    } else {
        // Orientation portrait
        drawHeight = Math.min(maxHeight, img.height);
        drawWidth = drawHeight * imgRatio;
        if (drawWidth > maxWidth) {
            drawWidth = maxWidth;
            drawHeight = drawWidth / imgRatio;
        }
    }

    // Définir les dimensions pour le canvas
    canvas.width = drawWidth;
    canvas.height = drawHeight;

    let x = 0; 
    let y = 0;

    // Effacer le canvas et dessiner l'image sélectionnée sur le canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, x, y, drawWidth, drawHeight);

    isImageLoaded = true;
    document.querySelector(".upload-area").style.display = "none";
    canvas.addEventListener("click", () => {
        imageInput.click();
    });

    // Obtenir les données de pixels du canvas
    // Cela renvoie un objet ImageData contenant les valeurs RGBA de chaque pixel
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // imageData.data contient les données de pixels de l'objet ImageData
    // Les données de pixels sont stockées sous forme de tableau 1d dans la forme [R, G, B, A, R, G, B, A, ...]
    // L'ordre se fait par lignes du pixel en haut à gauche au pixel en bas à droite
    const colours = extractPalette(imageData.data);

    // Afficher la palette
    displayPalette(colours);
};

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
        drawImageToCanvas(img);
    }
    
    // Lire le fichier
    // Cela déclenchera l'événement onload lorsque le fichier a été lu avec succès
    reader.readAsDataURL(file);
});