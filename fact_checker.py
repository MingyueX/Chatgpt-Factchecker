from bs4 import BeautifulSoup
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import requests
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

NEWS_API_KEY = "e06e50822c964d779b935c598891e777"
GUARDIAN_API_KEY = "4bddfc05-be0f-47e7-b9b2-6c8ecdbed845"
GOOGLE_API_KEY = 'AIzaSyAiIFM0IcRbxkC1uHfeB3tXmVbmZLdZdvk'
OPENAI_API_KEY = "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"

news_api_url = "https://newsapi.org/v2/everything"
guardian_api_url = "https://content.guardianapis.com/search"
google_api_url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
openai_api_url = "https://api.openai.com/v1/completions"

nlp = spacy.load("en_core_web_sm")

device = torch.device(
    "cuda") if torch.cuda.is_available() else torch.device("cpu")

model_name = "MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name).to(device)


def extractURL(str):
    url_list = []

    # Regular Expression to extract URL from the string
    regex = r'\b((?:https?|ftp|file):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\/%=~_|])'

    p = re.compile(regex, re.IGNORECASE)
    m = p.finditer(str)

    for match in m:
        # Find the substring from the first index of match result to the last index of match result and add in the list
        url_list.append(str[match.start():match.end()])

    return url_list

# useless so far


def search_snopes(query):
    base_url = 'https://www.snopes.com'
    search_url = f"{base_url}/search/?q={query}"
    response = requests.get(search_url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        search_results = soup.find_all('div', class_='search-result')

        for result in search_results:
            title = result.find('h3').text.strip()
            link = result.find('a')['href']
            description = result.find(
                'div', class_='search-excerpt').text.strip()

            print(f"Title: {title}")
            print(f"Link: {link}")
            print(f"Description: {description}")


def extract_entities(text):
    doc = nlp(text)
    entities = [ent.text for ent in doc.ents]
    return entities


def get_page_content(url):
    response = requests.get(url)
    content = None

    if response.status_code == 200:
        # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        if soup:
            content = ''
            paragraphs = soup.find_all('p')
            for p in paragraphs:
                content += p.text
        return content
    else:
        print(f"Failed to fetch the content of the URL: {url}")
        return None


def gather_evidence(statement, threshold=0.1):
    entities = extract_entities(statement)
    if not entities:
        entities = [statement]

    evidence = []
    for keyword_query in entities:
        news_api_data = fetch_articles(
            f"{news_api_url}?q={keyword_query}&apiKey={NEWS_API_KEY}")
        guardian_api_data = fetch_articles(
            f"{guardian_api_url}?q={keyword_query}&api-key={GUARDIAN_API_KEY}")
        google_api_data = requests.get(google_api_url, params={
                                       "key": GOOGLE_API_KEY, "query": keyword_query, "languageCode": 'en-US'}).json()

        url_list = []
        try:
            basePromptPrefix = 'Fact check the following statement and give a list of links to articles that are reliable sources.'
            openai_api_data = requests.post(openai_api_url, headers={
                "Content-Type": "application/json",
                "Authorization": f'Bearer {OPENAI_API_KEY}',
            }, json={
                'model': "text-davinci-003",
                'prompt': f'{basePromptPrefix} {statement}',
                'max_tokens': 1250,
                'temperature': 0.7,
            })

            openai_api_data.raise_for_status()
            openai_api_data = openai_api_data.json()
            openai_result = openai_api_data.get(
                "choices", [])[0].get("text", "")
            url_list = extractURL(openai_result)
        except requests.exceptions.HTTPError as err:
            print(err)

        for url in url_list:
            content = get_page_content(url)
            if content:
                # Calculate cosine similarity between the statement and article information
                vectorizer = TfidfVectorizer()
                text_matrix = vectorizer.fit_transform(
                    [statement, content])
                similarity = cosine_similarity(
                    text_matrix[0:1], text_matrix[1:])

                # Add the article information to the evidence if the similarity is above the threshold
                if similarity[0][0] > threshold:
                    evidence.append({"content": content, "url": url})

        if news_api_data:
            for article in news_api_data.get("articles", []):
                title = article.get("title", "")
                content = article.get("content", "")

                vectorizer = TfidfVectorizer()
                text_matrix = vectorizer.fit_transform(
                    [statement, title + " " + content])
                similarity = cosine_similarity(
                    text_matrix[0:1], text_matrix[1:])

                if similarity[0][0] > threshold:
                    evidence.append(
                        {"content": title + " " + content, "url": article.get("url", "")})

        if guardian_api_data:
            for article in guardian_api_data.get("response", "").get("results", []):
                description = article.get("webTitle", "")

                vectorizer = TfidfVectorizer()
                text_matrix = vectorizer.fit_transform(
                    [statement, description])
                similarity = cosine_similarity(
                    text_matrix[0:1], text_matrix[1:])

                if similarity[0][0] > threshold:
                    evidence.append(
                        {"content": description, "url": article.get("webUrl", "")})

        if google_api_data:
            for article in google_api_data.get("claimReview", []):
                description = article.get("title", "")

                vectorizer = TfidfVectorizer()
                text_matrix = vectorizer.fit_transform(
                    [statement, description])
                similarity = cosine_similarity(
                    text_matrix[0:1], text_matrix[1:])

                if similarity[0][0] > threshold:
                    evidence.append(
                        {"content": description, "url": article.get("url", "")})

    return evidence


def check_fact_with_evidence(statement, evidence):
    if evidence is None:
        return {"result": "No evidence found"}
    results = []
    for ev in evidence:
        input = tokenizer(ev["content"], statement,
                          truncation=True, return_tensors="pt")
        # device = "cuda:0" or "cpu"
        output = model(input["input_ids"].to(device))
        prediction = torch.softmax(output["logits"][0], -1).tolist()
        label_names = ["entailment", "neutral", "contradiction"]
        prediction = {name: round(float(pred) * 100, 1)
                      for pred, name in zip(prediction, label_names)}
        results.append({"prediction": prediction, "url": ev["url"]})

    if len(results) == 0:
        return {"result": "No evidence found"}

    entailment = contradiction = []
    total_entailment = total_contradiction = 0
    for result in results:
        pred = result["prediction"]
        total_entailment += pred["entailment"]
        total_contradiction += pred["contradiction"]
        if pred["entailment"] > 20:
            entailment.append(result)
        if pred["contradiction"] > 20:
            contradiction.append(result)

    num_predictions = len(results)
    avg_entailment = total_entailment / num_predictions
    avg_contradiction = total_contradiction / num_predictions

    if avg_entailment <= 1 and avg_contradiction <= 1:
        return {"result": "No evidence found"}

    if avg_entailment > avg_contradiction:
        score = 0
        for entail in entailment:
            score += entail["prediction"]["entailment"]
        divider = max(len(entailment), 1)
        score = score / divider
        evidence = []
        for entail in entailment:
            if entail["prediction"]["entailment"] >= score:
                evidence.append(entail["url"])
        score = round(score, 3)
        return {"result": "True", "score": score, "evidence": evidence}
    else:
        score = 0
        for contra in contradiction:
            score += contra["prediction"]["contradiction"]
        divider = max(len(contradiction), 1)
        score = score / divider
        evidence = []
        for contra in contradiction:
            if contra["prediction"]["contradiction"] >= score:
                evidence.append(contra["url"])
        score = round(score, 3)
        return {"result": "False", "score": score, "evidence": evidence}


def fetch_articles(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as err:
        print(err)
        return None


def check_url(url):
    try:
        response = requests.head(url)
        response.raise_for_status()
        result = response.status_code >= 200 and response.status_code < 400
        return {"result": result}
    except requests.exceptions.HTTPError as err:
        print(err)
        return {"result": False}
