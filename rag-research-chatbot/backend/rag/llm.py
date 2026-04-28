import requests
import os

API_KEY = "AIzaSyDkaklfl4t6gogvUxT6Z7r5PDOs3LdvXVk"

def generate_answer(query, context):
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={API_KEY}"

    prompt = f"""
You are a research assistant.

Answer ONLY using the context below.
If the answer is not in the context, say "Not enough information".

Context:
{context}

Question:
{query}
"""

    data = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    response = requests.post(url, json=data)
    result = response.json()

    print("Gemini response:", result)  # debug

    try:
        return result["candidates"][0]["content"]["parts"][0]["text"]
    except:
        return f"Gemini Error: {result}"