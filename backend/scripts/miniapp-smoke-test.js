/**
 * Miniapp API smoke test
 *
 * Optional env:
 * - API_BASE=http://localhost:3000/api
 * - MINIAPP_TEST_CODE=mock-code
 * - MINIAPP_TEST_USERNAME=admin
 * - MINIAPP_TEST_PASSWORD=xxx
 * - MINIAPP_TEST_ROLE=owner|staff|guest
 * - MINIAPP_TEST_PROFILE_ID=1 (required for guest)
 */

const API_BASE = process.env.API_BASE || "http://localhost:3000/api";

async function request(path, method = "GET", body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const json = await res.json();
  return { status: res.status, json };
}

async function run() {
  console.log("[miniapp-smoke] API_BASE =", API_BASE);

  const health = await request("/health");
  if (!health.json.success) throw new Error("Health check failed");
  console.log("✓ health");

  const noAuthGuest = await request("/miniapp/guest/profile");
  if (noAuthGuest.status !== 401) throw new Error("Expected 401 for guest profile without token");
  console.log("✓ unauthorized guard");

  const code = process.env.MINIAPP_TEST_CODE;
  const username = process.env.MINIAPP_TEST_USERNAME;
  const password = process.env.MINIAPP_TEST_PASSWORD;
  if (!code || !username || !password) {
    console.log("! skip bind-login checks (set MINIAPP_TEST_CODE/USERNAME/PASSWORD to enable)");
    return;
  }

  const roleType = process.env.MINIAPP_TEST_ROLE || "owner";
  const profileIdRaw = process.env.MINIAPP_TEST_PROFILE_ID;
  const profileId = profileIdRaw ? Number(profileIdRaw) : undefined;

  const bindRes = await request("/wechat/auth/bind-login", "POST", {
    code,
    roleType,
    username,
    password,
    ...(roleType === "guest" ? { profileId } : {})
  });
  if (!bindRes.json.success || !bindRes.json.data?.token) {
    throw new Error(`Bind login failed: ${JSON.stringify(bindRes.json)}`);
  }
  console.log("✓ bind-login");

  const token = bindRes.json.data.token;
  if (roleType === "owner") {
    const ownerDash = await request("/miniapp/owner/dashboard", "GET", undefined, token);
    if (!ownerDash.json.success) throw new Error("Owner dashboard failed");
    console.log("✓ owner dashboard");
  }
  if (roleType === "staff") {
    const board = await request("/miniapp/staff/today-board", "GET", undefined, token);
    if (!board.json.success) throw new Error("Staff board failed");
    console.log("✓ staff board");
  }
  if (roleType === "guest") {
    const profile = await request("/miniapp/guest/profile", "GET", undefined, token);
    if (!profile.json.success) throw new Error("Guest profile failed");
    console.log("✓ guest profile");
  }
}

run()
  .then(() => {
    console.log("[miniapp-smoke] done");
    process.exit(0);
  })
  .catch(err => {
    console.error("[miniapp-smoke] failed:", err.message);
    process.exit(1);
  });
