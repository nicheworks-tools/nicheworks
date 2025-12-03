export default {
  async fetch(request) {
    const reqURL = new URL(request.url);
    const target = reqURL.searchParams.get("url");
    if (!target) {
      return new Response("Missing url", { status: 400 });
    }

    try {
      const response = await fetch(target, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36"
        }
      });
      const text = await response.text();

      return new Response(text, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "text/html; charset=utf-8"
        }
      });
    } catch (e) {
      return new Response("Proxy error: " + e.message, { status: 500 });
    }
  }
};
