const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (!forwardedFor) {
    return "";
  }

  // X-Forwarded-For may contain multiple IPs: "client, proxy1, proxy2"
  return forwardedFor.split(",")[0].trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/search", (req, res) => {
  const username = (req.query.username || "").trim();

  if (!username) {
    return res.redirect("/");
  }

  if (username !== "Admin") {
    return res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>User Not Found</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main class="card">
      <h1>User Profile Search</h1>
      <p>User ${escapeHtml(username)} not found.</p>
      <a class="button" href="/">Back to search</a>
    </main>
  </body>
</html>`);
  }

  const ip = getClientIp(req);

  if (ip !== "127.0.0.1") {
    return res.status(403).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Access Denied</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main class="card denied">
      <h1>Access Denied</h1>
      <p>Access Denied. Only local viewers (127.0.0.1) can see the Admin profile.</p>
      <a class="button" href="/">Back to search</a>
    </main>
  </body>
</html>`);
  }

  return res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin Profile</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main class="card admin">
      <h1>Admin Profile</h1>
      <p>Welcome back, Boss. All systems green.</p>
      <section class="notifications" aria-label="recent notifications">
        <h2>Recent Notifications</h2>
        <ul>
          <li><span class="tag">MEETING</span> Next leadership sync scheduled for 3:30 PM in Room Atlas.</li>
          <li><span class="tag">HR</span> Two new onboarding requests are waiting for approval.</li>
          <li><span class="tag">OPS</span> Weekly sales report was uploaded by Finance at 09:12 AM.</li>
          <li><span class="tag">SECURITY</span> Building access log shows one after-hours entry for review.</li>
        </ul>
      </section>
      <a class="button" href="/">Back to search</a>
    </main>
    <!-- ZmxhZ3tnM29kX2pvYl9oNGNrM3J9 -->
  </body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`CTF running on port ${PORT}`);
});
