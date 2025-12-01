export default async function handler(req, res) {
  const countryCode = (req.query.country_code || "NL").toLowerCase();
  const limitParam = parseInt(req.query.limit || "20", 10);
  const limit = Math.min(Math.max(limitParam, 1), 100);

  const url = `https://itunes.apple.com/${countryCode}/rss/topsongs/limit=${limit}/json`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "Apple RSS error",
        status: response.status,
        details: errorText,
      });
    }

    const rawData = await response.json();

    const entries = (rawData.feed && rawData.feed.entry) || [];

    const tracks = entries.map((item, index) => {
      const title = item["im:name"]?.label || "Unknown title";
      const artist = item["im:artist"]?.label || "Unknown artist";
      const images = item["im:image"] || [];
      const cover = images.length ? images[images.length - 1].label : null;
      const link = item.id?.label || null;

      return {
        rank: index + 1,
        title,
        artist,
        cover,
        link,
      };
    });

    return res.status(200).json({
      country: countryCode.toUpperCase(),
      date: new Date().toISOString().slice(0, 10),
      tracks,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Server error",
      details: String(err),
    });
  }
}
