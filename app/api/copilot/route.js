export async function POST(request) {
  try {
    const { profile, entries, situation, tags } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY manquante. Ajoute-la dans .env.local" },
        { status: 500 }
      );
    }

    const recent = (entries || []).slice(-5).map((e) => ({
      date: e.date,
      note: e.note,
    }));

    const prompt = `Tu es un copilote stratégique pour entrepreneurs.
Profil : ${profile || "non précisé"}
Situation actuelle (0-10) : ${JSON.stringify(situation)}
Notes récentes : ${JSON.stringify(recent)}
Tags : ${JSON.stringify(tags || [])}

Réponds UNIQUEMENT en JSON valide, sans texte autour, avec cette structure :
{
  "synthese": "résumé court de la situation",
  "priorites": ["action 1", "action 2", "action 3"],
  "risques": ["risque 1", "risque 2"],
  "opportunites": ["opportunité 1", "opportunité 2"]
}`;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      return Response.json({ error: `Erreur API: ${errText}` }, { status: 500 });
    }

    const data = await anthropicResponse.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    if (!textBlock) throw new Error("Réponse vide de l'API");

    const clean = textBlock.text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
