import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/translate", async (req, res) => {
  const { text, tone = "neutral" } = req.body;

  const toneInstruction = {
    neutral: "Use a neutral, clear Spanish translation.",
    formal: "Use a formal, polished Spanish translation.",
    casual: "Use a natural, conversational Spanish translation.",
    academic: "Use an academic, precise Spanish translation.",
  }[tone] || "Use a neutral, clear Spanish translation.";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional translator. Translate from English to Spanish only. Return only the translated text without explanations."
          },
          {
            role: "user",
            content: `${toneInstruction}\n\nText to translate:\n${text}`
          }
        ],
        temperature: 0.2
      }),
    });

    const data = await response.json();
    const translation = data?.choices?.[0]?.message?.content?.trim();

    if (!response.ok || !translation) {
      return res.status(500).json({ error: "Translation failed" });
    }

    res.json({ translation });
  } catch (error) {
    res.status(500).json({ error: "Translation failed" });
  }
});

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});