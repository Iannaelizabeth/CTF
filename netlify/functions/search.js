function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getForwardedIp(headers) {
  const forwardedFor = headers["x-forwarded-for"] || headers["X-Forwarded-For"];

  if (!forwardedFor) {
    return "";
  }

  return forwardedFor.split(",")[0].trim();
}

exports.handler = async (event) => {
  const username = (event.queryStringParameters?.username || "").trim();

  if (!username) {
    return {
      statusCode: 302,
      headers: {
        Location: "/",
      },
      body: "",
    };
  }

  if (username !== "Admin") {
    return {
      statusCode: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
      body: `<!doctype html>
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
</html>`,
    };
  }

  const ip = getForwardedIp(event.headers || {});

  if (ip !== "127.0.0.1") {
    return {
      statusCode: 403,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
      body: `<!doctype html>
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
</html>`,
    };
  }

  return {
    statusCode: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
    body: `<!doctype html>
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
</html>`,
  };
};
