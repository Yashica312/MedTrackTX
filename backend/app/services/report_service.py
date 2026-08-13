import base64
import os

from datetime import datetime
from io import BytesIO
from typing import Any

from sqlalchemy.orm import Session

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle
)
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    PageBreak,
    KeepTogether
)

from app.models.report import Report


# ============================================================
# REPORT DIRECTORY
# ============================================================

REPORT_DIR = os.path.join(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    ),
    "generated_reports"
)

os.makedirs(
    REPORT_DIR,
    exist_ok=True
)


# ============================================================
# HELPERS
# ============================================================

def safe(value, default="N/A"):

    if value is None:
        return default

    if value == "":
        return default

    return str(value)


def percentage(value):

    if value is None:
        return "N/A"

    return f"{float(value):.2f}%"


def number(value):

    if value is None:
        return "N/A"

    return f"{float(value):.2f}"


# ============================================================
# BASE64 → REPORTLAB IMAGE
# ============================================================

def base64_to_image(
    encoded,
    width=75 * mm,
    height=65 * mm
):

    if not encoded:
        return None

    try:

        if "," in encoded:

            encoded = encoded.split(
                ",",
                1
            )[1]

        image_bytes = base64.b64decode(
            encoded
        )

        buffer = BytesIO(
            image_bytes
        )

        return Image(
            buffer,
            width=width,
            height=height,
            kind="proportional"
        )

    except Exception as error:

        print(
            "Image conversion failed:",
            error
        )

        return None


# ============================================================
# TABLE
# ============================================================

def make_table(
    rows,
    widths
):

    table = Table(
        rows,
        colWidths=widths,
        repeatRows=1
    )

    table.setStyle(
        TableStyle(
            [

                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#17324D")
                ),

                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#D0D7DE")
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),

                (
                    "FONTNAME",
                    (0, 1),
                    (0, -1),
                    "Helvetica-Bold"
                ),

                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    9
                ),

                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),

                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                )
            ]
        )
    )

    return table


# ============================================================
# SECTION TITLE
# ============================================================

def section(
    story,
    title,
    styles
):

    story.append(
        Paragraph(
            title,
            styles["Section"]
        )
    )

    story.append(
        Spacer(1, 4)
    )


# ============================================================
# PDF GENERATOR
# ============================================================

def generate_clinical_report(
    db: Session,
    patient_id: int,
    visit_id: int,
    analysis_data: dict
):

    generated_at = datetime.utcnow()

    filename = (
        f"MedTrack_Report_"
        f"patient_{patient_id}_"
        f"visit_{visit_id}.pdf"
    )

    pdf_path = os.path.join(
        REPORT_DIR,
        filename
    )

    # ========================================================
    # STYLES
    # ========================================================

    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="HospitalTitle",
            parent=styles["Title"],
            fontSize=21,
            leading=25,
            alignment=TA_CENTER,
            textColor=colors.HexColor(
                "#17324D"
            ),
            spaceAfter=5
        )
    )

    styles.add(
        ParagraphStyle(
            name="HospitalSubtitle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            alignment=TA_CENTER,
            textColor=colors.HexColor(
                "#64748B"
            ),
            spaceAfter=18
        )
    )

    styles.add(
        ParagraphStyle(
            name="Section",
            parent=styles["Heading2"],
            fontSize=13,
            leading=17,
            textColor=colors.HexColor(
                "#17324D"
            ),
            spaceBefore=12,
            spaceAfter=7
        )
    )

    styles.add(
        ParagraphStyle(
            name="BodyReport",
            parent=styles["BodyText"],
            fontSize=9.5,
            leading=14,
            textColor=colors.HexColor(
                "#263238"
            )
        )
    )

    styles.add(
        ParagraphStyle(
            name="SmallReport",
            parent=styles["BodyText"],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor(
                "#64748B"
            )
        )
    )

    styles.add(
        ParagraphStyle(
            name="ImageCaption",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            alignment=TA_CENTER,
            textColor=colors.HexColor(
                "#475569"
            )
        )
    )

    # ========================================================
    # DOCUMENT
    # ========================================================

    document = SimpleDocTemplate(

        pdf_path,

        pagesize=A4,

        rightMargin=17 * mm,
        leftMargin=17 * mm,
        topMargin=17 * mm,
        bottomMargin=17 * mm,

        title="MedTrack-TX Clinical Report",

        author="MedTrack-TX"
    )

    story = []

    # ========================================================
    # DATA
    # ========================================================

    patient = analysis_data.get(
        "patient",
        {}
    )

    prediction = analysis_data.get(
        "prediction",
        {}
    )

    temporal = analysis_data.get(
        "temporal",
        {}
    )

    growth = analysis_data.get(
        "lesion_growth",
        {}
    )

    abcde = analysis_data.get(
        "abcde",
        {}
    )

    segmentation = analysis_data.get(
        "segmentation",
        {}
    )

    gradcam = analysis_data.get(
        "gradcam",
        {}
    )

    temporal_metrics = analysis_data.get(
        "temporal_metrics",
        {}
    )

    risk = analysis_data.get(
        "risk_assessment",
        {}
    )

    # ========================================================
    # HEADER
    # ========================================================

    story.append(
        Paragraph(
            "MEDTRACK-TX",
            styles["HospitalTitle"]
        )
    )

    story.append(
        Paragraph(
            "Dermatology Clinical Analysis Report",
            styles["HospitalSubtitle"]
        )
    )

    # ========================================================
    # PATIENT INFORMATION
    # ========================================================

    section(
        story,
        "PATIENT INFORMATION",
        styles
    )

    patient_rows = [

        [
            "Patient ID",
            safe(
                patient.get(
                    "patient_id",
                    patient_id
                )
            ),

            "Visit ID",
            safe(
                patient.get(
                    "visit_id",
                    visit_id
                )
            )
        ],

        [
            "Visit Date",
            safe(
                patient.get(
                    "visit_date"
                )
            ),

            "Report Date",
            generated_at.strftime(
                "%d-%m-%Y %H:%M"
            )
        ]
    ]

    patient_table = Table(
        patient_rows,
        colWidths=[
            35 * mm,
            50 * mm,
            35 * mm,
            50 * mm
        ]
    )

    patient_table.setStyle(
        TableStyle(
            [

                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#EAF2F8")
                ),

                (
                    "BACKGROUND",
                    (2, 0),
                    (2, -1),
                    colors.HexColor("#EAF2F8")
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),

                (
                    "FONTNAME",
                    (2, 0),
                    (2, -1),
                    "Helvetica-Bold"
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#CBD5E1")
                ),

                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    9
                ),

                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    7
                )
            ]
        )
    )

    story.append(
        patient_table
    )

    # ========================================================
    # CLINICAL OVERVIEW
    # ========================================================

    section(
        story,
        "1. CLINICAL OVERVIEW",
        styles
    )

    overview_rows = [

        [
            "AI Classification",
            safe(
                prediction.get(
                    "predicted_class"
                )
            )
        ],

        [
            "Confidence",
            percentage(
                prediction.get(
                    "confidence"
                )
            )
        ],

        [
            "Risk Level",
            safe(
                risk.get(
                    "risk_level"
                )
            )
        ],

        [
            "Risk Score",
            number(
                risk.get(
                    "risk_score"
                )
            ) + " / 100"
        ],

        [
            "Evolution Status",
            safe(
                temporal_metrics.get(
                    "progression",
                    "No comparison"
                )
            )
        ]
    ]

    story.append(
        make_table(
            [
                [
                    "Finding",
                    "Assessment"
                ]
            ] + overview_rows,
            [
                65 * mm,
                105 * mm
            ]
        )
    )

    # ========================================================
    # TEMPORAL EVOLUTION
    # ========================================================

    section(
        story,
        "2. TEMPORAL LESION EVOLUTION",
        styles
    )

    story.append(
        Paragraph(
            "Longitudinal comparison of the lesion "
            "between the available visits.",
            styles["BodyReport"]
        )
    )

    story.append(
        Spacer(1, 6)
    )

    # --------------------------------------------------------
    # TEMPORAL DATA TABLE
    # --------------------------------------------------------

    temporal_rows = [

        [
            "Metric",
            "Previous Visit",
            "Current Visit",
            "Change"
        ],

        [
            "Lesion Area",
            number(
                temporal.get(
                    "previous_area"
                )
            ),
            number(
                temporal.get(
                    "current_area"
                )
            ),
            percentage(
                temporal.get(
                    "area_change_percent"
                )
            )
        ],

        [
            "Diameter",
            number(
                temporal.get(
                    "previous_diameter"
                )
            ),
            number(
                temporal.get(
                    "current_diameter"
                )
            ),
            percentage(
                temporal.get(
                    "diameter_change_percent"
                )
            )
        ]
    ]

    story.append(
        make_table(
            temporal_rows,
            [
                45 * mm,
                40 * mm,
                40 * mm,
                45 * mm
            ]
        )
    )

    story.append(
        Spacer(1, 8)
    )

    # --------------------------------------------------------
    # TEMPORAL METRICS
    # --------------------------------------------------------

    metric_rows = [

        [
            "Structural Similarity (SSIM)",
            number(
                temporal_metrics.get(
                    "ssim"
                )
            )
        ],

        [
            "Dice Coefficient",
            number(
                temporal_metrics.get(
                    "dice_coefficient"
                )
            )
        ],

        [
            "Intersection over Union (IoU)",
            number(
                temporal_metrics.get(
                    "iou"
                )
            )
        ],

        [
            "Evolution Score",
            number(
                temporal_metrics.get(
                    "evolution_score"
                )
            )
        ],

        [
            "Progression",
            safe(
                temporal_metrics.get(
                    "progression"
                )
            )
        ]
    ]

    story.append(
        make_table(
            [
                [
                    "Temporal Metric",
                    "Result"
                ]
            ] + metric_rows,
            [
                100 * mm,
                70 * mm
            ]
        )
    )

    # ========================================================
    # LESION GROWTH
    # ========================================================

    section(
        story,
        "3. LESION GROWTH & CHANGE QUANTIFICATION",
        styles
    )

    growth_rows = [

        [
            "Previous Area",
            number(
                growth.get(
                    "previous_area"
                )
            )
        ],

        [
            "Current Area",
            number(
                growth.get(
                    "current_area"
                )
            )
        ],

        [
            "Area Change",
            percentage(
                growth.get(
                    "area_change_percent"
                )
            )
        ],

        [
            "Previous Diameter",
            number(
                growth.get(
                    "previous_diameter"
                )
            )
        ],

        [
            "Current Diameter",
            number(
                growth.get(
                    "current_diameter"
                )
            )
        ],

        [
            "Diameter Change",
            percentage(
                growth.get(
                    "diameter_change_percent"
                )
            )
        ]
    ]

    story.append(
        make_table(
            [
                [
                    "Measurement",
                    "Value"
                ]
            ] + growth_rows,
            [
                100 * mm,
                70 * mm
            ]
        )
    )

    # ========================================================
    # ABCDE
    # ========================================================

    section(
        story,
        "4. ABCDE CLINICAL ASSESSMENT",
        styles
    )

    abcde_rows = [

        [
            "A — Asymmetry",
            number(
                abcde.get(
                    "A_asymmetry"
                )
            )
        ],

        [
            "B — Border",
            number(
                abcde.get(
                    "B_border"
                )
            )
        ],

        [
            "C — Color",
            number(
                abcde.get(
                    "C_color"
                )
            )
        ],

        [
            "D — Diameter",
            number(
                abcde.get(
                    "D_diameter"
                )
            )
        ],

        [
            "E — Evolution",
            safe(
                abcde.get(
                    "E_evolution"
                )
            )
        ],

        [
            "Overall Image-Analysis Score",
            number(
                abcde.get(
                    "overall_score"
                )
            )
        ]
    ]

    story.append(
        make_table(
            [
                [
                    "ABCDE Criterion",
                    "Assessment / Score"
                ]
            ] + abcde_rows,
            [
                100 * mm,
                70 * mm
            ]
        )
    )

    story.append(
        Spacer(1, 6)
    )

    story.append(
        Paragraph(
            safe(
                abcde.get(
                    "note"
                ),
                "ABCDE results are AI-assisted image-analysis indicators."
            ),
            styles["SmallReport"]
        )
    )

    # ========================================================
    # PAGE BREAK
    # ========================================================

    story.append(
        PageBreak()
    )

    # ========================================================
    # U-NET SEGMENTATION
    # ========================================================

    section(
        story,
        "5. U-NET LESION SEGMENTATION",
        styles
    )

    story.append(
        Paragraph(
            "The U-Net segmentation stage identifies "
            "the lesion region used for subsequent "
            "quantitative analysis.",
            styles["BodyReport"]
        )
    )

    segmentation_image = base64_to_image(
        segmentation.get(
            "mask_base64"
        ),
        width=90 * mm,
        height=75 * mm
    )

    if segmentation_image:

        segmentation_table = Table(
            [
                [
                    Paragraph(
                        "<b>Lesion Segmentation Mask</b>",
                        styles["ImageCaption"]
                    )
                ],
                [
                    segmentation_image
                ]
            ],
            colWidths=[
                100 * mm
            ]
        )

        segmentation_table.setStyle(
            TableStyle(
                [
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.HexColor("#CBD5E1")
                    ),

                    (
                        "ALIGN",
                        (0, 0),
                        (-1, -1),
                        "CENTER"
                    ),

                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE"
                    ),

                    (
                        "PADDING",
                        (0, 0),
                        (-1, -1),
                        8
                    )
                ]
            )
        )

        story.append(
            segmentation_table
        )

    else:

        story.append(
            Paragraph(
                "Segmentation visualization unavailable.",
                styles["BodyReport"]
            )
        )

    # ========================================================
    # GRAD-CAM
    # ========================================================

    section(
        story,
        "6. GRAD-CAM MODEL EXPLAINABILITY",
        styles
    )

    gradcam_image = base64_to_image(
        gradcam.get(
            "overlay_base64"
        ),
        width=110 * mm,
        height=85 * mm
    )

    if gradcam_image:

        story.append(
            Paragraph(
                "AI Attention Visualization",
                styles["ImageCaption"]
            )
        )

        story.append(
            Spacer(1, 4)
        )

        story.append(
            gradcam_image
        )

        story.append(
            Spacer(1, 7)
        )

    story.append(
        Paragraph(
            f"<b>Model Prediction:</b> "
            f"{safe(gradcam.get('predicted_class'))}",
            styles["BodyReport"]
        )
    )

    story.append(
        Spacer(1, 5)
    )

    story.append(
        Paragraph(
            "<b>How to interpret Grad-CAM:</b><br/>"
            "Grad-CAM is an explainability technique "
            "that highlights image regions that "
            "contributed most strongly to the model's "
            "prediction. Higher-activation regions "
            "indicate areas that had greater influence "
            "on the classification output.",
            styles["BodyReport"]
        )
    )

    story.append(
        Spacer(1, 5)
    )

    story.append(
        Paragraph(
            "<b>Important:</b> Grad-CAM is an AI "
            "explainability visualization and should "
            "not be interpreted as a standalone "
            "diagnostic or anatomical heatmap.",
            styles["SmallReport"]
        )
    )

    # ========================================================
    # RISK
    # ========================================================

    section(
        story,
        "7. AI-ASSISTED RISK ASSESSMENT",
        styles
    )

    risk_rows = [

        [
            "Risk Score",
            number(
                risk.get(
                    "risk_score"
                )
            ) + " / 100"
        ],

        [
            "Risk Level",
            safe(
                risk.get(
                    "risk_level"
                )
            )
        ],

        [
            "Evolution Contribution",
            number(
                temporal_metrics.get(
                    "evolution_score"
                )
            )
        ]
    ]

    story.append(
        make_table(
            [
                [
                    "Risk Parameter",
                    "Result"
                ]
            ] + risk_rows,
            [
                100 * mm,
                70 * mm
            ]
        )
    )

    # ========================================================
    # CLINICAL IMPRESSION
    # ========================================================

    section(
        story,
        "8. CLINICAL IMPRESSION",
        styles
    )

    story.append(
        Paragraph(
            safe(
                analysis_data.get(
                    "clinical_summary"
                )
            ),
            styles["BodyReport"]
        )
    )

    # ========================================================
    # RECOMMENDATION
    # ========================================================

    section(
        story,
        "9. RECOMMENDATION",
        styles
    )

    story.append(
        Paragraph(
            safe(
                analysis_data.get(
                    "recommendation"
                )
            ),
            styles["BodyReport"]
        )
    )

    # ========================================================
    # TECHNICAL INFORMATION
    # ========================================================

    section(
        story,
        "10. TECHNICAL INFORMATION",
        styles
    )

    technical_rows = [

        [
            "Classification",
            "ViT"
        ],

        [
            "Segmentation",
            "U-Net"
        ],

        [
            "Explainability",
            "Grad-CAM"
        ],

        [
            "Clinical Framework",
            "ABCDE"
        ],

        [
            "Temporal Analysis",
            "Enabled"
        ]
    ]

    story.append(
        make_table(
            [
                [
                    "Component",
                    "Method"
                ]
            ] + technical_rows,
            [
                100 * mm,
                70 * mm
            ]
        )
    )

    # ========================================================
    # DISCLAIMER
    # ========================================================

    story.append(
        Spacer(1, 15)
    )

    disclaimer = Table(
        [
            [
                Paragraph(
                    "<b>Clinical Disclaimer</b><br/>"
                    "This report contains AI-assisted "
                    "analysis intended to support clinical "
                    "review. It does not replace professional "
                    "medical examination, diagnosis or "
                    "clinical judgment.",
                    styles["SmallReport"]
                )
            ]
        ],
        colWidths=[
            170 * mm
        ]
    )

    disclaimer.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    colors.HexColor("#FFF7ED")
                ),

                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    0.7,
                    colors.HexColor("#F59E0B")
                ),

                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    9
                )
            ]
        )
    )

    story.append(
        disclaimer
    )

    # ========================================================
    # BUILD PDF
    # ========================================================

    document.build(
        story
    )

    # ========================================================
    # SAVE DB RECORD
    # ========================================================

    report = Report(
        patient_id=patient_id,
        visit_id=visit_id,
        report_path=pdf_path,
        generated_at=generated_at
    )

    db.add(
        report
    )

    db.flush()

    return report