import ThemeToggle from "../components/ThemeToggle";

export const metadata = {
  title: "OmniDesk Pro",
  description: "Full-stack productivity dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root{
                --bg:#0f0f0f;
                --text:#f5f5f5;
                --card-bg:#161616;
                --card-border:#222;
                --muted:#aaa;
                --link:#9cdcfe;
              }

              * { box-sizing: border-box; }
              a { 
                color: var(--link); 
                text-decoration: none; 
              }
              a:hover {
                text-decoration: underline;
              }
              button {
                font-family: inherit;
              }
            `,
          }}
        />
      </head>

      <body
        style={{
          margin: 0,
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", minHeight: "100vh" }}>
          {/* ========== SIDEBAR ========== */}
          <aside
            style={{
              width: 240,
              padding: 20,
              borderRight: "1px solid var(--card-border)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>OmniDesk</h2>
              <p style={{ margin: "4px 0", color: "var(--muted)", fontSize: 13 }}>
                Productivity Suite
              </p>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="/dashboard">📊 Dashboard</a>
              <a href="/tasks">✅ Tasks</a>
              <a href="/activity">📜 Activity</a>
              <a href="/notes">📝 Notes</a>
            </nav>


            <div style={{ marginTop: "auto" }}>
              <ThemeToggle />
            </div>
          </aside>

          {/* ========== MAIN CONTENT ========== */}
          <main
            style={{
              flex: 1,
              padding: 32,
              overflowY: "auto",
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
