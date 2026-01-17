# Our Daily Buys (Static + JSON)

This is a static affiliate recommendation website.
All content comes from `products.json`.

## How to update products
1. Edit `products.json`
2. Commit + push to GitHub
3. Site updates automatically (GitHub Pages)

## Run locally
Just open `index.html` in a browser.
(For fetch() to work reliably, use a simple local server.)

### Option A: VS Code Live Server
- Install "Live Server" extension
- Right click `index.html` -> "Open with Live Server"

### Option B: Python server
python -m http.server 8000

Then open:
http://localhost:8000

## Deploy on GitHub Pages
1. Create a GitHub repo and push these files
2. GitHub repo -> Settings -> Pages
3. "Build and deployment" -> Deploy from branch
4. Branch: main / root
5. Save

Your site will be live on a github.io URL.

