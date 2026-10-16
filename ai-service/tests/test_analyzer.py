import importlib.util
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "analyzer.py"
spec = importlib.util.spec_from_file_location("bhoomichain_analyzer", MODULE_PATH)
analyzer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(analyzer)


def test_extracts_property_details():
    text = """
    Owner Name: Mehul Kasrung
    Survey Number: SUR-1024
    Area: 1200 sq.ft
    Location: Virar, Palghar, Maharashtra
    Property Type: RESIDENTIAL_LAND
    Registration Number: REG-2026-001
    """
    result = analyzer.parse_document_fields(text)

    assert result["ownerName"] == "Mehul Kasrung"
    assert result["surveyNumber"] == "SUR-1024"
    assert result["area"] == "1200 sq.ft"
    assert result["propertyLocation"] == "Virar, Palghar, Maharashtra"
    assert result["district"] == "Palghar"
    assert result["propertyType"] == "RESIDENTIAL_LAND"
    assert result["registrationNumber"] == "REG-2026-001"


def test_blank_document_fields():
    result = analyzer.parse_document_fields("")

    assert result["ownerName"] is None
    assert result["surveyNumber"] is None
    assert result["area"] is None
    assert result["propertyLocation"] is None


def test_extracts_previous_owner():
    result = analyzer.parse_document_fields(
        "Gat Number: GAT-88A\nSeller: Previous Owner Name\n"
    )

    assert result["surveyNumber"] == "GAT-88A"
    assert result["previousOwner"] == "Previous Owner Name"


def test_reads_text_document(tmp_path):
    document = tmp_path / "sample_property.txt"
    document.write_text(
        "Owner Name: Asha Patil\nSurvey Number: SUR-45\nArea: 900 sq.ft\n",
        encoding="utf-8",
    )

    result = analyzer.analyze_document(str(document))

    assert result["success"] is True
    assert result["readability"] == "PASS"
    assert result["pageCount"] == 1
    assert result["extractedData"]["ownerName"] == "Asha Patil"
    assert result["extractedData"]["surveyNumber"] == "SUR-45"


def test_missing_document_returns_failure():
    result = analyzer.analyze_document(
        "definitely_missing_bhoomichain_test_file.txt"
    )

    assert result["success"] is False
    assert result["readability"] == "FAIL"
    assert "File not found" in result["error"]
    assert result["extractedData"] == {}
