"""
BhoomiChain AI/OCR Document Analyzer
Extracts text and key property parameters from uploaded property documents (PDF/Text).
"""

import sys
import os
import re
import json
import logging
import warnings

# Suppress library logs so output is clean JSON
warnings.filterwarnings("ignore")
logging.getLogger("pypdf").setLevel(logging.ERROR)

try:
    from pypdf import PdfReader  # type: ignore
    PYPDF_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    try:
        import importlib
        _pypdf = importlib.import_module("pypdf")
        PdfReader = getattr(_pypdf, "PdfReader", None)  # type: ignore
        PYPDF_AVAILABLE = PdfReader is not None
    except Exception:
        PdfReader = None  # type: ignore
        PYPDF_AVAILABLE = False


def extract_text_from_pdf(file_path):
    """
    Extract text from PDF using pypdf with pure-Python stream fallback
    """
    if PYPDF_AVAILABLE:
        try:
            reader = PdfReader(file_path)
            extracted = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted.append(text)
            if extracted:
                return "\n".join(extracted), len(reader.pages), None
        except Exception as err:
            pass

    # Fallback stream parser in case pypdf is missing or errors
    try:
        with open(file_path, "rb") as f:
            content = f.read().decode("latin1", errors="ignore")
        # Extract text within stream blocks or parentheses
        text_matches = re.findall(r"\(([^()]+)\)\s*Tj", content)
        if text_matches:
            return "\n".join(text_matches), 1, None
    except Exception as stream_err:
        return "", 0, str(stream_err)

    return "", 0, "No readable text extracted from PDF"


def parse_document_fields(text):
    """
    Extract structured land registry parameters from raw document text
    """
    data = {
        "ownerName": None,
        "surveyNumber": None,
        "propertyLocation": None,
        "village": None,
        "taluka": None,
        "district": None,
        "area": None,
        "propertyType": None,
        "registrationNumber": None,
        "documentDate": None,
        "previousOwner": None,
    }

    if not text:
        return data

    patterns = {
        "ownerName": [
            r"Owner\s*Name\s*[:\-]\s*([^\n\r]+)",
            r"Name\s*of\s*Owner\s*[:\-]\s*([^\n\r]+)",
            r"Citizen\s*Name\s*[:\-]\s*([^\n\r]+)",
            r"Purchaser\s*[:\-]\s*([^\n\r]+)",
        ],
        "surveyNumber": [
            r"Survey\s*(?:Number|No\.?)\s*[:\-]\s*([-A-Za-z0-9_/]+)",
            r"Gat\s*(?:Number|No\.?)\s*[:\-]\s*([-A-Za-z0-9_/]+)",
            r"Plot\s*(?:Number|No\.?)\s*[:\-]\s*([-A-Za-z0-9_/]+)",
        ],
        "area": [
            r"Area\s*[:\-]\s*([0-9]+(?:\.[0-9]+)?(?:\s*(?:sq\.?\s*ft|sq\.?\s*m|sqft|sqm|acres|guntha))?)",
            r"Total\s*Area\s*[:\-]\s*([0-9]+(?:\.[0-9]+)?(?:\s*(?:sq\.?\s*ft|sq\.?\s*m|sqft|sqm|acres|guntha))?)",
        ],
        "propertyLocation": [
            r"Location\s*[:\-]\s*([^\n\r]+)",
            r"Address\s*[:\-]\s*([^\n\r]+)",
            r"Property\s*Location\s*[:\-]\s*([^\n\r]+)",
        ],
        "village": [
            r"Village\s*[:\-]\s*([A-Za-z\s]+)",
        ],
        "taluka": [
            r"Taluka\s*[:\-]\s*([A-Za-z\s]+)",
        ],
        "district": [
            r"District\s*[:\-]\s*([A-Za-z\s]+)",
        ],
        "propertyType": [
            r"Property\s*Type\s*[:\-]\s*([A-Za-z_\s]+)",
            r"Land\s*Type\s*[:\-]\s*([A-Za-z_\s]+)",
        ],
        "registrationNumber": [
            r"Registration\s*(?:Number|No\.?)\s*[:\-]\s*([-A-Za-z0-9_/]+)",
            r"Document\s*(?:Number|No\.?)\s*[:\-]\s*([-A-Za-z0-9_/]+)",
            r"Reg\s*(?:Number|No\.?)\s*[:\-]\s*([-A-Za-z0-9_/]+)",
        ],
        "documentDate": [
            r"(?:Registration\s*)?Date\s*[:\-]\s*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2}|[0-9]{2}[-/][0-9]{2}[-/][0-9]{4})",
            r"Document\s*Date\s*[:\-]\s*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2}|[0-9]{2}[-/][0-9]{2}[-/][0-9]{4})",
        ],
        "previousOwner": [
            r"Previous\s*Owner\s*[:\-]\s*([^\n\r]+)",
            r"Seller\s*[:\-]\s*([^\n\r]+)",
            r"Transferor\s*[:\-]\s*([^\n\r]+)",
        ],
    }

    for field, field_patterns in patterns.items():
        for p in field_patterns:
            match = re.search(p, text, re.IGNORECASE)
            if match:
                val = match.group(1).strip()
                val = re.sub(r"[.,;]+$", "", val)
                data[field] = val
                break

    # Infer district from location if missing
    if not data["district"] and data["propertyLocation"]:
        loc = data["propertyLocation"]
        for d in ["Palghar", "Thane", "Mumbai", "Pune", "Nashik", "Nagpur", "Aurangabad", "Ratnagiri"]:
            if re.search(rf"\b{d}\b", loc, re.IGNORECASE):
                data["district"] = d
                break

    return data


def analyze_document(file_path):
    """
    Main document analysis runner
    """
    if not os.path.exists(file_path):
        return {
            "success": False,
            "error": f"File not found: {file_path}",
            "readability": "FAIL",
            "extractedData": {},
        }

    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    page_count = 0
    read_err = None

    if ext == ".pdf":
        text, page_count, read_err = extract_text_from_pdf(file_path)
    else:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
            page_count = 1
        except Exception as e:
            read_err = str(e)

    if read_err and not text:
        return {
            "success": False,
            "readability": "FAIL",
            "error": read_err,
            "extractedData": {},
        }

    readability = "PASS" if len(text.strip()) > 10 else "POOR"
    fields = parse_document_fields(text)

    return {
        "success": True,
        "readability": readability,
        "pageCount": page_count,
        "textLength": len(text),
        "rawSnippet": text[:300].strip(),
        "extractedData": fields,
    }


if __name__ == "__main__":
    if len(sys.argv) >= 2:
        target_path = sys.argv[1]
    else:
        # Default self-test path when executed directly in VS Code
        base_dir = os.path.dirname(os.path.abspath(__file__))
        demo_path = os.path.join(base_dir, "..", "docs", "real_property_document.pdf")
        if os.path.exists(demo_path):
            target_path = demo_path
        else:
            print(json.dumps({"success": False, "error": "No file path provided"}))
            sys.exit(1)

    result = analyze_document(target_path)
    print(json.dumps(result, indent=2))
