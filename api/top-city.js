export default async function handler(req, res) {
  const cityId = req.query.city_id;
  const limit = req.query.limit || "20";

  if (!cityId) {
    return res.status(400).json({ error: "Missing city_id parameter" });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = "shazam8.p.rapidapi.com";

  if (!rapidApiKey) {
    return res.status(500).json({ error: "RAPIDAPI_KEY not set in Vercel" });
  }

  // Shazam8 Programming Hub – Top Track by City
  // Voorbeeld (jouw kant) was country:
  //   https://shazam8.p.rapidapi.com/track/top/country?country_code=RU&limit=2
  // City is analoog:
  const url = `https://${rapidApiHost}/track/top/city?city_id=${encodeURIComponent(
    cityId
  )}&limit=${encodeURIComponent(limit)}`;

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
        error: "Shazam city API error",
        status: response.status,
        details: errorText,
      });
    }

    const rawData = await response.json();

    // Zelfde structuur als het JSON voorbeeld dat je stuurde:
    // { next: "...", properties: {}, tracks: [ { title, subtitle, ... }, ... ] }
    const tracks = (rawData.tracks || []).map((item, index) => ({
      rank: index + 1,
      title: item.title ?? "Unknown title",
      artist: item.subtitle ?? "Unknown artist",
    }));

    return res.status(200).json({
      city_id: cityId,
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
