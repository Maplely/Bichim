export default class PreviewController {
  async preview(req, res) {
    try {
      const { url } = req.query;
      if (!url || !url.startsWith('http')) {
        return res.status(400).json({ erro: 'URL inválida' });
      }
      const blockedPatterns = [/^https?:\/\/(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|0\.0\.0\.0)([:\/]|$)/i];
      const isBlocked = blockedPatterns.some(p => p.test(url));
      if (isBlocked) {
        return res.status(400).json({ erro: 'URL não permitida' });
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ChatLocal/1.0)' },
        });
        const html = await response.text();
        const getMeta = (prop) => {
          const regex = new RegExp(`<meta[^>]+?(?:property|name)="(?:og:)?${prop}"[^>]+?content="([^"]*)"`, 'i');
          const match = regex.exec(html);
          return match ? match[1] : null;
        };
        const title = getMeta('title') || html.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
        const description = getMeta('description') || '';
        const image = getMeta('image') || '';
        const abs = (src) => {
          if (!src) return null;
          if (src.startsWith('http')) return src;
          try { return new URL(src, url).href; } catch { return null; }
        };
        res.json({ url, title: title.slice(0, 200), description: description.slice(0, 300), image: abs(image) });
      } finally {
        clearTimeout(timeout);
      }
    } catch {
      res.json({ url: req.query.url, title: null, description: null, image: null });
    }
  }
}
