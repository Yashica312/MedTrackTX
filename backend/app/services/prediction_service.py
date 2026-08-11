import os
import torch
from PIL import Image
from torchvision import models, transforms

# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ============================================================
# PATH
# ============================================================

PROJECT_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )
    )
)

VIT_PATH = os.path.join(
    PROJECT_DIR,
    "ai_model",
    "vit_model.pth"
)

print("ViT path:", VIT_PATH)


# ============================================================
# CLASS NAMES
# ============================================================

CLASS_NAMES = [
    "akiec",
    "bcc",
    "bkl",
    "df",
    "mel",
    "nv",
    "vasc"
]


# ============================================================
# IMAGE TRANSFORM
# ============================================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# LOAD ViT MODEL
# ============================================================

def load_vit_model():

    model = models.vit_b_16(weights=None)

    model.heads.head = torch.nn.Linear(
        model.heads.head.in_features,
        7
    )

    checkpoint = torch.load(
        VIT_PATH,
        map_location=DEVICE
    )

    # Handle both normal state_dict and wrapped checkpoints
    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        checkpoint = checkpoint["state_dict"]

    model.load_state_dict(checkpoint)

    model = model.to(DEVICE)
    model.eval()

    return model


# Load once when backend starts
vit_model = load_vit_model()


# ============================================================
# PREDICT
# ============================================================

def predict_skin_lesion(image_path: str):

    image = Image.open(image_path).convert("RGB")

    image_tensor = transform(image)
    image_tensor = image_tensor.unsqueeze(0)
    image_tensor = image_tensor.to(DEVICE)

    with torch.no_grad():

        outputs = vit_model(image_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        confidence, predicted_index = torch.max(
            probabilities,
            dim=1
        )

    predicted_class = CLASS_NAMES[
        predicted_index.item()
    ]

    return {
        "prediction": predicted_class,
        "confidence": round(
            confidence.item(),
            4
        )
    }