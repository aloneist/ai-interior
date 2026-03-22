import * as cheerio from "cheerio";

export function decodeHtml(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");
}

export function normalizeText(input: string): string {
  return decodeHtml(input)
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function htmlToVisibleText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();

  const blockTags = new Set([
    "div",
    "section",
    "article",
    "main",
    "aside",
    "nav",
    "header",
    "footer",
    "p",
    "ul",
    "ol",
    "li",
    "dl",
    "dt",
    "dd",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "br",
    "button",
    "summary",
    "details",
  ]);

  const chunks: string[] = [];

  function walk(node: any) {
    if (!node) return;

    if (node.type === "text") {
      const text = node.data?.trim();
      if (text) chunks.push(text);
      return;
    }

    if (node.type === "tag") {
      const tag = node.name?.toLowerCase();
      if (blockTags.has(tag)) chunks.push("\n");
      if (node.children?.length) {
        for (const child of node.children) walk(child);
      }
      if (blockTags.has(tag)) chunks.push("\n");
    }
  }

  const rootChildren = $.root().children().toArray();
  for (const child of rootChildren) walk(child);

  return normalizeText(chunks.join(" "));
}

export function splitLines(text: string): string[] {
  return normalizeText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}