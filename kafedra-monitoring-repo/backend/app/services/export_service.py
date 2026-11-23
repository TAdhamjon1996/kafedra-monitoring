import os
import io
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from typing import List, Dict, Any

def export_shir_excel(user_data: Dict[str, Any], tasks: List[Dict[str, Any]], rating: Dict[str, Any]) -> io.BytesIO:
    """O'qituvchining yillik SHIR hisobotini rasmiy Excel formatida generatsiya qilish"""
    wb = Workbook()
    ws = wb.active
    ws.title = "SHIR Hisoboti"

    # Fonts and styles
    font_header = Font(name="Times New Roman", size=13, bold=True, color="1B365D")
    font_sub = Font(name="Times New Roman", size=11, bold=True)
    font_body = Font(name="Times New Roman", size=10)
    font_tbl_hdr = Font(name="Times New Roman", size=10, bold=True, color="FFFFFF")
    
    fill_tbl_hdr = PatternFill(start_color="1B365D", end_color="1B365D", fill_type="solid")
    fill_even = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    # University header
    ws.merge_cells('A1:G1')
    ws['A1'] = "MUHAMMAD AL-XORAZMIY NOMIDAGI TOSHKENT AXBOROT TEXNOLOGIYALARI UNIVERSITETI"
    ws['A1'].font = font_header
    ws['A1'].alignment = Alignment(horizontal="center", vertical="center")

    ws.merge_cells('A2:G2')
    ws['A2'] = "“Raqamli texnologiyalar konvergensiyasi” kafedrasi"
    ws['A2'].font = font_sub
    ws['A2'].alignment = Alignment(horizontal="center", vertical="center")

    ws.merge_cells('A3:G3')
    ws['A3'] = f"Professor-o'qituvchi: {user_data.get('fio', '')} ({user_data.get('position', 'Assistent')})"
    ws['A3'].font = font_sub
    ws['A3'].alignment = Alignment(horizontal="center", vertical="center")

    ws.merge_cells('A4:G4')
    ws['A4'] = f"2026/2027 o'quv yili Shaxsiy ish rejasi (SHIR) ijrosi bo'yicha hisobot (Jami me'yor: 851 soat)"
    ws['A4'].font = Font(name="Times New Roman", size=10, italic=True)
    ws['A4'].alignment = Alignment(horizontal="center", vertical="center")

    ws.row_dimensions[1].height = 24
    ws.row_dimensions[2].height = 20
    ws.row_dimensions[3].height = 20
    ws.row_dimensions[4].height = 18

    # Table Header
    headers = ["№", "SHIR Yo'nalishi", "Topshiriq nomi", "Guruhlar / Nashr", "Rejadagi soat", "Semestr", "Holati"]
    ws.append([]) # row 5 blank
    ws.append(headers) # row 6
    ws.row_dimensions[6].height = 26

    for col_num in range(1, len(headers) + 1):
        cell = ws.cell(row=6, column=col_num)
        cell.font = font_tbl_hdr
        cell.fill = fill_tbl_hdr
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border

    # Data Rows
    row_idx = 7
    total_hours = 0.0
    for idx, t in enumerate(tasks, start=1):
        hrs = float(t.get("planned_hours", 0.0))
        total_hours += hrs
        row_data = [
            idx,
            t.get("category_name", ""),
            t.get("task_title", ""),
            t.get("target_groups", "") or "-",
            hrs,
            t.get("semester", "").capitalize(),
            t.get("status", "").capitalize()
        ]
        ws.append(row_data)
        ws.row_dimensions[row_idx].height = 20
        
        for col_num in range(1, len(headers) + 1):
            cell = ws.cell(row=row_idx, column=col_num)
            cell.font = font_body
            cell.border = thin_border
            if row_idx % 2 == 1:
                cell.fill = fill_even
            if col_num in [1, 5, 6, 7]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")
        row_idx += 1

    # Total Row
    ws.merge_cells(start_row=row_idx, start_column=1, end_row=row_idx, end_column=4)
    ws.cell(row=row_idx, column=1, value="JAMI REJADAGI YUKLAMA SOATLARI:").font = font_sub
    ws.cell(row=row_idx, column=1).alignment = Alignment(horizontal="right", vertical="center")
    ws.cell(row=row_idx, column=5, value=total_hours).font = font_sub
    ws.cell(row=row_idx, column=5).alignment = Alignment(horizontal="center", vertical="center")
    
    for c in range(1, len(headers) + 1):
        ws.cell(row=row_idx, column=c).border = thin_border

    # Rating Summary Block
    row_idx += 2
    ws.cell(row=row_idx, column=2, value="YAKUNIY REYTING KO'RSATKICHLARI:").font = font_header
    row_idx += 1
    metrics = [
        ("O'quv ishlari bali:", rating.get("teaching_score", 0.0)),
        ("O'quv-uslubiy ishlar bali:", rating.get("methodical_score", 0.0)),
        ("Ilmiy-tadqiqot ishlari bali:", rating.get("scientific_score", 0.0)),
        ("Ustoz-shogird ishlari bali:", rating.get("mentor_score", 0.0)),
        ("Bonus ballar:", rating.get("bonus_score", 0.0)),
        ("Jarima ballari:", rating.get("penalty_score", 0.0)),
        ("JAMI YIG'MA REYTING BALI:", rating.get("total_score", 0.0)),
    ]
    for lbl, val in metrics:
        ws.cell(row=row_idx, column=2, value=lbl).font = font_sub if "JAMI" in lbl else font_body
        ws.cell(row=row_idx, column=3, value=f"{val} ball").font = font_sub if "JAMI" in lbl else font_body
        row_idx += 1

    # Adjust column widths
    col_widths = {1: 6, 2: 24, 3: 45, 4: 25, 5: 16, 6: 14, 7: 16}
    for col_idx, width in col_widths.items():
        ws.column_dimensions[ws.cell(row=6, column=col_idx).column_letter].width = width

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output

def export_shir_pdf(user_data: Dict[str, Any], tasks: List[Dict[str, Any]], rating: Dict[str, Any]) -> io.BytesIO:
    """O'qituvchining yillik SHIR hisobotini rasmiy PDF formatida generatsiya qilish"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        alignment=1,
        textColor=colors.HexColor('#1B365D')
    )
    sub_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        alignment=1,
        textColor=colors.HexColor('#334155')
    )
    cell_style = ParagraphStyle(
        'Cell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10
    )
    cell_hdr = ParagraphStyle(
        'CellHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=1
    )

    elements = []
    elements.append(Paragraph("O‘ZBEKISTON RESPUBLIKASI OLIY TA’LIM, FAN VA INNOVATSIYALAR VAZIRLIGI", sub_style))
    elements.append(Paragraph("MUHAMMAD AL-XORAZMIY NOMIDAGI TOSHKENT AXBOROT TEXNOLOGIYALARI UNIVERSITETI", title_style))
    elements.append(Paragraph("“Raqamli texnologiyalar konvergensiyasi” kafedrasi", sub_style))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(f"<b>Professor-o‘qituvchi:</b> {user_data.get('fio', '')} ({user_data.get('position', 'Assistent')})", sub_style))
    elements.append(Paragraph("2026/2027 o‘quv yili Shaxsiy ish rejasi (SHIR) ijrosi bo‘yicha rasmiy hisobot (851 soat)", sub_style))
    elements.append(Spacer(1, 14))

    # Table data
    tbl_data = [[
        Paragraph("№", cell_hdr),
        Paragraph("Yo'nalish", cell_hdr),
        Paragraph("Topshiriq nomi", cell_hdr),
        Paragraph("Soat", cell_hdr),
        Paragraph("Semestr", cell_hdr),
        Paragraph("Holati", cell_hdr)
    ]]

    for idx, t in enumerate(tasks, start=1):
        tbl_data.append([
            Paragraph(str(idx), cell_style),
            Paragraph(t.get("category_name", ""), cell_style),
            Paragraph(t.get("task_title", "")[:80], cell_style),
            Paragraph(str(t.get("planned_hours", 0)), cell_style),
            Paragraph(t.get("semester", "").capitalize(), cell_style),
            Paragraph(t.get("status", "").capitalize(), cell_style)
        ])

    table = Table(tbl_data, colWidths=[24, 90, 240, 45, 55, 65])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1B365D')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')])
    ]))
    elements.append(table)
    elements.append(Spacer(1, 14))

    # Rating Summary
    total_score = rating.get("total_score", 0.0)
    score_p = Paragraph(
        f"<b>Yakuniy hisoblangan reyting bali:</b> {total_score} ball "
        f"(O‘quv: {rating.get('teaching_score', 0)} b, Uslubiy: {rating.get('methodical_score', 0)} b, "
        f"Ilmiy: {rating.get('scientific_score', 0)} b, Ustoz-shogird: {rating.get('mentor_score', 0)} b)",
        ParagraphStyle('ScoreStyle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#1D5CE5'))
    )
    elements.append(score_p)
    elements.append(Spacer(1, 24))

    # Signatures
    sign_data = [
        [Paragraph(f"O‘qituvchi: _______________ {user_data.get('fio', '')}", sub_style),
         Paragraph("Kafedra mudiri: _______________ (imzo)", sub_style)]
    ]
    sign_table = Table(sign_data, colWidths=[260, 260])
    sign_table.setStyle(TableStyle([('ALIGN', (0, 0), (-1, -1), 'CENTER')]))
    elements.append(sign_table)

    doc.build(elements)
    buffer.seek(0)
    return buffer
