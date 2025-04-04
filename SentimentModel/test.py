from sentiment_model import SentimentAnalyzer, Config
from api import app
from fastapi.testclient import TestClient
import pytest

client = TestClient(app)
analyzer = SentimentAnalyzer()

def test_analyze():
    """Test sentiment analysis and additional insights."""
    comments = ["This is great!", "Awful video", "It's fine"]
    result = analyzer.analyze(comments)
    assert sum(result["sentiment_percentages"][k] for k in ["positive", "negative", "neutral"]) == pytest.approx(100.0, 0.01)
    assert "summary" in result
    assert isinstance(result["summary"], str)
    assert "key_themes" in result
    assert isinstance(result["key_themes"], dict)
    assert "length_analysis" in result
    assert "avg_length" in result["length_analysis"]
    assert "top_comments" in result
    assert "top_positive" in result["top_comments"]
    assert "suggestions" in result
    assert isinstance(result["suggestions"], list)

def test_api():
    """Test API endpoint."""
    payload = {"comments": ["Great!", "Bad", "Okay"]}
    response = client.post("/analyze-sentiments/", json=payload)
    assert response.status_code == 200
    result = response.json()
    assert "sentiment_percentages" in result
    assert "summary" in result
    assert "key_themes" in result
    assert "length_analysis" in result
    assert "top_comments" in result
    assert "suggestions" in result

def test_invalid_input():
    """Test API with invalid input."""
    payload = {"comments": ["a" * (Config.MAX_LENGTH + 1)]}
    response = client.post("/analyze-sentiments/", json=payload)
    assert response.status_code == 422

if __name__ == "__main__":
    pytest.main(["test.py"])