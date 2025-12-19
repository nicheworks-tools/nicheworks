// src/core.js
// Core logic for API Key & Token Redactor
// Shared between browser UI and Node-based tests

export const DEFAULT_PRO_RULES = {
  mode: "keep_last", // keep_last | replace_all
  keepLastN: 4,
  replaceText: "[REDACTED]",
};

export const FREE_PATTERNS = [
  { key: "openai", label: "OpenAI key", regex: /\bsk-[A-Za-z0-9]{20,}\b/g },
  { key: "stripe_secret", label: "Stripe secret", regex: /\b(sk|rk)_(live|test)_[A-Za-z0-9]{10,}\b/g },
  { key: "stripe_pub", label: "Stripe publishable", regex: /\bpk_(live|test)_[A-Za-z0-9]{10,}\b/g },
  { key: "aws_access_key_id", label: "AWS Access Key ID", regex: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { key: "github_token", label: "GitHub token", regex: /\bgh[pous]_[A-Za-z0-9]{20,}\b/g },
  { key: "slack_token", label: "Slack token", regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g },
  { key: "jwt", label: "JWT", regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },

  // Broad fallback: handled LAST with heuristics to reduce false positives.
  { key: "token_like", label: "Token-like", regex: /\b[A-Za-z0-9_\-]{32,}\b/g },
];

export const PRO_EXTRA_PATTERNS = [
  { key: "google_api", label: "Google API key", regex: /\bAIza[0-9A-Za-z\-_]{30,}\b/g },
  { key: "sendgrid", label: "SendGrid key", regex: /\bSG\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  { key: "twilio_sid", label: "Twilio SID", regex: /\bAC[0-9a-fA-F]{32}\b/g },
  { key: "twilio_key", label: "Twilio key", regex: /\bSK[0-9a-fA-F]{32}\b/g },
  { key: "pem_private_key", label: "Private key (PEM)", regex: /-----BEGIN(?: RSA)? PRIVATE KEY-----[\s\S]*?-----END(?: RSA)? PRIVATE KEY-----/g },
];

// ---------------------------
// Masking helpers
// ---------------------------
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

// ---------------------------
// Heuristics to reduce false positives for token_like
// ---------------------------
function buildPemRanges(text) {
  const ranges = [];
  const begin = /-----BEGIN(?: RSA)? PRIVATE KEY-----/g;
  const end = /-----END(?: RSA)? PRIVATE KEY-----/g;

  let m;
  while ((m = begin.exec(text)) !== null) {
    const start = m.index;
    end.lastIndex = m.index;
    const e = end.exec(text);
    if (e) {
      const stop = e.index + e[0].length;
      ranges.push([start, stop]);
      begin.lastIndex = stop;
    } else {
      break;
    }
  }
  return ranges;
}

function inRanges(pos, ranges) {
  for (const [a, b] of ranges) {
    if (pos >= a && pos < b) return true;
  }
  return false;
}

function looksLikeHyphenatedId(s) {
  const segs = s.split("-");
  if (segs.length >= 4 && segs.every((x) => x.length >= 3 && /^[A-Za-z0-9]+$/.test(x))) return true;
  return false;
}

function isAllHex(s) {
  return /^[0-9a-fA-F]{32,}$/.test(s);
}

function isProbablyTokenLikeCandidate(match, wholeText, offset, pemRanges) {
  // 1) If inside PEM block, ignore (PEM is handled by pem_private_key in Pro)
  if (inRanges(offset, pemRanges)) return false;

  // 2) If followed by '=' (base64 padding), ignore partial base64-ish tokens
  const nextChar = wholeText[offset + match.length] || "";
  if (nextChar === "=") return false;

  // 3) Ignore common "structured ids" (many hyphen segments)
  if (match.includes("-") && looksLikeHyphenatedId(match)) return false;

  // 4) Ignore long pure-hex strings (hash-like)
  if (isAllHex(match)) return false;

  // 5) Avoid counting Pro-only patterns as token_like in Free mode
  //    (These should be detected by dedicated Pro patterns, not the broad fallback)
  if (match.startsWith("AIza")) return false; // Google API key prefix
  if (/^AC[0-9a-fA-F]{32}$/.test(match)) return false; // Twilio SID
  if (/^SK[0-9a-fA-F]{32}$/.test(match)) return false; // Twilio key

  return true;
}

// ---------------------------
// Main scan
// ---------------------------
export function scanAndRedact(inputText, pro, rules = DEFAULT_PRO_RULES) {
  const pemRanges = buildPemRanges(inputText);

  // IMPORTANT:
  // Run specific patterns first, and ALWAYS run token_like LAST.
  const tokenLike = FREE_PATTERNS.find((p) => p.key === "token_like");
  const freeWithoutTokenLike = FREE_PATTERNS.filter((p) => p.key !== "token_like");

  const patterns = pro
    ? [...freeWithoutTokenLike, ...PRO_EXTRA_PATTERNS, tokenLike]
    : [...freeWithoutTokenLike, tokenLike];

  const hits = {};
  let output = inputText;

  for (const p of patterns) {
    let c = 0;

    if (p.key === "token_like") {
      output = output.replace(p.regex, (m, offset, whole) => {
        if (!isProbablyTokenLikeCandidate(m, whole, offset, pemRanges)) return m;
        c++;
        return maskMatch(m, p.key, rules, pro);
      });
    } else {
      output = output.replace(p.regex, (m) => {
        c++;
        return maskMatch(m, p.key, rules, pro);
      });
    }

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
