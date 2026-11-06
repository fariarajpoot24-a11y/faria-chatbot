import os
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

from portfolio_data import ASSISTANT_NAME, build_system_prompt

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

app = Flask(__name__, static_folder="static", static_url_path="")
SYSTEM_PROMPT = build_system_prompt()


@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.get("/api/info")
def info():
    return jsonify({"name": ASSISTANT_NAME})


@app.post("/api/chat")
def chat():
    if not API_KEY:
        return jsonify(error="Server is missing OPENROUTER_API_KEY."), 500

    data = request.get_json(silent=True) or {}
    history = data.get("messages", [])

    clean = [
        {"role": m["role"], "content": str(m["content"])[:2000]}
        for m in history
        if isinstance(m, dict)
        and m.get("role") in ("user", "assistant")
        and m.get("content")
    ][-12:]

    if not clean or clean[-1]["role"] != "user":
        return jsonify(error="No user message received."), 400

    payload = {
        "model": MODEL,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}, *clean],
        "temperature": 0.5,
        "max_tokens": 500,
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": os.getenv(
            "SITE_URL", "https://fariarajpoot0-portfolio.netlify.app"
        ),
        "X-Title": f"{ASSISTANT_NAME} - Faria Rajpoot Portfolio",
    }

    try:
        response = requests.post(
            OPENROUTER_URL, json=payload, headers=headers, timeout=60
        )
        response.raise_for_status()
        reply = response.json()["choices"][0]["message"]["content"].strip()
        return jsonify(reply=reply)

    except requests.HTTPError:
        try:
            message = response.json().get("error", {}).get(
                "message", "OpenRouter request failed."
            )
        except Exception:
            message = "OpenRouter request failed."
        return jsonify(error=message), 502

    except (requests.RequestException, KeyError, IndexError, ValueError):
        return jsonify(error="Couldn't reach the AI service. Please try again."), 502


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
