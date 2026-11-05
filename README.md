# Aria – Portfolio Chatbot for Faria Rajpoot

Flask backend (Python 3.11.9) + HTML/CSS/JS frontend, powered by the OpenRouter API.

## Run in VS Code
1. Open this folder in VS Code (`File > Open Folder`).
2. Open a terminal (`Ctrl+``) and create a virtual environment:
   ```
   py -3.11 -m venv .venv          # Windows
   .venv\Scripts\activate
   ```
   (macOS/Linux: `python3.11 -m venv .venv && source .venv/bin/activate`)
3. Install packages: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and paste your OpenRouter key.
5. Select the `.venv` interpreter (`Ctrl+Shift+P` → "Python: Select Interpreter").
6. Run `python app.py` (or press F5), then open http://127.0.0.1:5000

## Customize
- `portfolio_data.py` – Aria's knowledge (replace the placeholder email/GitHub/LinkedIn).
- `static/style.css` – colors live in the `:root` variables at the top.
- `.env` – change `OPENROUTER_MODEL` to any model on openrouter.ai/models.
