import os

import torch
import torch.nn as nn

from PIL import Image

import numpy as np

from torchvision import transforms


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# MODEL PATH
# ============================================================

CURRENT_FILE = os.path.abspath(__file__)

PROJECT_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(CURRENT_FILE)
        )
    )
)

UNET_PATH = os.path.join(
    PROJECT_DIR,
    "ai_model",
    "unet_model.pth"
)


# ============================================================
# U-NET BUILDING BLOCK
# ============================================================

class DoubleConv(nn.Module):

    def __init__(
        self,
        in_channels,
        out_channels
    ):

        super().__init__()

        self.conv = nn.Sequential(

            nn.Conv2d(
                in_channels,
                out_channels,
                kernel_size=3,
                padding=1
            ),

            nn.BatchNorm2d(
                out_channels
            ),

            nn.ReLU(
                inplace=True
            ),

            nn.Conv2d(
                out_channels,
                out_channels,
                kernel_size=3,
                padding=1
            ),

            nn.BatchNorm2d(
                out_channels
            ),

            nn.ReLU(
                inplace=True
            )
        )

    def forward(self, x):

        return self.conv(x)


# ============================================================
# U-NET MODEL
# ============================================================

class UNet(nn.Module):

    def __init__(self):

        super().__init__()

        # -----------------------------
        # Encoder
        # -----------------------------

        self.enc1 = DoubleConv(
            3,
            64
        )

        self.enc2 = DoubleConv(
            64,
            128
        )

        self.enc3 = DoubleConv(
            128,
            256
        )

        # -----------------------------
        # Bottleneck
        # -----------------------------

        self.bottleneck = DoubleConv(
            256,
            512
        )

        # -----------------------------
        # Pooling
        # -----------------------------

        self.pool = nn.MaxPool2d(
            kernel_size=2,
            stride=2
        )

        # -----------------------------
        # Decoder
        # -----------------------------

        self.up3 = nn.ModuleDict({

            "up": nn.ConvTranspose2d(
                512,
                256,
                kernel_size=2,
                stride=2
            ),

            "conv": DoubleConv(
                512,
                256
            )
        })

        self.up2 = nn.ModuleDict({

            "up": nn.ConvTranspose2d(
                256,
                128,
                kernel_size=2,
                stride=2
            ),

            "conv": DoubleConv(
                256,
                128
            )
        })

        self.up1 = nn.ModuleDict({

            "up": nn.ConvTranspose2d(
                128,
                64,
                kernel_size=2,
                stride=2
            ),

            "conv": DoubleConv(
                128,
                64
            )
        })

        # -----------------------------
        # Final layer
        # -----------------------------

        self.final = nn.Conv2d(
            64,
            1,
            kernel_size=1
        )


    def forward(self, x):

        # ====================================================
        # ENCODER
        # ====================================================

        e1 = self.enc1(x)

        p1 = self.pool(e1)


        e2 = self.enc2(p1)

        p2 = self.pool(e2)


        e3 = self.enc3(p2)

        p3 = self.pool(e3)


        # ====================================================
        # BOTTLENECK
        # ====================================================

        b = self.bottleneck(p3)


        # ====================================================
        # DECODER
        # ====================================================

        d3 = self.up3["up"](b)

        d3 = torch.cat(
            [d3, e3],
            dim=1
        )

        d3 = self.up3["conv"](d3)


        d2 = self.up2["up"](d3)

        d2 = torch.cat(
            [d2, e2],
            dim=1
        )

        d2 = self.up2["conv"](d2)


        d1 = self.up1["up"](d2)

        d1 = torch.cat(
            [d1, e1],
            dim=1
        )

        d1 = self.up1["conv"](d1)


        # ====================================================
        # OUTPUT
        # ====================================================

        return self.final(d1)


# ============================================================
# LOAD MODEL
# ============================================================

def load_unet():

    print()
    print("=" * 60)
    print("Loading U-Net model...")
    print("=" * 60)

    print(
        "Model path:",
        UNET_PATH
    )

    if not os.path.exists(
        UNET_PATH
    ):

        raise FileNotFoundError(
            f"U-Net model not found: {UNET_PATH}"
        )

    model = UNet()


    checkpoint = torch.load(
        UNET_PATH,
        map_location=DEVICE
    )


    # --------------------------------------------------------
    # Handle checkpoint formats
    # --------------------------------------------------------

    if (
        isinstance(checkpoint, dict)
        and
        "state_dict" in checkpoint
    ):

        checkpoint = checkpoint[
            "state_dict"
        ]


    # Remove possible "module." prefix
    cleaned_checkpoint = {}

    for key, value in checkpoint.items():

        new_key = key

        if new_key.startswith(
            "module."
        ):

            new_key = new_key[
                7:
            ]

        cleaned_checkpoint[
            new_key
        ] = value


    model.load_state_dict(
        cleaned_checkpoint,
        strict=True
    )


    model = model.to(
        DEVICE
    )

    model.eval()


    print(
        "U-Net loaded successfully."
    )

    print(
        "Device:",
        DEVICE
    )

    print(
        "=" * 60
    )

    return model


# ============================================================
# GLOBAL MODEL
# ============================================================

unet_model = load_unet()


# ============================================================
# IMAGE TRANSFORM
# ============================================================

transform = transforms.Compose([

    transforms.Resize(
        (256, 256)
    ),

    transforms.ToTensor()

])


# ============================================================
# SEGMENTATION
# ============================================================

def segment_lesion(
    image_path: str
):

    print()
    print(
        "-" * 60
    )

    print(
        "Running U-Net segmentation..."
    )

    print(
        "Image:",
        image_path
    )


    # ========================================================
    # LOAD IMAGE
    # ========================================================

    image = Image.open(
        image_path
    ).convert(
        "RGB"
    )


    original_size = image.size


    # ========================================================
    # PREPROCESS
    # ========================================================

    image_tensor = transform(
        image
    )


    image_tensor = image_tensor.unsqueeze(
        0
    )


    image_tensor = image_tensor.to(
        DEVICE
    )


    # ========================================================
    # MODEL INFERENCE
    # ========================================================

    with torch.no_grad():

        output = unet_model(
            image_tensor
        )


        probability = torch.sigmoid(
            output
        )


    # ========================================================
    # DEBUG MODEL OUTPUT
    # ========================================================

    prob_min = float(
        probability.min().item()
    )

    prob_max = float(
        probability.max().item()
    )

    prob_mean = float(
        probability.mean().item()
    )


    print(
        "Probability MIN:",
        round(prob_min, 6)
    )

    print(
        "Probability MAX:",
        round(prob_max, 6)
    )

    print(
        "Probability MEAN:",
        round(prob_mean, 6)
    )


    # ========================================================
    # CREATE MASK
    # ========================================================
    #
    # Previous threshold:
    #
    # probability > 0.5
    #
    # This can easily produce a completely black
    # mask when the model probabilities are lower.
    #
    # We use a more practical inference threshold.
    #
    # ========================================================

    threshold = 0.35


    mask = (
        probability >= threshold
    ).float()


    # ========================================================
    # CHECK MASK
    # ========================================================

    mask_pixels = int(
        mask.sum().item()
    )

    total_pixels = int(
        mask.numel()
    )


    mask_percentage = (
        mask_pixels
        /
        total_pixels
        *
        100
    )


    print(
        "Threshold:",
        threshold
    )

    print(
        "Mask pixels:",
        mask_pixels
    )

    print(
        "Mask coverage:",
        round(
            mask_percentage,
            2
        ),
        "%"
    )


    # ========================================================
    # FALLBACK FOR VERY LOW MODEL OUTPUT
    # ========================================================

    if (
        mask_pixels == 0
        and
        prob_max > 0.05
    ):

        print(
            "Standard threshold produced empty mask."
        )

        print(
            "Applying adaptive threshold..."
        )


        # Use 75th percentile as adaptive threshold
        probability_np = (
            probability
            .squeeze()
            .cpu()
            .numpy()
        )


        adaptive_threshold = float(
            np.percentile(
                probability_np,
                75
            )
        )


        # Prevent an unusably high threshold
        adaptive_threshold = min(
            adaptive_threshold,
            0.35
        )


        print(
            "Adaptive threshold:",
            round(
                adaptive_threshold,
                6
            )
        )


        mask = (
            probability_np
            >= adaptive_threshold
        ).astype(
            np.uint8
        )


    else:

        mask = (
            mask
            .squeeze()
            .cpu()
            .numpy()
            .astype(
                np.uint8
            )
        )


    # ========================================================
    # CONVERT TO 0-255
    # ========================================================

    mask = (
        mask
        *
        255
    ).astype(
        np.uint8
    )


    # ========================================================
    # REMOVE SMALL NOISE
    # ========================================================

    try:

        import cv2


        kernel = np.ones(
            (3, 3),
            np.uint8
        )


        mask = cv2.morphologyEx(
            mask,
            cv2.MORPH_OPEN,
            kernel
        )


        mask = cv2.morphologyEx(
            mask,
            cv2.MORPH_CLOSE,
            kernel
        )


    except Exception:

        pass


    # ========================================================
    # RESIZE TO ORIGINAL IMAGE SIZE
    # ========================================================

    mask_image = Image.fromarray(
        mask
    )


    mask_image = mask_image.resize(
        original_size,
        Image.Resampling.NEAREST
    )


    # ========================================================
    # FINAL CHECK
    # ========================================================

    final_array = np.array(
        mask_image
    )


    final_pixels = int(
        np.count_nonzero(
            final_array
        )
    )


    final_percentage = (
        final_pixels
        /
        final_array.size
        *
        100
    )


    print(
        "Final mask coverage:",
        round(
            final_percentage,
            2
        ),
        "%"
    )


    if final_pixels == 0:

        print(
            "WARNING: U-Net produced an empty mask."
        )

    else:

        print(
            "U-Net segmentation mask generated successfully."
        )


    print(
        "-" * 60
    )


    return mask_image