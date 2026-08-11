import os
import cv2
import numpy as np
import torch
from PIL import Image

from app.services.prediction_service import (
    vit_model,
    transform,
    DEVICE
)


# ============================================================
# ViT Grad-CAM
# ============================================================

def generate_gradcam(image_path: str):

    # Load image
    original = Image.open(image_path).convert("RGB")

    original_np = np.array(original)

    # Preprocess
    input_tensor = transform(original)
    input_tensor = input_tensor.unsqueeze(0).to(DEVICE)

    # Store activations and gradients
    activations = []
    gradients = []

    # ViT encoder final normalization layer
    target_layer = vit_model.encoder.ln

    def forward_hook(module, input, output):
        activations.append(output)

    def backward_hook(module, grad_input, grad_output):
        gradients.append(grad_output[0])

    forward_handle = target_layer.register_forward_hook(
        forward_hook
    )

    backward_handle = target_layer.register_full_backward_hook(
        backward_hook
    )

    try:

        vit_model.zero_grad()

        output = vit_model(input_tensor)

        predicted_class = output.argmax(
            dim=1
        ).item()

        score = output[
            0,
            predicted_class
        ]

        score.backward()

        activation = activations[0]
        gradient = gradients[0]

        # Remove CLS token
        activation = activation[:, 1:, :]
        gradient = gradient[:, 1:, :]

        # Global average pooling of gradients
        weights = gradient.mean(
            dim=1,
            keepdim=True
        )

        cam = (
            weights * activation
        ).sum(dim=2)

        cam = torch.relu(cam)

        # Reshape 196 patches -> 14 x 14
        cam = cam.reshape(
            14,
            14
        )

        cam = cam.detach().cpu().numpy()

        # Normalize
        cam = cam - cam.min()

        if cam.max() > 0:
            cam = cam / cam.max()

        # Resize to original image
        cam = cv2.resize(
            cam,
            (
                original_np.shape[1],
                original_np.shape[0]
            )
        )

        # Heatmap
        heatmap = np.uint8(
            255 * cam
        )

        heatmap = cv2.applyColorMap(
            heatmap,
            cv2.COLORMAP_JET
        )

        heatmap = cv2.cvtColor(
            heatmap,
            cv2.COLOR_BGR2RGB
        )

        # Overlay
        overlay = cv2.addWeighted(
            original_np,
            0.6,
            heatmap,
            0.4,
            0
        )

        return {
            "predicted_class": predicted_class,
            "heatmap": heatmap,
            "overlay": overlay
        }

    finally:

        forward_handle.remove()
        backward_handle.remove()