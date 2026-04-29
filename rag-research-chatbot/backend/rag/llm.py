import requests
import os
import time

API_KEY = ""

def generate_answer(query, context):
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={API_KEY}"

    payload = {
        "contents": [{
            "parts": [{
                "text": f"""
You are a research assistant.
Answer ONLY using the context.

Context:
{context}

Question:
{query}
"""
            }]
        }]
    }

    for attempt in range(3):  # 🔁 retry 3 times
        try:
            response = requests.post(url, json=payload)
            data = response.json()

            print("Gemini response:", data)

            # ❌ handle error
            if "error" in data:
                if data["error"]["code"] == 503:
                    time.sleep(2)  # wait and retry
                    continue
                return f"Gemini Error: {data['error']['message']}"

            return data["candidates"][0]["content"]["parts"][0]["text"]

        except Exception as e:
            time.sleep(2)

    return "⚠️ Server busy. Please try again."
