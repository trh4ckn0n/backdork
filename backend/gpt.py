import openai

openai.api_key = "ta_clé"

def gpt4_analyze_url(url, dork):
    prompt = f"Analyse cette URL trouvée avec le dork '{dork}': {url}. Peux-tu déterminer si elle est potentiellement vulnérable à une injection SQL, LFI, RCE, ou autre ?"
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    return response['choices'][0]['message']['content']
