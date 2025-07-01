import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from pptx import Presentation
from pptx.util import Inches
import pandas as pd

import models

def create_pdf_report(analysis: models.Analysis) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph(f"Analysis Report for: {analysis.file_name}", styles['h1']))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Summary", styles['h2']))
    story.append(Paragraph(analysis.summary, styles['BodyText']))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Anomalies", styles['h2']))
    for item in analysis.anomalies:
        story.append(Paragraph(f"- {item}", styles['BodyText']))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Risks", styles['h2']))
    for item in analysis.risks:
        story.append(Paragraph(f"- {item}", styles['BodyText']))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Recommendations", styles['h2']))
    for item in analysis.recommendations:
        story.append(Paragraph(f"- {item}", styles['BodyText']))
    story.append(Spacer(1, 12))

    doc.build(story)
    buffer.seek(0)
    return buffer

def create_excel_report(analysis: models.Analysis) -> io.BytesIO:
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        pd.DataFrame([{"summary": analysis.summary}]).to_excel(writer, sheet_name='Summary', index=False)
        pd.DataFrame(analysis.anomalies, columns=["Anomalies"]).to_excel(writer, sheet_name='Anomalies', index=False)
        pd.DataFrame(analysis.risks, columns=["Risks"]).to_excel(writer, sheet_name='Risks', index=False)
        pd.DataFrame(analysis.recommendations, columns=["Recommendations"]).to_excel(writer, sheet_name='Recommendations', index=False)
    buffer.seek(0)
    return buffer

def create_pptx_report(analysis: models.Analysis) -> io.BytesIO:
    buffer = io.BytesIO()
    prs = Presentation()
    
    # Title slide
    slide = prs.slides.add_slide(prs.slide_layouts[0])
    title = slide.shapes.title
    subtitle = slide.placeholders[1]
    title.text = "Analysis Report"
    subtitle.text = f"For file: {analysis.file_name}"

    # Summary slide
    slide = prs.slides.add_slide(prs.slide_layouts[1])
    title = slide.shapes.title
    content = slide.placeholders[1]
    title.text = "Summary"
    content.text = analysis.summary

    # Anomalies slide
    slide = prs.slides.add_slide(prs.slide_layouts[1])
    title = slide.shapes.title
    content = slide.placeholders[1]
    title.text = "Anomalies"
    for item in analysis.anomalies:
        p = content.text_frame.add_paragraph()
        p.text = item
        p.level = 1

    prs.save(buffer)
    buffer.seek(0)
    return buffer