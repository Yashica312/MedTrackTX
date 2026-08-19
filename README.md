**MedTrackTX 🩺**

AI-Powered Skin Lesion Evolution Tracking Using Temporal Dermoscopic
Imaging

MedTrackTX is an AI-assisted healthcare system for monitoring skin
lesions across multiple patient visits. It combines U-Net
segmentation, Vision Transformer (ViT-B/16) classification,
Grad-CAM explainability, ABCDE-based image analysis, and
temporal lesion comparison to analyse how a lesion changes over
time.

Note: MedTrackTX is an academic/research prototype and is not
intended to replace professional medical diagnosis.

**Features**

-> Lesion Segmentation using U-Net

-> 7-Class Lesion Classification using ViT-B/16

-> Grad-CAM Explainability for model predictions

-> Lesion Measurements --- area, diameter, perimeter,circularity,Color Analysis

-> ABCDE-Oriented Analysis

-> Previous vs Current Visit Comparison

-> Lesion Evolution Analysis

-> Automated JSON/Text Reports

-> FastAPI Backend + JWT Authentication

-> PostgreSQL Database

-> React Frontend

System Architecture

                    React Frontend
                          │
                          ▼
                    FastAPI Backend
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
        PostgreSQL Database       AI Pipeline
                                      │
                     ┌────────────────┼────────────────┐
                     ▼                ▼                ▼
                  U-Net              ViT           Grad-CAM
                Segmentation     Classification    Explainability
                     │                │                │
                     └────────────────┼────────────────┘
                                      ▼
                             ABCDE + Measurements
                                      │
                                      ▼
                             Temporal Comparison
                                      │
                                      ▼
                              Clinical Report

AI Pipeline

Dermoscopic Image

       ↓
Preprocessing

       ↓
U-Net Segmentation

       ↓
ViT-B/16 Classification

       ↓
Lesion Measurements

       ↓
ABCDE Analysis

       ↓
Grad-CAM

       ↓
Previous vs Current Visit

       ↓
Evolution Analysis

       ↓
Report Generation


**Models**

Component          Model / Method

Segmentation        U-Net
Classification      Vision Transformer (ViT-B/16)
Explainability      Grad-CAM
Temporal Analysis   Previous/current lesion comparison
Clinical Features   ABCDE-oriented image analysis

**Datasets**

HAM10000

Used for model development and classification training.

10,015 images

Training: 8,012

Validation: 1,001

Test: 1,002

Seven lesion classes

ISIC 2019

Used as an independent evaluation dataset for the trained ViT
classifier.

24,703 evaluation images

Model evaluated without retraining on ISIC 2019

Public datasets do not provide complete longitudinal patient
histories, so the current temporal module compares images supplied as
previous and current visits.

**Performance**

ISIC 2019 Evaluation

Metric                     Result

Accuracy               68.92%
Weighted Precision     70.35%
Weighted Recall        68.92%
Weighted F1            67.46%
Evaluation Images      24,703

**Training**

ViT-B/16 - Epochs: 20 - Batch size: 32 - Optimizer: AdamW - Best
validation loss: 0.4726

U-Net - Input: 256 × 256 - Epochs: 20 - Batch size: 16 - Loss: BCE +
Dice - Optimizer: AdamW - Best validation loss: 0.2311

The current notebooks do not report a final HAM10000 test accuracy or
final U-Net test Dice/IoU, so those metrics are intentionally not
claimed here.

**Tech Stack**

AI/ML: Python, PyTorch, Torchvision, ViT, U-Net, OpenCV, NumPy,
Pandas, Scikit-learn, Grad-CAM

Backend: FastAPI, SQLAlchemy, PostgreSQL, JWT

Frontend: React

Reports: ReportLab, JSON

Development: Kaggle Notebooks, Google Colab, Git, GitHub

**Project Structure**

MedTrack-TX/
│
├── frontend/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   └── ...
│
├── notebooks/
│   ├── 01_Data_Preprocessing.ipynb
│   ├── 2-u-net-model.ipynb
│   ├── 03-visiontransformer-classification-kaggle-ipynb.ipynb
│   ├── 04_MedTrackTX_AI_Pipeline.ipynb
│   └── 05-isic-evaluation-ipynb.ipynb
│
├── models/
│   ├── unet_model.pth
│   └── vit_model.pth
│
├── reports/
│
├── requirements.txt
└── README.md

**Getting Started**

**1. Clone the Repository**

git clone https://github.com/VSreeHarshitha/MedTrack-TX.git
cd MedTrack-TX

**2. Backend Setup**

Make sure Python 3.x and PostgreSQL are installed.

cd backend
python -m venv venv

Windows

venv\Scripts\activate

macOS/Linux

source venv/bin/activate

Install dependencies:

pip install -r ../requirements.txt

Configure the PostgreSQL database and the required environment variables
used by the backend.

Then start FastAPI:

uvicorn main:app --reload

Backend API:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs

**3. Frontend Setup**

Open a new terminal:

cd frontend
npm install

Start the React development server:

npm run dev

Open the URL displayed by Vite in the terminal.

Make sure the frontend API configuration points to the running FastAPI
backend.
**
4. Database Setup**

Create a PostgreSQL database for MedTrackTX.

Configure the backend database connection using environment variables
rather than committing credentials to GitHub.

**Example:**

DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_secret_key

Do not commit .env files or database passwords to the repository.

**Running the AI Notebooks**

The model-development notebooks are primarily intended for Kaggle
Notebook / notebook environments.

**Data preprocessing
**
01_Data_Preprocessing.ipynb

Prepares HAM10000 metadata, labels, image paths, splits, datasets, and
dataloaders.

U-Net

2-u-net-model.ipynb

Trains the lesion segmentation model and produces:

unet_model.pth

Vision Transformer

03-visiontransformer-classification-kaggle-ipynb.ipynb

Trains the ViT-B/16 seven-class classifier on HAM10000 and produces:

vit_model.pth

Complete AI Pipeline

04_MedTrackTX_AI_Pipeline.ipynb

Runs:

Image
 ↓
Segmentation
 ↓
Classification
 ↓
Grad-CAM
 ↓
ABCDE Analysis
 ↓
Temporal Comparison
 ↓
Report

ISIC Evaluation

05-isic-evaluation-ipynb.ipynb

Evaluates the trained ViT model on ISIC 2019 and generates
classification metrics and a confusion matrix.

**Generated Outputs**

The pipeline can generate:

Predicted lesion class

Prediction confidence

Class probabilities

Lesion segmentation mask

Lesion measurements

Grad-CAM visualization

Previous/current lesion-area comparison

Evolution status

medtrack_analysis.json

MedTrackTX_Report.txt

**ABCDE Analysis**

Feature               Analysis

A --- Asymmetry   Mask-based asymmetry measurement
B --- Border      Contour/circularity-based analysis
C --- Color       Mean color and color variation
D --- Diameter    Approximate diameter from lesion bounding box
E --- Evolution   Change in lesion area between visits

**Limitations**

Public datasets do not contain complete longitudinal patient
histories.

Temporal analysis currently compares previous and current visit
images rather than training a dedicated temporal sequence model.

Lesion measurements depend on segmentation quality and image
acquisition conditions.

Diameter is measured in pixels unless image calibration is
available.

ABCDE outputs are image-derived measurements and are not a complete
clinical assessment.

The current notebooks do not provide final HAM10000 test accuracy or
U-Net test Dice/IoU.

Independent ISIC performance is lower than the training-domain
performance, indicating dataset/domain differences.

**Future Scope**

Real longitudinal clinical datasets

Improved image registration between visits

More advanced temporal modelling

Better lesion growth/change quantification

Calibrated physical lesion measurements

Enhanced ABCDE scoring

Clinical dashboard improvements

Broader cross-dataset validation

Hospital/clinical system integration

Containerized deployment

**Author**

Vakkantham Sree Harshitha

B.Tech --- Artificial Intelligence & Machine Learning

GitHub: VSreeHarshitha

**License**

License information can be added once the repository's open-source
licensing choice is finalized.

**Disclaimer**

MedTrackTX is an academic/research project for AI-assisted skin lesion
monitoring.

It does not provide a medical diagnosis and should not be used as a
substitute for evaluation or treatment by a qualified healthcare
professional.
