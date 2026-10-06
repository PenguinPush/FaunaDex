FaunaDex demo (Next.js + Python API)

From the repository root, run these in separate terminals:

  .venv/bin/python -m backend.demo.app
  npm --prefix demo run dev

Open http://localhost:3000. Restart any Python server that was running before
this migration; it must use the updated backend/demo paths.

For a production build:

  npm --prefix demo run build
  npm --prefix demo start

The Python API still needs to be running. Next.js validates animal additions with @2toad/profanity before forwarding
/api/animals. Other API routes and /demo-images/* are forwarded to
http://127.0.0.1:5050. Keep that Python service private; public clients should
use the Next.js API so additions pass through the filter. Set BACKEND_URL in demo/.env.local
(or the process environment) before starting dev or building to change it.
The Python root URL redirects to the demo; DEMO_URL overrides that destination.
Keep provider credentials in the existing root .env for the Python backend.
Do not expose provider keys through NEXT_PUBLIC_ variables.

Structure:
  app/page.jsx                  Next.js page entry
  app/layout.jsx                Document metadata, favicon, fonts, body
  app/globals.css               Tailwind theme and animation keyframes
  components/DemoContainer.jsx  Header, two-panel workspace, footer
  components/Header.jsx         Existing page header
  components/Footer.jsx         Attribution and repository links
  components/LeftPanel.jsx      Demo photos, upload and description controls
  components/GraphPanel.jsx     Results, graph, finder and animal additions
  lib/                          Scoped interaction, graph and motion controllers
  public/static/dex-mark.png     Header mark and favicon
  ../backend/demo/images/       Original demo photos served by the Python API

Next.js compiles CSS and JavaScript automatically. The old index.html,
app.js, graph.bundle.js and manual CSS/JS build commands are no longer used.

Checks:
  npm --prefix demo test
  npm --prefix demo run format:check
  npm --prefix demo run build
  .venv/bin/python -m unittest discover -s backend/tests

Railway deployment:
  See ../deploy/railway.txt for the two-service setup, private backend URL,
  persistent volume, initial database upload, and required environment variables.
