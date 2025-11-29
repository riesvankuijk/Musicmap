export default async function handler(req, res) {
  // We schakelen nu naar country charts ipv city charts
  const countryCode = req.query.country_code || "NL"; // fallback NL

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = "shazam-core.p.rapidapi.com";

  if (!rapidApiKey) {
    return res.status(500).json({ error: "RAPIDAPI_KEY not set in Vercel" });
  }

  const url = `https://${rapidApiHost}/v1/charts/country?country_code=${countryCode}&limit=10`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": rapidApiHost,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "Shazam API error",
        status: response.status,
        details: errorText,
      });
    }

    const rawData = await response.json();

    const tracks = (Array.isArray(rawData) ? rawData : []).map((item, index) => ({
      rank: index + 1,
      title: item.title ?? "Unknown title",
      artist: item.subtitle ?? "Unknown artist",
    }));

    res.status(200).json({
      country: countryCode,
      date: new Date().toISOString().slice(0, 10),
      tracks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error",
      details: String(err),
    });
  }
}
