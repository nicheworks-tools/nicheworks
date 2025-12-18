/**
 * API Key & Token Redactor - local test data generator
 * Output is gitignored. Generate realistic-looking patterns for detection testing.
 *
 * Usage:
 *   node ./generate_testdata.js
 *
 * Optional:
 *   SAFE=1 node ./generate_testdata.js
 *   -> inserts zero-width spaces in common prefixes (less likely to match scanners),
 *      but may reduce match rate for your tool patterns.
 */

const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "testdata.generated.txt");
const SAFE = process.env.SAFE === "1";

// ---- helpers ----
function alphaNum(len) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function hex(len) {
  const chars = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function upperNum(len) {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// Example: "sk-" -> "s​k-" (ZWSP). SAFE mode only.
function maybeSplitPrefix(prefix) {
  if (!SAFE) return prefix;
  if (prefix.length <= 1) return prefix;
  return prefix.slice(0, 1) + "\u200b" + prefix.slice(1);
}

// ---- realistic-ish generators (for matching your tool) ----
function mkOpenAIKeyLike() {
  // sk-[A-Za-z0-9]{20,}
  return `${maybeSplitPrefix("sk-")}${alphaNum(36)}`;
}

function mkStripeSecretLike(liveOrTest = "test") {
  // sk_(live|test)_[A-Za-z0-9]{10,}
  const p = liveOrTest === "live" ? "live" : "test";
  return `${maybeSplitPrefix("sk_")}${p}_${alphaNum(28)}`;
}

function mkStripeRestrictedLike(liveOrTest = "test") {
  // rk_(live|test)_[A-Za-z0-9]{10,}
  const p = liveOrTest === "live" ? "live" : "test";
  return `${maybeSplitPrefix("rk_")}${p}_${alphaNum(28)}`;
}

function mkStripePublishableLike(liveOrTest = "test") {
  // pk_(live|test)_[A-Za-z0-9]{10,}
  const p = liveOrTest === "live" ? "live" : "test";
  return `${maybeSplitPrefix("pk_")}${p}_${alphaNum(28)}`;
}

function mkAWSAccessKeyLike(prefix = "AKIA") {
  // (AKIA|ASIA)[0-9A-Z]{16}
  return `${prefix}${upperNum(16)}`;
}

function mkGitHubTokenLike(kind = "ghp") {
  // gh[pous]_[A-Za-z0-9]{20,}
  return `${maybeSplitPrefix(`${kind}_`)}${alphaNum(36)}`;
}

function mkSlackTokenLike(kind = "xoxb") {
  // xox[baprs]-...
  // keep hyphenated parts
  const p = maybeSplitPrefix(`${kind}-`);
  return `${p}${alphaNum(12)}-${alphaNum(12)}-${alphaNum(24)}`;
}

function mkJWTLike() {
  // JWT 3 parts, base64url-ish
  const b64url = (n) =>
    alphaNum(n)
      .replace(/[+/=]/g, "A")
      .replace(/_/g, "B")
      .replace(/-/g, "C");
  const header = "eyJ" + b64url(24);
  const payload = b64url(28);
  const sig = b64url(40);
  return `${header}.${payload}.${sig}`;
}

function mkGoogleAPIKeyLike() {
  // AIza[0-9A-Za-z\-_]{30,}
  return `${maybeSplitPrefix("AIza")}Sy${alphaNum(34)}`
    .replace(/\+/g, "A")
    .replace(/\//g, "B");
}

function mkSendGridLike() {
  // SG.[A-Za-z0-9_-]{10,}.[A-Za-z0-9_-]{10,}
  return `${maybeSplitPrefix("SG.")}${alphaNum(18)}.${alphaNum(22)}`;
}

function mkTwilioSidLike() {
  // AC[0-9a-fA-F]{32}
  return `${maybeSplitPrefix("AC")}${hex(32)}`;
}

function mkTwilioKeyLike() {
  // SK[0-9a-fA-F]{32}
  return `${maybeSplitPrefix("SK")}${hex(32)}`;
}

function mkPemBlockLike() {
  return [
    "-----BEGIN PRIVATE KEY-----",
    "MIIE" + alphaNum(60),
    alphaNum(60),
    "-----END PRIVATE KEY-----",
  ].join("\n");
}

function mkTokenLike(len = 44) {
  // generic token_like: [A-Za-z0-9_-]{32,}
  return alphaNum(len).replace(/[+/=]/g, "Z");
}

// ---- cases (copy/paste blocks) ----
const cases = [
  ["[F-01] .env OpenAI key-like", `OPENAI_API_KEY=${mkOpenAIKeyLike()}`],
  ["[F-02] Bearer OpenAI key-like", `Authorization: Bearer ${mkOpenAIKeyLike()}`],
  ["[F-03] Stripe secret live-like", `STRIPE_SECRET=${mkStripeSecretLike("live")}`],
  ["[F-04] Stripe secret test-like", `STRIPE_SECRET=${mkStripeSecretLike("test")}`],
  ["[F-05] Stripe restricted test-like", `STRIPE_RESTRICTED=${mkStripeRestrictedLike("test")}`],
  ["[F-06] Stripe publishable live-like", `STRIPE_PUBLISHABLE=${mkStripePublishableLike("live")}`],
  ["[F-07] Stripe publishable test-like", `${mkStripePublishableLike("test")}`],
  ["[F-08] AWS Access Key ID (AKIA)", `AWS_ACCESS_KEY_ID=${mkAWSAccessKeyLike("AKIA")}`],
  ["[F-09] AWS Access Key ID (ASIA)", `temporary-ak=${mkAWSAccessKeyLike("ASIA")}`],
  ["[F-10] GitHub token gho_", `token: ${mkGitHubTokenLike("gho")}`],
  ["[F-11] GitHub token ghs_", `export GHS_TOKEN=${mkGitHubTokenLike("ghs")}`],
  ["[F-12] Slack bot token", `${mkSlackTokenLike("xoxb")}`],
  ["[F-13] Slack user token", `${mkSlackTokenLike("xoxp")}`],
  ["[F-14] JWT single line", `${mkJWTLike()}`],
  ["[F-15] Generic token-like string", `session_token=${mkTokenLike(44)}`],
  ["[F-16] GitHub token ghp_", `${mkGitHubTokenLike("ghp")}`],

  ["[P-01] Google API key (Pro)", `GOOGLE_API_KEY=${mkGoogleAPIKeyLike()}`],
  ["[P-02] Google API key in URL (Pro)", `https://example.com/maps?key=${mkGoogleAPIKeyLike()}`],
  ["[P-03] SendGrid API key (Pro)", `SENDGRID_API_KEY=${mkSendGridLike()}`],
  ["[P-04] SendGrid bearer header (Pro)", `Authorization: Bearer ${mkSendGridLike()}`],
  ["[P-05] Twilio Account SID (Pro)", `TWILIO_ACCOUNT_SID=${mkTwilioSidLike()}`],
  ["[P-06] Twilio API key (Pro)", `TWILIO_API_KEY=${mkTwilioKeyLike()}`],
  ["[P-07] PEM private key block (Pro)", mkPemBlockLike()],

  ["[E-01] UUID (should NOT match)", "550e8400-e29b-41d4-a716-446655440000"],
  ["[E-02] SHA256-like hex (should NOT match)", hex(64)],
  ["[E-03] Base64-ish (should NOT match)", "QW5vdGhlckxvbmdCYXNlNjRTdHlsZVN0cmluZw=="],
  ["[E-04] Hyphenated ID (should NOT match)", "abc123-def456-ghi789-jkl012-mno345-pqr678-stu901"],
  ["[E-05] Short sk prefix (should NOT match)", "sk-short"],
  ["[E-06] Incomplete Slack prefix (should NOT match)", "xox-justprefix-without-body"],
  ["[E-07] Short Twilio prefix (should NOT match)", "AC12345"],
  ["[E-08] JWT header only (should NOT match)", "eyJhbGciOiJIUzI1NiJ9"],
  ["[E-09] GitHub prefix only (should NOT match)", "gho_"],
  ["[E-10] Broken token across lines (should NOT match)", "messy sk_test_split\nover_two_lines_token"],
];

// ---- write ----
const lines = [];
lines.push("# Generated test data for API Key & Token Redactor");
lines.push("# DO NOT COMMIT THIS FILE.");
lines.push(`# SAFE=${SAFE ? "1" : "0"}`);
lines.push(`# Generated at: ${new Date().toISOString()}`);
lines.push("");

for (const [title, body] of cases) {
  lines.push(title);
  lines.push(body);
  lines.push("");
}

fs.writeFileSync(OUT, lines.join("\n"), "utf8");
console.log(`OK: wrote ${path.relative(process.cwd(), OUT)}`);
