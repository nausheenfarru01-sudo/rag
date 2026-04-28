import requests

url = "http://127.0.0.1:8000/upload"

# 👉 Change this path if needed
file_path = r"C:\temp\report.pdf"

try:
    with open(file_path, "rb") as f:
        files = {"file": f}
        response = requests.post(url, files=files)

    print("Status Code:", response.status_code)
    print("Response JSON:\n", response.json())

except FileNotFoundError:
    print("❌ File not found. Check the path.")
except Exception as e:
    print("❌ Error:", e)