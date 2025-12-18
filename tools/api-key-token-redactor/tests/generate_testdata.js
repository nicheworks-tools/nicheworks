/**
 * API Key & Token Redactor - local test data generator (ESM)
 * Output is gitignored.
 *
 * Usage:
 *   node ./generate_testdata.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "testdata.generated.txt");

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

// NOTE: secret scanning回避のため、"DUMMY" を必ず混ぜる（形式だけ一致させる）
function mkOpenAIKeyLike() {
  return `sk-${alphaNum(6)}DUMMY${alphaNum(26)}`; // total 20+ after sk-
}
function mkStripeSecretLike(liveOrTest = "test") {
  const p = liveOrTest === "live" ? "live" : "test";
  return `sk_${p}_DUMMY${alphaNum(24)}`;
}
function mkStripeRestrictedLike(liveOrTest = "test") {
  const p = liveOrTest === "live" ? "live" : "test";
  return `rk_${p}_DUMMY${alphaNum(24)}`;
}
function mkStripePublishableLike(liveOrTest = "test") {
  const p = liveOrTest === "live" ? "live" : "test";
  return `pk_${p}_DUMMY${alphaNum(24)}`;
}
function mkAWSAccessKeyLike(prefix = "AKIA") {
  // (AKIA|ASIA)[0-9A-Z]{16} に合わせる（DUMMYは入れられないので、入力側で “これはダミー” とコメントする方針）
  return `${prefix}${upperNum(16)}`;
}
function mkGitHubTokenLike(kind = "ghp") {
  return `${kind}_DUMMY${alphaNum(32)}`;
}
function mkSlackTokenLike(kind = "xoxb") {
  return `${kind}-${alphaNum(12)}-${alphaNum(12)}-DUMMY${alphaNum(16)}`;
}
function mkJWTLike() {
  // jwt regexに合わせつつ “DUMMY” を含める（base64urlっぽい文字だけ）
  const part = (n) => alphaNum(n).replaceAll("+", "A").replaceAll("/", "B").replaceAll("=", "C");
  const header = `eyJ${part(24)}`;
  const payload = part(28);
  const sig = `DUMMY${part(34)}`; // 10+ を満たす
  return `${header}.${payload}.${sig}`;
}
function mkGoogleAPIKeyLike() {
  // AIza + 30+
  return `AIzaDUMMY${alphaNum(34)}`.replaceAll("+", "A").replaceAll("/", "B");
}
function mkSendGridLike() {
  return `SG.DUMMY${alphaNum(14)}.DUMMY${alphaNum(16)}`;
}
function mkTwilioSidLike() {
  // AC + 32 hex (DUMMYは入れられない) -> 代わりに周辺に "DUMMY" を付ける
  return `AC${hex(32)}`;
}
function mkTwilioKeyLike() {
  return `SK${hex(32)}`;
}
function mkPemBlockLike() {
  return [
    "-----BEGIN PRIVATE KEY-----",
    `MIIE${alphaNum(40)}DUMMY${alphaNum(20)}`,
    `${alphaNum(30)}DUMMY${alphaNum(30)}`,
    "-----END PRIVATE KEY-----",
  ].join("\n");
}

const cases = [
  ["[F-01] .env OpenAI key-like", `OPENAI_API_KEY=${mkOpenAIKeyLike()}`],
  ["[F-02] Bearer OpenAI key-like", `Authorization: Bearer ${mkOpenAIKeyLike()}`],
  ["[F-03] Stripe secret live-like", `STRIPE_SECRET=${mkStripeSecretLike("live")}`],
  ["[F-04] Stripe secret test-like", `STRIPE_SECRET=${mkStripeSecretLike("test")}`],
  ["[F-05] Stripe restricted test-like", `STRIPE_RESTRICTED=${mkStripeRestrictedLike("test")}`],
  ["[F-06] Stripe publishable live-like", `STRIPE_PUBLISHABLE=${mkStripePublishableLike("live")}`],
  ["[F-07] Stripe publishable test-like", `${mkStripePublishableLike("test")}`],
  ["[F-08] AWS Access Key (AKIA) dummy-format", `AWS_ACCESS_KEY_ID=${mkAWSAccessKeyLike("AKIA")} # DUMMY`],
  ["[F-09] AWS Access Key (ASIA) dummy-format", `temporary-ak=${mkAWSAccessKeyLike("ASIA")} # DUMMY`],
  ["[F-10] GitHub token gho_", `token: ${mkGitHubTokenLike("gho")}`],
  ["[F-11] GitHub token ghs_", `export GHS_TOKEN=${mkGitHubTokenLike("ghs")}`],
  ["[F-12] Slack bot token", `${mkSlackTokenLike("xoxb")}`],
  ["[F-13] Slack user token", `${mkSlackTokenLike("xoxp")}`],
  ["[F-14] JWT single line", `${mkJWTLike()}`],
  ["[F-15] Generic token-like mixed", `session_token=${alphaNum(10)}DUMMY${alphaNum(30)}_-A`],
  ["[F-16] GitHub token ghp_", `${mkGitHubTokenLike("ghp")}`],

  ["[P-01] Google API key env", `GOOGLE_API_KEY=${mkGoogleAPIKeyLike()}`],
  ["[P-02] Google API key in URL", `https://example.com/maps?key=${mkGoogleAPIKeyLike()}`],
  ["[P-03] SendGrid API key env", `SENDGRID_API_KEY=${mkSendGridLike()}`],
  ["[P-04] SendGrid bearer header", `Authorization: Bearer ${mkSendGridLike()}`],
  ["[P-05] Twilio Account SID", `TWILIO_ACCOUNT_SID=${mkTwilioSidLike()} # DUMMY`],
  ["[P-06] Twilio API key", `TWILIO_API_KEY=${mkTwilioKeyLike()} # DUMMY`],
  ["[P-07] Twilio SID alt", `note: ${mkTwilioSidLike()} # DUMMY`],
  ["[P-08] PEM private key block", `${mkPemBlockLike()}`],

  ["[E-01] UUID", `550e8400-e29b-41d4-a716-446655440000`],
  ["[E-02] SHA256-like hex", `${hex(64)}`],
  ["[E-03] Base64-ish string", `QW5vdGhlckxvbmdCYXNlNjRTdHlsZVN0cmluZw==`],
  ["[E-04] Hyphenated ID", `abc123-def456-ghi789-jkl012-mno345-pqr678-stu901`],
  ["[E-05] Short sk prefix", `sk-short`],
  ["[E-06] Incomplete Slack prefix", `xox-justprefix-without-body`],
  ["[E-07] Short Twilio prefix", `AC12345`],
  ["[E-08] JWT header only", `eyJhbGciOiJIUzI1NiJ9`],
  ["[E-09] GitHub prefix only", `gho_`],
  ["[E-10] Broken stripe token", `messy sk_test_split\nover_two_lines_token`],
];

const out = [];
out.push("# Generated local testdata for API Key & Token Redactor");
out.push("# This file is gitignored.");
out.push("");

for (const [title, body] of cases) {
  out.push(title);
  out.push(body);
  out.push("");
}

fs.writeFileSync(OUT, out.join("\n"), "utf8");
console.log(`Wrote ${OUT}`);
