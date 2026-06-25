// Configuration
const MODEL_URL = "./model/";

// State
let model, webcam, maxPredictions;
let isWebcamActive = false;

// DOM Elements
const webcamBtn = document.getElementById('webcam-btn');
const imageUpload = document.getElementById('image-upload');
const webcamContainer = document.getElementById('webcam-container');
const uploadedImage = document.getElementById('uploaded-image');
const placeholder = document.getElementById('placeholder');
const labelContainer = document.getElementById('label-container');

// SVG Icons for buttons to keep UI updated
const webcamIconPlay = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;
const webcamIconStop = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect></svg>`;

// Initialize the Teachable Machine image model
async function initModel() {
    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        createResultPlaceholders();
    } catch (e) {
        console.error("Error loading the model:", e);
        labelContainer.innerHTML = `<p style="color: #ef4444; font-size: 14px; text-align: center;">Error loading model. Please ensure you are running a local server (e.g. Live Server or python -m http.server) and the model files exist in the './model/' directory.</p>`;
    }
}

// Create initial UI for prediction results
function createResultPlaceholders() {
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
        const item = document.createElement("div");
        item.className = "prediction-item";

        item.innerHTML = `
            <div class="prediction-info">
                <span class="prediction-label">-</span>
                <span class="prediction-score">0%</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        `;
        labelContainer.appendChild(item);
    }
}

// Toggle webcam state
async function toggleWebcam() {
    if (isWebcamActive) {
        await stopWebcam();
    } else {
        await startWebcam();
    }
}

// Start webcam
async function startWebcam() {
    if (!model) await initModel();
    if (!model) return; // If model failed to load

    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip);

    try {
        await webcam.setup();
        await webcam.play();
        window.requestAnimationFrame(webcamLoop);

        webcamContainer.innerHTML = ''; // Clear previous canvas if any
        webcamContainer.appendChild(webcam.canvas);

        // Update UI state
        webcamContainer.classList.remove('hidden');
        uploadedImage.classList.add('hidden');
        placeholder.classList.add('hidden');

        webcamBtn.innerHTML = `${webcamIconStop} Stop Webcam`;
        webcamBtn.classList.replace('btn-primary', 'btn-secondary');
        isWebcamActive = true;
    } catch (e) {
        console.error("Webcam setup failed:", e);
        alert("Failed to access the webcam. Please ensure you have granted camera permissions.");
    }
}

// Stop webcam
async function stopWebcam() {
    if (webcam) {
        webcam.stop();

        // Update UI state
        webcamContainer.classList.add('hidden');
        placeholder.classList.remove('hidden');

        webcamBtn.innerHTML = `${webcamIconPlay} Start Webcam`;
        webcamBtn.classList.replace('btn-secondary', 'btn-primary');
        isWebcamActive = false;

        resetResults();
    }
}

// Continuous webcam loop for predictions
async function webcamLoop() {
    if (isWebcamActive) {
        webcam.update();
        await predict(webcam.canvas);
        window.requestAnimationFrame(webcamLoop);
    }
}

// Run prediction on an image element or canvas
async function predict(imageElement) {
    if (!model) return;

    const prediction = await model.predict(imageElement);
    updateResultsUI(prediction);
}

// Update the result bars with prediction data
function updateResultsUI(prediction) {
    // Sort predictions by probability descending for better UX
    const sortedPredictions = [...prediction].sort((a, b) => b.probability - a.probability);

    for (let i = 0; i < maxPredictions; i++) {
        const item = labelContainer.childNodes[i];
        const p = sortedPredictions[i];
        const probabilityPercent = (p.probability * 100).toFixed(1);

        item.querySelector('.prediction-label').innerText = p.className;
        item.querySelector('.prediction-score').innerText = `${probabilityPercent}%`;
        item.querySelector('.progress-fill').style.width = `${probabilityPercent}%`;

        // Change color of the progress bar based on confidence
        const fill = item.querySelector('.progress-fill');
        if (p.probability > 0.7) {
            fill.style.backgroundColor = '#10b981'; // Green for high confidence
        } else if (p.probability > 0.4) {
            fill.style.backgroundColor = '#f59e0b'; // Yellow/Orange for medium
        } else {
            fill.style.backgroundColor = '#94a3b8'; // Gray for low
        }
    }
}

// Reset results to 0%
function resetResults() {
    if (!maxPredictions) return;
    for (let i = 0; i < maxPredictions; i++) {
        const item = labelContainer.childNodes[i];
        item.querySelector('.prediction-label').innerText = "-";
        item.querySelector('.prediction-score').innerText = "0%";
        const fill = item.querySelector('.progress-fill');
        fill.style.width = "0%";
        fill.style.backgroundColor = 'var(--primary)';
    }
}

// Handle file upload
imageUpload.addEventListener('change', async (e) => {
    if (isWebcamActive) {
        await stopWebcam();
    }

    const file = e.target.files[0];
    if (file) {
        if (!model) await initModel();
        if (!model) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            uploadedImage.src = event.target.result;
            uploadedImage.onload = async function () {
                // Update UI state
                uploadedImage.classList.remove('hidden');
                webcamContainer.classList.add('hidden');
                placeholder.classList.add('hidden');

                // Run prediction on uploaded image
                await predict(uploadedImage);
            }
        }
        reader.readAsDataURL(file);
    }
});

// Event Listeners
webcamBtn.addEventListener('click', toggleWebcam);

// Initialize model on load
window.addEventListener('DOMContentLoaded', initModel);
