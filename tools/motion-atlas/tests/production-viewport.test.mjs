import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const ORIGIN = (process.env.MOTION_ATLAS_ORIGIN || "https://nicheworks.app").replace(/\/+$/, "");
const chrome = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"].find(name =>
  (process.env.PATH || "").split(path.delimiter).some(dir => fs.existsSync(path.join(dir, name)))
);
if (!chrome) throw Error("Chrome/Chromium must be installed");
if (typeof WebSocket !== "function") throw Error("Node 22+ WebSocket required");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "motion-atlas-cdp-"));
const child = spawn(chrome, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--no-first-run", "--disable-extensions", "--disable-background-networking",
  "--remote-allow-origins=*", "--remote-debugging-port=0", "--user-data-dir=" + dir,
  "about:blank"
], { stdio: ["ignore", "ignore", "pipe"] });

let stderr = "";
const port = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(Error("Chrome DevTools did not start: " + stderr.slice(-1000))), 15000);
  child.stderr.on("data", bytes => {
    stderr += String(bytes);
    const m = stderr.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
    if (m) { clearTimeout(timer); resolve(Number(m[1])); }
  });
  child.once("error", err => { clearTimeout(timer); reject(err); });
  child.once("exit", code => { clearTimeout(timer); reject(Error("Chrome exited before DevTools: " + code)); });
});

let websocket;
const until = async (predicate, retries = 80) => {
  for (let i = 0; i < retries; i++) {
    const value = await predicate().catch(() => null);
    if (value) return value;
    await sleep(150);
  }
  throw Error("Timed out waiting for browser condition");
};

async function smoke() {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const all = selector => Array.from(document.querySelectorAll(selector));
  const check = (condition, message) => { if (!condition) throw Error(message); };
  try {
    for (let i = 0; i < 150 && all(".motion-card").length !== 42; i++) await sleep(100);
    check(all(".motion-card").length === 42, "Expected 42 loaded motion cards; got " + all(".motion-card").length);
    check(document.querySelector("#result-count")?.textContent === "42", "Visible catalog count is not 42");
    check(all("[data-pro-buy]").length === 0, "Retired Stripe purchase action is present");
    check(all("[data-pro-action]").every(element => !element.disabled), "Free output disabled");
    const initialReduced = document.querySelector("#reduced-toggle");
    if (initialReduced?.checked) {
      initialReduced.checked = false;
      initialReduced.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const input = document.querySelector("#motion-search");
    input.value = "overshoot";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    check(all(".motion-card").length >= 1 && all(".motion-card").length < 42, "Search is not filtering");
    document.querySelector("[data-reset]").click();
    check(all(".motion-card").length === 42, "Reset did not restore catalog");
    document.querySelector("[data-clear-compare]")?.click();
    for (let i = 0; i < 4; i++) {
      const button = all(".motion-card")[i]?.querySelector(".card-actions button:nth-child(2)");
      check(button, "Missing compare action " + i);
      button.click();
    }
    check(all("#compare-tray button").length === 4, "Four-way comparison failed");
    all(".motion-card")[4]?.querySelector(".card-actions button:nth-child(2)")?.click();
    check(all("#compare-tray button").length === 4, "Compare cap exceeded");
    const counter = all(".motion-card").find(el => el.querySelector("h3")?.textContent.includes("Count up"));
    check(counter, "Count-up card missing");
    counter.querySelector(".card-actions button:first-child").click();
    await sleep(1250);
    check(document.querySelector("#motion-detail .demo-shape")?.textContent === "259", "Count-up did not reach target");
    const mask = all(".motion-card").find(el => el.querySelector("h3")?.textContent.includes("Mask reveal"));
    check(mask, "Mask reveal card missing");
    mask.querySelector(".card-actions button:first-child").click();
    await sleep(120);
    check(getComputedStyle(document.querySelector("#motion-detail .demo-shape")).animationName.includes("atlasMaskReveal"), "Mask animation not running");
    const reduced = document.querySelector("#reduced-toggle");
    check(reduced, "Missing reduced-motion control");
    reduced.checked = true;
    reduced.dispatchEvent(new Event("change", { bubbles: true }));
    check(document.documentElement.classList.contains("is-reduced"), "Reduced-motion toggle failed");
    check(getComputedStyle(document.querySelector("#motion-detail .demo-shape")).animationName === "none", "Reduced-motion animation still playing");
    const width = window.innerWidth;
    const clientWidth = document.documentElement.clientWidth;
    const overflow = document.documentElement.scrollWidth - clientWidth;
    check(overflow <= 8, "Horizontal overflow " + overflow + "px");
    return { ok: true, width, clientWidth, overflow, count: all(".motion-card").length };
  } catch (error) {
    return { ok: false, error: error.message, width: window.innerWidth, clientWidth: document.documentElement.clientWidth };
  }
}

try {
  const page = await until(async () => {
    const response = await fetch("http://127.0.0.1:" + port + "/json/list");
    if (!response.ok) return null;
    const list = await response.json();
    return list.find(entry => entry.type === "page" && entry.webSocketDebuggerUrl);
  });
  websocket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    websocket.addEventListener("open", resolve, { once: true });
    websocket.addEventListener("error", reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  websocket.addEventListener("message", event => {
    const value = JSON.parse(String(event.data));
    const resolver = pending.get(value.id);
    if (!resolver) return;
    pending.delete(value.id);
    clearTimeout(resolver.timer);
    if (value.error) resolver.reject(Error(JSON.stringify(value.error)));
    else resolver.resolve(value.result);
  });
  function call(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(Error(method + " timeout")); }, 45000);
      pending.set(id, { resolve, reject, timer });
      websocket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const out = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (out.exceptionDetails) throw Error(JSON.stringify(out.exceptionDetails).slice(0,1000));
    return out.result?.value;
  }
  await call("Page.enable");
  await call("Runtime.enable");
  const tests = [
    ["en", "/tools/motion-atlas/", 390, 844, true],
    ["ja", "/tools/motion-atlas/ja/", 390, 844, true],
    ["en", "/tools/motion-atlas/", 1280, 900, false],
    ["ja", "/tools/motion-atlas/ja/", 1280, 900, false]
  ];
  for (const [lang, route, width, height, mobile] of tests) {
    await call("Emulation.setDeviceMetricsOverride", {
      width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height
    });
    await call("Emulation.setTouchEmulationEnabled", { enabled: mobile });
    await call("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "no-preference" }]
    });
    const url = ORIGIN + route;
    await call("Page.navigate", { url });
    await until(async () => (await evaluate("location.href")).startsWith(url));
    const result = await evaluate("(" + smoke.toString() + ")()");
    assert.ok(result.ok, lang + " " + width + ": " + JSON.stringify(result));
    assert.equal(result.width, width, "Incorrect CSS viewport width");
    assert.equal(result.clientWidth, width, "Incorrect layout viewport width");
    console.log("PASS", lang, width + "px", JSON.stringify(result));
  }
  console.log("Motion Atlas production viewport smoke PASS: real 390px mobile + 1280px desktop.");
} finally {
  if (websocket?.readyState === WebSocket.OPEN) websocket.close();
  child.kill("SIGTERM");
  await new Promise(resolve => {
    if (child.exitCode !== null || child.signalCode !== null) resolve();
    else child.once("close", resolve);
  });
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 8, retryDelay: 200 });
}
