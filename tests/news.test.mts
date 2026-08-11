import assert from "node:assert/strict";
import test from "node:test";
import { parseCnbcRss } from "../src/lib/news.ts";

test("parseCnbcRss returns safe article summaries", () => {
  const xml = `
    <rss><channel><item>
      <title><![CDATA[IHSG Menguat &amp; Rupiah Stabil]]></title>
      <link><![CDATA[https://www.cnbcindonesia.com/market/20260811100000-17-123456/ihsg-menguat]]></link>
      <content:encoded><![CDATA[<p>Pasar bergerak <strong>positif</strong> pada sesi pertama.</p>]]></content:encoded>
      <pubDate>Tue, 11 Aug 2026 10:00:00 +0700</pubDate>
    </item></channel></rss>`;

  assert.deepEqual(parseCnbcRss(xml), [{
    id: "https://www.cnbcindonesia.com/market/20260811100000-17-123456/ihsg-menguat",
    title: "IHSG Menguat & Rupiah Stabil",
    excerpt: "Pasar bergerak positif pada sesi pertama.",
    url: "https://www.cnbcindonesia.com/market/20260811100000-17-123456/ihsg-menguat",
    publishedAt: "2026-08-11T03:00:00.000Z",
    source: "CNBC Indonesia",
  }]);
});

test("parseCnbcRss rejects links outside the configured publisher", () => {
  const xml = `<rss><channel><item><title>Judul palsu</title><link>https://example.com/article</link><description>Cuplikan palsu.</description></item></channel></rss>`;
  assert.deepEqual(parseCnbcRss(xml), []);
});
