export default async function handler(req, res) {
  const countryCode = req.query.country_code || "RU"; // default: Rusland
  const limit = req.query.limit || "10";

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = "shazam8.p.rapidapi.com";

  if (!rapidApiKey) {
    return res.status(500).json({ error: "RAPIDAPI_KEY not set in Vercel" });
  }

  const url = `https://${rapidApiHost}/track/top/country?country_code=${countryCode}&limit=${limit}`;

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

    // Voor nu geven we de ruwe data terug zodat we de structuur kunnen bekijken
    return res.status(200).json(rawData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Server error",
      details: String(err),
    });
  }
}
