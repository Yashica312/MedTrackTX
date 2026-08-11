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

    def __init__(self, in_channels, out_channels):

        super().__init__()

        self.conv = nn.Sequential(

            nn.Conv2d(
                in_channels,
                out_channels,
                kernel_size=3,
                padding=1
            ),

            nn.BatchNorm2d(out_channels),

            nn.ReLU(inplace=True),

            nn.Conv2d(
                out_channels,
                out_channels,
                kernel_size=3,
                padding=1
            ),

            nn.BatchNorm2d(out_channels),

            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.conv(x)


# ============================================================
# U-NET
# ============================================================

class UNet(nn.Module):

    def __init__(self):

        super().__init__()

        # Encoder
        self.enc1 = DoubleConv(3, 64)
        self.enc2 = DoubleConv(64, 128)
        self.enc3 = DoubleConv(128, 256)

        # Bottleneck
        self.bottleneck = DoubleConv(256, 512)

        # Pooling
        self.pool = nn.MaxPool2d(
            kernel_size=2,
            stride=2
        )

        # Decoder
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

        # Final segmentation layer
        self.final = nn.Conv2d(
            64,
            1,
            kernel_size=1
        )

    def forward(self, x):

        # Encoder
        e1 = self.enc1(x)
        p1 = self.pool(e1)

        e2 = self.enc2(p1)
        p2 = self.pool(e2)

        e3 = self.enc3(p2)
        p3 = self.pool(e3)

        # Bottleneck
        b = self.bottleneck(p3)

        # Decoder
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

        return self.final(d1)


# ============================================================
# LOAD MODEL
# ============================================================

def load_unet():

    print("Loading U-Net...")
    print("Path:", UNET_PATH)

    model = UNet()

    checkpoint = torch.load(
        UNET_PATH,
        map_location=DEVICE
    )

    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        checkpoint = checkpoint["state_dict"]

    model.load_state_dict(checkpoint)

    model = model.to(DEVICE)
    model.eval()

    print("✅ U-Net loaded successfully!")

    return model


unet_model = load_unet()


# ============================================================
# IMAGE TRANSFORM
# ============================================================

transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor()
])


# ============================================================
# SEGMENTATION
# ============================================================

def segment_lesion(image_path: str):

    image = Image.open(
        image_path
    ).convert("RGB")

    original_size = image.size

    image_tensor = transform(image)
    image_tensor = image_tensor.unsqueeze(0)
    image_tensor = image_tensor.to(DEVICE)

    with torch.no_grad():

        output = unet_model(
            image_tensor
        )

        probability = torch.sigmoid(
            output
        )

        mask = (
            probability > 0.5
        ).float()

    mask = mask.squeeze().cpu().numpy()

    mask = (
        mask * 255
    ).astype(np.uint8)

    # Resize mask back to original image size
    mask_image = Image.fromarray(
        mask
    )

    mask_image = mask_image.resize(
        original_size
    )

    return mask_image