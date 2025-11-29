export default async function handler(req, res) {
  const cityId = req.query.city_id;
  const limitParam = parseInt(req.query.limit || "20", 10);

  if (!cityId) {
    return res.status(400).json({ error: "Missing city_id parameter" });
  }

  const pageSize = Math.min(Math.max(limitParam, 1), 50);

  // Voorbeeld dat jij al had:
  // https://cdn.shazam.com/shazam/v3/en/GB/web/-/tracks/ip-city-chart-524901?pageSize=2&startFrom=2
  const url = `https://cdn.shazam.com/shazam/v3/en/GB/web/-/tracks/ip-city-chart-${cityId}?pageSize=${pageSize}&startFrom=0`;

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
        error: "Shazam city API error",
        status: response.status,
        details: errorText,
      });
    }

    const rawData = await response.json();
    const tracksArray = Array.isArray(rawData.tracks) ? rawData.tracks : [];

    const tracks = tracksArray.map((item, index) => ({
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
