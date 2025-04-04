import requests
from typing import List, Dict
from collections import Counter
import re
import logging
from functools import lru_cache
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import time

# Configuration
class Config:
    OR_SUMMARY_API = "https://openrouter.ai/api/v1/chat/completions"
    OR_TOKEN = "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"
    MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment"
    MAX_LENGTH = 512
    SUMMARY_MIN_LENGTH = 100
    SUMMARY_MAX_LENGTH = 200
    SUMMARY_PROMPT = "Summarize the following YouTube comments in a detailed 100–200 words summary"
    KEYWORD_MIN_FREQ = 2
    BATCH_SIZE = 32  # Adjust based on your hardware

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self):
        start_time = time.time()
        self.or_headers = {"Authorization": f"Bearer {Config.OR_TOKEN}"}
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(Config.MODEL_NAME)
            self.model = AutoModelForSequenceClassification.from_pretrained(Config.MODEL_NAME)
            self.model.to(self.device)
            self.model.eval()
            logger.info(f"Loaded model '{Config.MODEL_NAME}' on {self.device} in {time.time() - start_time:.2f}s")
        except Exception as e:
            logger.error(f"Model loading failed: {str(e)}")
            raise

    def preprocess_comments(self, comments: List[str]) -> List[str]:
        start_time = time.time()
        def clean_comment(comment: str) -> str:
            comment = re.sub(r'http\S+|www\S+|https\S+', '', comment, flags=re.MULTILINE)
            comment = re.sub(r'[^\w\s!?]', '', comment)
            return comment.lower().strip()[:Config.MAX_LENGTH]
        processed = [clean_comment(comment) for comment in comments]
        logger.info(f"Preprocessed {len(comments)} comments in {time.time() - start_time:.2f}s")
        return processed

    def extract_keywords(self, comments: List[str]) -> List[str]:
        start_time = time.time()
        words = " ".join(comments).split()
        word_counts = Counter(words)
        keywords = [word for word, count in word_counts.items() 
                    if count >= Config.KEYWORD_MIN_FREQ and len(word) > 3]
        logger.debug(f"Extracted {len(keywords)} keywords in {time.time() - start_time:.2f}s")
        return keywords[:5]

    def analyze_themes(self, comments: List[str], sentiments: List[str]) -> Dict[str, int]:
        start_time = time.time()
        keywords = self.extract_keywords(comments)
        theme_sentiments = {keyword: Counter() for keyword in keywords}
        for comment, sentiment in zip(comments, sentiments):
            for keyword in keywords:
                if keyword in comment.lower():
                    theme_sentiments[keyword][sentiment] += 1
        result = {}
        for keyword, counts in theme_sentiments.items():
            total = sum(counts.values())
            if total > 0:
                sentiment_score = (counts["positive"] - counts["negative"]) / total
                rating = round(((sentiment_score + 1) / 2) * 4 + 1)
                result[keyword] = rating
        logger.debug(f"Analyzed themes for {len(keywords)} keywords in {time.time() - start_time:.2f}s")
        return result

    def length_analysis(self, comments: List[str], sentiments: List[str]) -> Dict[str, float]:
        start_time = time.time()
        lengths = {"positive": [], "negative": [], "neutral": []}
        for comment, sentiment in zip(comments, sentiments):
            lengths[sentiment].append(len(comment.split()))
        result = {
            "avg_length": round(sum(len(c.split()) for c in comments) / len(comments), 2) if comments else 0.0,
            "positive_avg": round(sum(lengths["positive"]) / len(lengths["positive"]), 2) if lengths["positive"] else 0.0,
            "negative_avg": round(sum(lengths["negative"]) / len(lengths["negative"]), 2) if lengths["negative"] else 0.0,
            "neutral_avg": round(sum(lengths["neutral"]) / len(lengths["neutral"]), 2) if lengths["neutral"] else 0.0
        }
        logger.debug(f"Computed length analysis in {time.time() - start_time:.2f}s")
        return result

    def top_comments(self, comments: List[str], results: List[Dict]) -> Dict[str, str]:
        start_time = time.time()
        positive_comments = [(c, r["score"]) for c, r in zip(comments, results) if r["label"] == "LABEL_2"]
        negative_comments = [(c, r["score"]) for c, r in zip(comments, results) if r["label"] == "LABEL_0"]
        top_positive = max(positive_comments, key=lambda x: x[1], default=("", 0.0))[0]
        top_negative = max(negative_comments, key=lambda x: x[1], default=("", 0.0))[0]
        logger.debug(f"Selected top comments in {time.time() - start_time:.2f}s")
        return {"top_positive": top_positive, "top_negative": top_negative}

    def extract_suggestions(self, comments: List[str]) -> List[str]:
        start_time = time.time()
        suggestion_patterns = [
            r"could\s+(be|have|use|add|improve)\s+\w+",
            r"should\s+(be|have|add|fix)\s+\w+",
            r"needs\s+(to|more)\s+\w+",
            r"would\s+be\s+better\s+if\s+\w+"
        ]
        suggestions = []
        for comment in comments:
            for pattern in suggestion_patterns:
                match = re.search(pattern, comment.lower())
                if match:
                    suggestions.append(match.group(0))
                    break  # One suggestion per comment
        logger.debug(f"Extracted {len(suggestions)} suggestions in {time.time() - start_time:.2f}s")
        return suggestions[:3]

    def analyze_sentiments(self, comments: List[str]) -> List[Dict]:
        start_time = time.time()
        # Batch tokenization
        inputs = self.tokenizer(comments, padding=True, truncation=True, max_length=Config.MAX_LENGTH, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        logger.debug(f"Tokenized {len(comments)} comments in {time.time() - start_time:.2f}s")

        # Batch inference
        with torch.no_grad():
            outputs = self.model(**inputs)
            scores = torch.softmax(outputs.logits, dim=1)  # [batch_size, 3] (neg, neu, pos)
            labels = ["LABEL_0", "LABEL_1", "LABEL_2"]
            max_scores, max_indices = scores.max(dim=1)
            results = [{"label": labels[idx], "score": score.item()} 
                      for idx, score in zip(max_indices, max_scores)]
        logger.info(f"Analyzed sentiments for {len(comments)} comments in {time.time() - start_time:.2f}s")
        return results

    def summarize(self, comments: List[str]) -> str:
        start_time = time.time()
        if not comments:
            return "No comments to summarize."
        
        processed_comments = self.preprocess_comments(comments)
        if len(" ".join(processed_comments).split()) < 50:
            return f"Comments are brief: {' '.join(processed_comments)[:Config.MAX_LENGTH]}..."
        
        results = self.analyze_sentiments(processed_comments)
        sentiments = [
            'negative' if r['label'] == 'LABEL_0' else
            'neutral' if r['label'] == 'LABEL_1' else
            'positive' if r['label'] == 'LABEL_2' else
            'neutral' for r in results
        ]
        sentiment_counts = Counter(sentiments)
        total = len(comments)
        sentiment_percentages = {
            "positive": round((sentiment_counts["positive"] / total) * 100, 2),
            "negative": round((sentiment_counts["negative"] / total) * 100, 2),
            "neutral": round((sentiment_counts["neutral"] / total) * 100, 2)
        }

        try:
            prompt = (
                f"{Config.SUMMARY_PROMPT}: {sentiment_percentages['positive']}% positive "
                f"(praising visuals, storytelling, effort), {sentiment_percentages['negative']}% negative "
                f"(criticizing audio, pacing, outdated content), {sentiment_percentages['neutral']}% neutral "
                f"(noting length, presentation). Provide a concise overview without repeating the original comments."
            )
            payload = {
                "model": "mistralai/mixtral-8x7b-instruct",
                "messages": [{"role": "user", "content": prompt}]
            }
            response_start = time.time()
            response = requests.post(Config.OR_SUMMARY_API, headers=self.or_headers, json=payload)
            logger.debug(f"OpenRouter API response time: {time.time() - response_start:.2f}s")
            if response.status_code == 200:
                summary = response.json()["choices"][0]["message"]["content"]
                word_count = len(summary.split())
                if word_count < Config.SUMMARY_MIN_LENGTH:
                    summary += " Viewers offered diverse feedback on quality and execution."
                elif word_count > Config.SUMMARY_MAX_LENGTH:
                    summary = " ".join(summary.split()[:Config.SUMMARY_MAX_LENGTH])
                logger.info(f"Generated summary in {time.time() - start_time:.2f}s")
                return summary
            else:
                logger.error(f"OR API error: {response.status_code} - {response.text}")
                raise Exception("Summarization API failed")
        except Exception as e:
            logger.error(f"Summarization failed: {str(e)}")
            return (
                f"Comments show mixed feedback: {sentiment_percentages['positive']}% positive, "
                f"{sentiment_percentages['negative']}% negative, {sentiment_percentages['neutral']}% neutral."
            )

    @lru_cache(maxsize=1000)
    def analyze_cached(self, comments_tuple: tuple) -> Dict[str, any]:
        return self.analyze(list(comments_tuple))

    def analyze(self, comments: List[str]) -> Dict[str, any]:
        start_time = time.time()
        if not comments:
            return {
                "sentiment_percentages": {"positive": 0.0, "negative": 0.0, "neutral": 0.0},
                "summary": "No comments to summarize.",
                "key_themes": {},
                "length_analysis": {"avg_length": 0.0, "positive_avg": 0.0, "negative_avg": 0.0, "neutral_avg": 0.0},
                "top_comments": {"top_positive": "", "top_negative": ""},
                "suggestions": []
            }

        processed_comments = self.preprocess_comments(comments)
        results = self.analyze_sentiments(processed_comments)
        sentiments = [
            'negative' if r['label'] == 'LABEL_0' else
            'neutral' if r['label'] == 'LABEL_1' else
            'positive' if r['label'] == 'LABEL_2' else
            'neutral' for r in results
        ]
        sentiment_counts = Counter(sentiments)
        total = len(comments)

        output = {
            "sentiment_percentages": {
                "positive": round((sentiment_counts["positive"] / total) * 100, 2),
                "negative": round((sentiment_counts["negative"] / total) * 100, 2),
                "neutral": round((sentiment_counts["neutral"] / total) * 100, 2)
            },
            "summary": self.summarize(comments),
            "key_themes": self.analyze_themes(comments, sentiments),
            "length_analysis": self.length_analysis(comments, sentiments),
            "top_comments": self.top_comments(comments, results),
            "suggestions": self.extract_suggestions(comments)
        }
        logger.info(f"Completed analysis of {len(comments)} comments in {time.time() - start_time:.2f}s")
        return output

