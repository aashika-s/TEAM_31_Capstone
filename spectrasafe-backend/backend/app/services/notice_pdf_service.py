"""
Generates the formal PDF for an FSSAI notice (show-cause, stop-sale, or
recall). Fixed, deterministic template filled with the notice's own
fields -- no LLM involved, this is a document-fill, not generation.
"""
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors

from app.models.notice import Notice, NoticeType

_TITLES = {
    NoticeType.SHOW_CAUSE: "Show Cause Notice",
    NoticeType.STOP_SALE: "Stop Sale Order",
    NoticeType.RECALL: "Product Recall Notice",
}


def generate_notice_pdf(notice: Notice, output_path: Path) -> None:
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("NoticeTitle", parent=styles["Title"], fontSize=16, spaceAfter=12)
    body_style = ParagraphStyle("NoticeBody", parent=styles["Normal"], fontSize=11, leading=16, spaceAfter=10)

    doc = SimpleDocTemplate(str(output_path), pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    story = []

    story.append(Paragraph("Food Safety and Standards Authority of India (FSSAI)", styles["Heading2"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph(_TITLES[notice.notice_type], title_style))

    meta_table = Table(
        [
            ["Notice ID:", str(notice.id)],
            ["Date issued:", notice.created_at.strftime("%d %B %Y")],
            ["Manufacturer:", notice.manufacturer_name],
            ["FSSAI license:", notice.fssai_license or "Not on record"],
        ],
        colWidths=[4 * cm, 11 * cm],
    )
    meta_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.grey),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 16))

    story.append(Paragraph("Grounds for this notice:", styles["Heading4"]))
    story.append(Paragraph(notice.details.replace("\n", "<br/>"), body_style))

    story.append(Spacer(1, 24))
    story.append(Paragraph(
        "This notice is issued under the Food Safety and Standards Act, 2006, "
        "and applicable rules and regulations made thereunder.",
        body_style,
    ))
    story.append(Spacer(1, 40))
    story.append(Paragraph("_____________________________", body_style))
    story.append(Paragraph("Authorized FSSAI Officer", body_style))

    doc.build(story)