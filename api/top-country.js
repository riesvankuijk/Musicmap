export default async function handler(req, res) {
  // Landcode uit query, standaard NL
  const countryCode = (req.query.country_code || "NL").toUpperCase();
  const limitParam = parseInt(req.query.limit || "20", 10);

  // max. 50 om het netjes te houden
  const pageSize = Math.min(Math.max(limitParam, 1), 50);

  // We gebruiken rechtstreeks de Shazam web-JSON endpoint
  // Voorbeeld dat we eerder terug zagen:
  // https://cdn.shazam.com/shazam/v3/en/GB/web/-/tracks/ip-country-chart-RU?pageSize=2&startFrom=2
  const url = `https://cdn.shazam.com/shazam/v3/en/GB/web/-/tracks/ip-country-chart-${countryCode}?pageSize=${pageSize}&startFrom=0`;

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
        error: "Shazam web API error",
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
      country: countryCode,
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
