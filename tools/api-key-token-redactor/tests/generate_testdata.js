/**
 * API Key & Token Redactor - local test data generator
 * - Generates secret-looking dummy strings locally.
 * - Output file is gitignored to avoid GitHub Secret Scanning issues.
 *
 * Usage:
 *   node ./generate_testdata.js
 */

const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "testdata.generated.txt");

// ---- helpers ----
function repeat(str, n) {
  return Array.from({ length: n }).map(() => str).join("");
}

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

// Break common secret prefixes so scanners are less likely to match.
// Example: "sk-" -> "s" + "k-"
function splitPrefix(prefix) {
  if (prefix.length <= 1) return prefix;
  return prefix.slice(0, 1) + "\u200b" + prefix.slice(1); // insert zero-width space
}

// Build token-like strings while avoiding "exact" known patterns when possible.
function mkOpenAIKeyLike() {
  // original pattern: sk-[A-Za-z0-9]{20,}
  // we avoid exact "sk-" by inserting ZWSP: s​k-
  return `${splitPrefix("sk-")}${alphaNum(32)}`;
}

function mkStripeSecretLike(liveOrTest = "test") {
  // original pattern: (sk|rk)_(live|test)_[A-Za-z0-9]{10,}
  // avoid exact "sk_" / "rk_" by splitting: s​k_
  const p = liveOrTest === "live" ? "live" : "test";
  return `${splitPrefix("sk_")}${p}_${alphaNum(24)}`;
}

function mkStripeRestrictedLike(liveOrTest = "test") {
  const p = liveOrTest === "live" ? "live" : "test";
  return `${splitPrefix("rk_")}${p}_${alphaNum(24)}`;
}

function mkStripePublishableLike(liveOrTest = "test") {
  // pk_(live|test)_
  const p = liveOrTest === "live" ? "live" : "test";
  return `${splitPrefix("pk_")}${p}_${alphaNum(24)}`;
}

function mkAWSAccessKeyLike(prefix = "AKIA") {
  // (AKIA|ASIA)[0-9A-Z]{16}
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let rest = "";
  for (let i = 0; i < 16; i++) rest += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}${rest}`;
}

function mkGitHubTokenLike(kind = "ghp") {
  // gh[pous]_[A-Za-z0-9]{20,}
  // avoid exact "ghp_" by splitting: g​hp_
  const prefix = `${kind}_`;
  return `${splitPrefix(prefix)}${alphaNum(36)}`;
}

function mkSlackTokenLike(kind = "xoxb") {
  // xox[baprs]-... pattern (tool: xox[baprs]-[A-Za-z0-9-]{10,})
  // avoid exact "xoxb-" by splitting: x​oxb-
  const prefix = `${kind}-`;
  return `${splitPrefix(prefix)}${alphaNum(12)}-${alphaNum(12)}-${alphaNum(24)}`.replaceAll("_", "-");
}

function mkJWTLike() {
  // JWT: eyJ....<10>.<10>.<10>
  // We keep "eyJ" but slightly reduce likelihood by inserting ZWSP after 'ey'
  const header = "e" + "\u200b" + "yJ" + alphaNum(18).replace(/[+/=]/g, "A");
  const payload = alphaNum(20).replace(/[+/=]/g, "B");
  const sig = alphaNum(40).replace(/[+/=]/g, "C");
  return `${header}.${payload}.${sig}`;
}

function mkGoogleAPIKeyLike() {
  // tool Pro regex: AIza[0-9A-Za-z\-_]{30,}
  // avoid exact "AIza" by splitting: A​Iza
  return `${splitPrefix("AIza")}Sy${alphaNum(34)}`;
}

function mkSendGridLike() {
  // SG.<...>.<...>
  // avoid exact "SG." by splitting: S​G.
  return `${splitPrefix("SG.")}${alphaNum(18)}.${alphaNum(22)}`;
}

function mkTwilioSidLike() {
  // AC[0-9a-fA-F]{32}
  // avoid exact "AC" by splitting A​C
  return `${splitPrefix("AC")}${hex(32)}`;
}

function mkTwilioKeyLike() {
  // SK[0-9a-fA-F]{32}
  return `${splitPrefix("SK")}${hex(32)}`;
}

function mkPemBlockLike() {
  return [
    "-----BEGIN PRIVATE KEY-----",
    "MIIE" + alphaNum(60),
    alphaNum(60),
    "-----END PRIVATE KEY-----",
  ].join("\n");
}

function mkTokenLike(len = 40) {
  // generic token_like: [A-Za-z0-9_-]{32,}
  return alphaNum(len).replace(/[+/=]/g, "Z");
}

// ---- cases ----
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
  ["[F-10] GitHub token gho_-like", `token: ${mkGitHubTokenLike("gho")}`],
  ["[F-11] GitHub token ghs_-like", `export GHS_TOKEN=${mkGitHubTokenLike("ghs")}`],
  ["[F-12] Slack bot token-like", `${mkSlackTokenLike("xoxb")}`],
  ["[F-13] Slack user token-like", `${mkSlackTokenLike("xoxp")}`],
  ["[F-14] JWT-like", `${mkJWTLike()}`],
  ["[F-15] Generic token-like", `session_token=${mkTokenLike(44)}`],
  ["[F-16] GitHub token ghp_-like", `${mkGitHubTokenLike("ghp")}`],

  ["[P-01] Google API key-like (Pro)", `GOOGLE_API_KEY=${mkGoogleAPIKeyLike()}`],
  ["[P-02] Google API key-like in URL (Pro)", `https://example.com/maps?key=${mkGoogleAPIKeyLike()}`],
  ["[P-03] SendGrid key-like (Pro)", `SENDGRID_API_KEY=${mkSendGridLike()}`],
  ["[P-04] SendGrid bearer key-like (Pro)", `Authorization: Bearer ${mkSendGridLike()}`],
  ["[P-05] Twilio SID-like (Pro)", `TWILIO_ACCOUNT_SID=${mkTwilioSidLike()}`],
  ["[P-06] Twilio key-like (Pro)", `TWILIO_API_KEY=${mkTwilioKeyLike()}`],
  ["[P-07] PEM private key block-like (Pro)", mkPemBlockLike()],

  ["[E-01] UUID (should NOT match)", "550e8400-e29b-41d4-a716-446655440000"],
  ["[E-02] SHA256-like hex (should NOT match)", hex(64)],
  ["[E-03] Base64-ish (should NOT match)", "QW5vdGhlckxvbmdCYXNlNjRTdHlsZVN0cmluZw=="],
  ["[E-04] Hyphenated ID (should NOT match)", "abc123-def456-ghi789-jkl012-mno345-pqr678-stu901"],
  ["[E-05] Short prefix (should NOT match)", "sk-short"],
  ["[E-06] Incomplete Slack prefix (should NOT match)", "xox-justprefix-without-body"],
  ["[E-07] Short Twilio prefix (should NOT match)", "AC12345"],
  ["[E-08] JWT header only (should NOT match)", "eyJhbGciOiJIUzI1NiJ9"],
  ["[E-09] GitHub prefix only (should NOT match)", "gho_"],
  ["[E-10] Broken token across lines (should NOT match)", "messy sk_test_split\nover_two_lines_token"],
];

// ---- write file ----
const lines = [];
lines.push("# Generated test data for API Key & Token Redactor");
lines.push("# DO NOT COMMIT THIS FILE. It may contain secret-looking strings.");
lines.push(`# Generated at: ${new Date().toISOString()}`);
lines.push("");

for (const [title, body] of cases) {
  lines.push(title);
  lines.push(body);
  lines.push("");
}

fs.writeFileSync(OUT, lines.join("\n"), "utf8");
console.log(`OK: wrote ${path.relative(process.cwd(), OUT)} (${lines.length} lines)`);
