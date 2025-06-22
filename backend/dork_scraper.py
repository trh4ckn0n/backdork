# backend/dork_scraper_api.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
import httpx, openai, os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)

HEADERS = {"User-Agent": "Mozilla/5.0"}

DEFAULT_VULNERABILITIES = [
    "SQL Injection",
    "XSS",
    "LFI",
    "RCE",
    "Directory Traversal"
]

def scrape_google(dork, num_results=10):
    url = f"https://www.google.com/search?q={dork}&num={num_results}"
    r = httpx.get(url, headers=HEADERS)
    soup = BeautifulSoup(r.text, 'html.parser')
    links = [a['href'] for a in soup.select('div.yuRUbf > a[href]')]
    return links

def gpt_risk_analysis(url, dork, vuln_filter):
    prompt = f"Analyse cette URL pour des risques potentiels : {url}\n\nLe dork utilisé était : '{dork}'.\n\nConcentre-toi sur les vulnérabilités suivantes : {', '.join(vuln_filter)}.\n\nRéponds brièvement avec une estimation du type de faille si trouvée."
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    return response['choices'][0]['message']['content']

@app.route("/api/scrape", methods=["POST"])
def scan():
    data = request.json
    dorks = data.get("dorks", [])
    tld = data.get("country", "")
    use_gpt = data.get("gpt", False)
    vulnerabilities = data.get("vulnerabilities", DEFAULT_VULNERABILITIES)
    num_results = int(data.get("results_per_dork", 10))

    all_results = []
    for dork in dorks:
        full_dork = f"{dork} site:{tld}" if "site:" not in dork and tld else dork
        urls = scrape_google(full_dork, num_results)
        for url in urls:
            risk = gpt_risk_analysis(url, full_dork, vulnerabilities) if use_gpt else "GPT disabled"
            all_results.append({"dork": full_dork, "url": url, "risk": risk, "country": tld})

    return jsonify(all_results)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
