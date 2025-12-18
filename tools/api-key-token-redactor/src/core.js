// Core logic for API Key & Token Redactor
// Shared between browser UI and Node-based tests

export const DEFAULT_PRO_RULES = {
  mode: "keep_last", // keep_last | replace_all
  keepLastN: 4,
  replaceText: "[REDACTED]",
};

const TOKEN_LIKE = {
  key: "token_like",
  label: "Token-like",
  // exclude pure hex (32+): avoids SHA256/MD5-ish false positives
  // still matches typical random tokens that include mixed chars
  regex: /\b(?![0-9a-fA-F]{32,}\b)[A-Za-z0-9_\-]{32,}\b/g,
};

export const FREE_PATTERNS = [
  { key: "openai", label: "OpenAI key", regex: /\bsk-[A-Za-z0-9]{20,}\b/g },
  { key: "stripe_secret", label: "Stripe secret", regex: /\b(sk|rk)_(live|test)_[A-Za-z0-9]{10,}\b/g },
  { key: "stripe_pub", label: "Stripe publishable", regex: /\bpk_(live|test)_[A-Za-z0-9]{10,}\b/g },
  { key: "aws_access_key_id", label: "AWS Access Key ID", regex: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { key: "github_token", label: "GitHub token", regex: /\bgh[pous]_[A-Za-z0-9]{20,}\b/g },
  { key: "slack_token", label: "Slack token", regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g },
  { key: "jwt", label: "JWT", regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  // token_like is appended later (important for Pro ordering)
];

export const PRO_EXTRA_PATTERNS = [
  { key: "google_api", label: "Google API key", regex: /\bAIza[0-9A-Za-z\-_]{30,}\b/g },
  { key: "sendgrid", label: "SendGrid key", regex: /\bSG\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  { key: "twilio_sid", label: "Twilio SID", regex: /\bAC[0-9a-fA-F]{32}\b/g },
  { key: "twilio_key", label: "Twilio key", regex: /\bSK[0-9a-fA-F]{32}\b/g },
  { key: "pem_private_key", label: "Private key (PEM)", regex: /-----BEGIN(?: RSA)? PRIVATE KEY-----[\s\S]*?-----END(?: RSA)? PRIVATE KEY-----/g },
];

export function maskKeepEnds(str, keepStart, keepEnd) {
  if (str.length <= keepStart + keepEnd + 6) return "[REDACTED]";
  return `${str.slice(0, keepStart)}…${str.slice(-keepEnd)}`;
}

export function maskJWT(jwt, rules, pro) {
  const parts = jwt.split(".");
  if (parts.length !== 3) return pro ? (rules.replaceText || "[REDACTED]") : "[REDACTED]";
  if (pro && rules.mode === "replace_all") return rules.replaceText || "[REDACTED]";
  const keepN = pro ? Math.max(0, Number(rules.keepLastN || 0)) : 4;
  const sig = keepN > 0 ? `…${parts[2].slice(-keepN)}` : (rules.replaceText || "[REDACTED]");
  return `${maskKeepEnds(parts[0], 3, 3)}.${(rules.replaceText || "[REDACTED]")}.${sig}`;
}

export function applyProRule(original, rules) {
  if (rules.mode === "replace_all") return rules.replaceText || "[REDACTED]";
  const n = Math.max(0, Number(rules.keepLastN || 0));
  if (n <= 0) return rules.replaceText || "[REDACTED]";
  if (original.length <= n + 3) return rules.replaceText || "[REDACTED]";
  return `…${original.slice(-n)}`;
}

export function maskMatch(m, key, rules, pro) {
  if (!pro) {
    if (key === "jwt") return maskJWT(m, { ...DEFAULT_PRO_RULES }, false);
    if (key === "pem_private_key") return "[REDACTED_PRIVATE_KEY]";
    return maskKeepEnds(m, 4, 4);
  }
  if (key === "jwt") return maskJWT(m, rules, true);
  if (key === "pem_private_key") return rules.replaceText || "[REDACTED_PRIVATE_KEY]";
  return applyProRule(m, rules);
}

export function scanAndRedact(inputText, pro, rules = DEFAULT_PRO_RULES) {
  // Order matters:
  // - In Pro, run specific patterns BEFORE the generic token_like to avoid losing specificity.
  const base = [...FREE_PATTERNS];
  const patterns = pro
    ? [...base, ...PRO_EXTRA_PATTERNS, TOKEN_LIKE]
    : [...base, TOKEN_LIKE];

  const hits = {};
  let output = inputText;

  for (const p of patterns) {
    let c = 0;
    output = output.replace(p.regex, (m) => {
      c++;
      return maskMatch(m, p.key, rules, pro);
    });
    if (c > 0) hits[p.key] = { label: p.label, count: c };
  }

  const total = Object.values(hits).reduce((a, v) => a + v.count, 0);
  const types = Object.keys(hits).length;

  return { output, hits, total, types };
}

const exported = {
  DEFAULT_PRO_RULES,
  FREE_PATTERNS,
  PRO_EXTRA_PATTERNS,
  maskKeepEnds,
  maskJWT,
  applyProRule,
  maskMatch,
  scanAndRedact,
};

if (typeof window !== "undefined") {
  window.NW_REDACTOR = exported;
}

export default exported;
