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

// rawData heeft o.a. een "tracks" array
const tracks = (rawData.tracks || []).map((item, index) => ({
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
