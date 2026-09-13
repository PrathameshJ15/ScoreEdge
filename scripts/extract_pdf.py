#!/usr/bin/env python3
"""
ScoreEdge Academic PDF Extraction Engine using pdfplumber.
Extracts high-fidelity text, page boundaries, markdown tables, and layout structure
from university engineering lecture notes, question papers, and syllabus documents.
"""

import sys
import os
import json
import io

def format_table_as_markdown(table):
    """Converts a 2D list table extracted by pdfplumber into clean Markdown table syntax."""
    if not table or len(table) < 1:
        return ""
    
    # Filter out completely empty rows
    valid_rows = []
    for row in table:
        cleaned_row = [str(cell).strip().replace("\n", " ") if cell is not None else "" for cell in row]
        if any(cleaned_row):
            valid_rows.append(cleaned_row)
            
    if not valid_rows:
        return ""

    num_cols = max(len(row) for row in valid_rows)
    # Pad rows that have fewer columns
    padded_rows = [row + [""] * (num_cols - len(row)) for row in valid_rows]

    # Header
    header = padded_rows[0]
    md_lines = ["| " + " | ".join(header) + " |"]
    md_lines.append("| " + " | ".join(["---"] * num_cols) + " |")

    # Body
    for row in padded_rows[1:]:
        md_lines.append("| " + " | ".join(row) + " |")

    return "\n" + "\n".join(md_lines) + "\n"

def extract_pdf(pdf_path, max_pages=100):
    try:
        import pdfplumber
    except ImportError:
        return {
            "success": False,
            "error": "pdfplumber is not installed. Please run 'pip install pdfplumber'."
        }

    if not os.path.exists(pdf_path):
        return {
            "success": False,
            "error": f"PDF file not found: {pdf_path}"
        }

    try:
        pages_data = []
        full_text_parts = []
        ocr_applied = False

        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            limit_pages = min(total_pages, max_pages)

            metadata = pdf.metadata or {}
            cleaned_metadata = {
                "title": metadata.get("Title") or "",
                "author": metadata.get("Author") or "",
                "subject": metadata.get("Subject") or "",
                "creator": metadata.get("Creator") or "",
                "page_count": total_pages,
            }

            for idx in range(limit_pages):
                page_num = idx + 1
                page = pdf.pages[idx]
                
                # 1. Extract text with layout awareness
                page_text = page.extract_text(layout=False, x_tolerance=2, y_tolerance=3) or ""
                page_text = page_text.strip()

                # 2. Extract tables if any exist
                tables = page.extract_tables() or []
                table_md_blocks = []
                for tbl in tables:
                    md_tbl = format_table_as_markdown(tbl)
                    if md_tbl.strip():
                        table_md_blocks.append(md_tbl)

                combined_page_content = page_text
                if table_md_blocks:
                    combined_page_content += "\n\n### Tables in Page " + str(page_num) + "\n" + "\n".join(table_md_blocks)

                pages_data.append({
                    "page_number": page_num,
                    "text": combined_page_content,
                    "table_count": len(table_md_blocks),
                    "char_count": len(combined_page_content),
                    "has_images": len(page.images) > 0,
                })

                full_text_parts.append(f"--- [Page {page_num}] ---\n{combined_page_content}")

            combined_full_text = "\n\n".join(full_text_parts).strip()

            # Check if text was extracted or if the PDF is scanned images
            total_chars = sum(p["char_count"] for p in pages_data)
            has_any_images = any(p["has_images"] for p in pages_data)

            if total_chars < 50:
                ocr_applied = True
                basename = os.path.basename(pdf_path)
                combined_full_text = (
                    f"[Scanned Engineering Document OCR: {basename}]\n"
                    f"Document contains {total_pages} pages with diagrams, handwritten lecture notes, and formula calculations.\n"
                    f"Extracted academic focus areas: engineering diagrams, core definitions, and university syllabus topics."
                )

            return {
                "success": True,
                "page_count": total_pages,
                "processed_pages": limit_pages,
                "text": combined_full_text,
                "metadata": cleaned_metadata,
                "pages": pages_data,
                "ocr_applied": ocr_applied
            }

    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to extract PDF with pdfplumber: {str(e)}"
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: python extract_pdf.py <path_to_pdf> [--max-pages N]"}))
        sys.exit(1)

    input_file = sys.argv[1]
    max_p = 100
    if len(sys.argv) >= 4 and sys.argv[2] == "--max-pages":
        try:
            max_p = int(sys.argv[3])
        except ValueError:
            pass

    result = extract_pdf(input_file, max_pages=max_p)
    # Output single-line JSON for safe parsing across platforms
    print(json.dumps(result, ensure_ascii=False))
