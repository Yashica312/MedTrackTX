import cv2
import numpy as np


def load_image(path: str):
    image = cv2.imread(path)

    if image is None:
        raise ValueError(f"Unable to read image: {path}")

    return image


def get_lesion_mask(image):

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    blur = cv2.GaussianBlur(
        gray,
        (5, 5),
        0
    )

    _, mask = cv2.threshold(
        blur,
        0,
        255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

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

    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return mask

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


def calculate_area(mask):
    return float(
        cv2.countNonZero(mask)
    )


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

    return float(
        max(w, h)
    )


def percentage_change(old, new):

    if old == 0:
        return 0.0

    return round(
        ((new - old) / old) * 100,
        2
    )


def calculate_iou(mask1, mask2):

    intersection = np.logical_and(
        mask1 > 0,
        mask2 > 0
    ).sum()

    union = np.logical_or(
        mask1 > 0,
        mask2 > 0
    ).sum()

    if union == 0:
        return 0.0

    return round(
        float(intersection / union),
        4
    )


def calculate_dice(mask1, mask2):

    intersection = np.logical_and(
        mask1 > 0,
        mask2 > 0
    ).sum()

    total = (
        (mask1 > 0).sum()
        +
        (mask2 > 0).sum()
    )

    if total == 0:
        return 0.0

    return round(
        float(
            (2 * intersection) / total
        ),
        4
    )


def calculate_ssim(image1, image2):

    gray1 = cv2.cvtColor(
        image1,
        cv2.COLOR_BGR2GRAY
    )

    gray2 = cv2.cvtColor(
        image2,
        cv2.COLOR_BGR2GRAY
    )

    gray1 = cv2.resize(
        gray1,
        (224, 224)
    )

    gray2 = cv2.resize(
        gray2,
        (224, 224)
    )

    # Normalized correlation as a practical
    # structural similarity indicator.
    score = cv2.matchTemplate(
        gray1,
        gray2,
        cv2.TM_CCOEFF_NORMED
    )[0][0]

    return round(
        float(max(0, score)),
        4
    )


def calculate_evolution(
    area_change,
    diameter_change,
    dice,
    ssim
):

    growth = abs(area_change)
    diameter_growth = abs(diameter_change)

    change_score = min(
        100,
        (
            growth * 0.5
            +
            diameter_growth * 0.2
            +
            (1 - dice) * 20
            +
            (1 - ssim) * 10
        )
    )

    return round(
        float(change_score),
        2
    )


def analyze_temporal(
    previous_image_path: str,
    current_image_path: str
):

    previous = load_image(
        previous_image_path
    )

    current = load_image(
        current_image_path
    )

    previous = cv2.resize(
        previous,
        (224, 224)
    )

    current = cv2.resize(
        current,
        (224, 224)
    )

    previous_mask = get_lesion_mask(
        previous
    )

    current_mask = get_lesion_mask(
        current
    )

    previous_area = calculate_area(
        previous_mask
    )

    current_area = calculate_area(
        current_mask
    )

    previous_diameter = calculate_diameter(
        previous_mask
    )

    current_diameter = calculate_diameter(
        current_mask
    )

    area_change = percentage_change(
        previous_area,
        current_area
    )

    diameter_change = percentage_change(
        previous_diameter,
        current_diameter
    )

    dice = calculate_dice(
        previous_mask,
        current_mask
    )

    iou = calculate_iou(
        previous_mask,
        current_mask
    )

    ssim = calculate_ssim(
        previous,
        current
    )

    evolution = calculate_evolution(
        area_change,
        diameter_change,
        dice,
        ssim
    )

    if evolution < 25:
        progression = "Stable"
    elif evolution < 50:
        progression = "Moderate Change"
    else:
        progression = "Significant Change"

    return {
        "previous_area": round(
            previous_area,
            2
        ),
        "current_area": round(
            current_area,
            2
        ),
        "area_change_percent": area_change,

        "previous_diameter": round(
            previous_diameter,
            2
        ),
        "current_diameter": round(
            current_diameter,
            2
        ),
        "diameter_change_percent": diameter_change,

        "ssim": ssim,
        "dice_coefficient": dice,
        "iou": iou,

        "evolution_score": evolution,
        "progression": progression
    }