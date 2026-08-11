import cv2
import numpy as np
from PIL import Image


# ============================================================
# LOAD IMAGE
# ============================================================

def load_image(image_path: str):
    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Unable to read image")

    return image


# ============================================================
# FIND LESION
# ============================================================

def get_lesion_mask(image):
    """
    Creates an approximate lesion mask using
    grayscale thresholding and contour detection.
    """

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Smooth image
    blur = cv2.GaussianBlur(
        gray,
        (5, 5),
        0
    )

    # Threshold
    _, mask = cv2.threshold(
        blur,
        0,
        255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

    # Morphological cleanup
    kernel = np.ones(
        (5, 5),
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

    # Find contours
    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return mask

    # Largest contour assumed to be lesion
    largest = max(
        contours,
        key=cv2.contourArea
    )

    lesion_mask = np.zeros_like(mask)

    cv2.drawContours(
        lesion_mask,
        [largest],
        -1,
        255,
        -1
    )

    return lesion_mask


# ============================================================
# A — ASYMMETRY
# ============================================================

def calculate_asymmetry(mask):

    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return 0.0

    contour = max(
        contours,
        key=cv2.contourArea
    )

    area = cv2.contourArea(contour)

    if area == 0:
        return 0.0

    # Fit ellipse when possible
    if len(contour) >= 5:

        ellipse = cv2.fitEllipse(contour)

        center = ellipse[0]

        M = cv2.moments(contour)

        if M["m00"] != 0:

            cx = M["m10"] / M["m00"]
            cy = M["m01"] / M["m00"]

            distance = np.sqrt(
                (center[0] - cx) ** 2 +
                (center[1] - cy) ** 2
            )

            diagonal = np.sqrt(
                mask.shape[0] ** 2 +
                mask.shape[1] ** 2
            )

            score = min(
                100,
                (distance / diagonal) * 500
            )

            return round(
                float(score),
                2
            )

    return 0.0


# ============================================================
# B — BORDER
# ============================================================

def calculate_border(mask):

    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return 0.0

    contour = max(
        contours,
        key=cv2.contourArea
    )

    perimeter = cv2.arcLength(
        contour,
        True
    )

    area = cv2.contourArea(
        contour
    )

    if perimeter == 0:
        return 0.0

    # Circularity
    circularity = (
        4 * np.pi * area
    ) / (
        perimeter ** 2
    )

    irregularity = max(
        0,
        1 - circularity
    )

    score = min(
        100,
        irregularity * 100
    )

    return round(
        float(score),
        2
    )


# ============================================================
# C — COLOR
# ============================================================

def calculate_color(image, mask):

    hsv = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2HSV
    )

    lesion_pixels = hsv[
        mask > 0
    ]

    if len(lesion_pixels) == 0:
        return 0.0

    # Standard deviation across HSV channels
    variation = np.mean(
        np.std(
            lesion_pixels.astype(
                np.float32
            ),
            axis=0
        )
    )

    score = min(
        100,
        variation * 2
    )

    return round(
        float(score),
        2
    )


# ============================================================
# D — DIAMETER
# ============================================================

def calculate_diameter(mask):

    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return 0.0

    contour = max(
        contours,
        key=cv2.contourArea
    )

    x, y, w, h = cv2.boundingRect(
        contour
    )

    diameter_pixels = max(
        w,
        h
    )

    image_diagonal = np.sqrt(
        mask.shape[0] ** 2 +
        mask.shape[1] ** 2
    )

    relative_size = (
        diameter_pixels /
        image_diagonal
    )

    score = min(
        100,
        relative_size * 100
    )

    return round(
        float(score),
        2
    )


# ============================================================
# E — EVOLUTION
# ============================================================

def calculate_evolution():

    # Evolution requires comparison between
    # multiple visits.
    #
    # It will be calculated by the
    # temporal analysis module.

    return {
        "score": None,
        "status": "Requires previous visit comparison"
    }


# ============================================================
# COMPLETE ABCDE ANALYSIS
# ============================================================

def analyze_abcde(image_path: str):

    image = load_image(
        image_path
    )

    mask = get_lesion_mask(
        image
    )

    asymmetry = calculate_asymmetry(
        mask
    )

    border = calculate_border(
        mask
    )

    color = calculate_color(
        image,
        mask
    )

    diameter = calculate_diameter(
        mask
    )

    evolution = calculate_evolution()

    overall = np.mean([
        asymmetry,
        border,
        color,
        diameter
    ])

    return {
        "A_asymmetry": asymmetry,
        "B_border": border,
        "C_color": color,
        "D_diameter": diameter,
        "E_evolution": evolution,
        "overall_score": round(
            float(overall),
            2
        ),
        "note": (
            "ABCDE scores are image-analysis "
            "indicators and are not a clinical diagnosis. "
            "Evolution requires longitudinal visit comparison."
        )
    }