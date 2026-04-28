import requests

url = "http://127.0.0.1:8000/chat"

data = {
    "query": "What is this paper about?"
}

try:
    response = requests.post(url, json=data)

    print("Status Code:", response.status_code)
    print("Response JSON:\n", response.json())

except Exception as e:
    print("Error:", e)