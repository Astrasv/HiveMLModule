# test_sentiment_api.py
import pytest
from fastapi.testclient import TestClient
from sentiment_model import SentimentAnalyzer, Config
from api import app
import torch
from unittest.mock import patch, Mock
from typing import List
import time

# Test fixtures
@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)

@pytest.fixture
def analyzer():
    """Create a SentimentAnalyzer instance for testing."""
    return SentimentAnalyzer()

@pytest.fixture
def sample_comments():
    """Sample comments for testing."""
    return [
        "This video is absolutely amazing! Great work!",
        "Terrible content, really disappointing",
        "It's an okay video, nothing special",
        "Love the visuals but sound needs improvement",
        "Worst experience ever, please fix this"
    ]

# Sentiment Model Tests
class TestSentimentAnalyzer:
    def test_initialization(self, analyzer):
        """Test analyzer initialization."""
        assert analyzer.tokenizer is not None
        assert analyzer.model is not None
        assert str(analyzer.device) in ["cuda", "cpu"]

    def test_preprocess_comments(self, analyzer):
        """Test comment preprocessing."""
        comments = ["Check this https://example.com", "LOUD TEXT!!!"]
        processed = analyzer.preprocess_comments(comments)
        assert len(processed) == 2
        assert "https" not in processed[0]
        assert processed[1] == "loud text"

    def test_analyze_sentiments(self, analyzer):
        """Test sentiment analysis."""
        comments = ["Great!", "Bad", "Okay"]
        results = analyzer.analyze_sentiments(comments)
        assert len(results) == 3
        assert all(r["label"] in ["LABEL_0", "LABEL_1", "LABEL_2"] for r in results)
        assert all(0 <= r["score"] <= 1 for r in results)

    def test_empty_comments(self, analyzer):
        """Test handling of empty comment list."""
        result = analyzer.analyze([])
        assert result["sentiment_percentages"] == {"positive": 0.0, "negative": 0.0, "neutral": 0.0}
        assert "No comments" in result["summary"]

    def test_extract_keywords(self, analyzer, sample_comments):
        """Test keyword extraction."""
        keywords = analyzer.extract_keywords(sample_comments)
        assert len(keywords) <= 5
        assert all(len(k) > 3 for k in keywords)

    @patch('requests.post')
    def test_summarize_api_failure(self, mock_post, analyzer):
        """Test summary generation with API failure."""
        mock_post.return_value = Mock(status_code=500, text="Server error")
        comments = ["Good", "Bad"]
        summary = analyzer.summarize(comments)
        assert "mixed feedback" in summary

# API Tests
class TestAPI:
    def test_health_endpoint(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

    def test_analyze_endpoint_success(self, client, sample_comments):
        """Test successful sentiment analysis endpoint."""
        response = client.post("/analyze-sentiments/", json={"comments": sample_comments})
        assert response.status_code == 200
        result = response.json()
        
        # Verify response structure
        assert "sentiment_percentages" in result
        assert sum(result["sentiment_percentages"].values()) == pytest.approx(100.0, 0.1)
        assert "summary" in result
        assert Config.SUMMARY_MIN_LENGTH <= len(result["summary"].split()) <= Config.SUMMARY_MAX_LENGTH
        assert "key_themes" in result
        assert "length_analysis" in result
        assert "top_comments" in result
        assert "suggestions" in result

    def test_analyze_endpoint_empty(self, client):
        """Test endpoint with empty comments."""
        response = client.post("/analyze-sentiments/", json={"comments": []})
        assert response.status_code == 200
        result = response.json()
        assert result["sentiment_percentages"]["positive"] == 0.0
        assert "No comments" in result["summary"]

    def test_analyze_endpoint_invalid_length(self, client):
        """Test endpoint with too long comments."""
        long_comment = "a" * (Config.MAX_LENGTH + 1)
        response = client.post("/analyze-sentiments/", json={"comments": [long_comment]})
        assert response.status_code == 422
        assert "exceed" in response.json()["detail"]

    def test_analyze_endpoint_malformed_input(self, client):
        """Test endpoint with malformed input."""
        response = client.post("/analyze-sentiments/", json={"wrong_key": ["test"]})
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_concurrent_requests(self, client, sample_comments):
        """Test API handling of concurrent requests."""
        import asyncio
        
        async def make_request():
            return client.post("/analyze-sentiments/", json={"comments": sample_comments})
        
        tasks = [make_request() for _ in range(5)]
        responses = await asyncio.gather(*tasks)
        
        assert all(r.status_code == 200 for r in responses)
        results = [r.json() for r in responses]
        assert all(len(r["summary"]) > 0 for r in results)

# Performance Tests
class TestPerformance:
    @pytest.mark.parametrize("batch_size", [10, 50, 100])
    def test_large_batch(self, analyzer, batch_size):
        """Test performance with large batches."""
        comments = ["Test comment " + str(i) for i in range(batch_size)]
        start_time = time.time()
        result = analyzer.analyze(comments)
        duration = time.time() - start_time
        
        assert duration < 10.0  # Should complete within 10 seconds
        assert len(result["summary"]) > 0

if __name__ == "__main__":
    pytest.main(["test_sentiment_api.py", "-v"])