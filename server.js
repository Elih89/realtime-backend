// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fetch = require("node-fetch");

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN,
  methods: ["POST"]
}));

// We MUST read SDP as raw text, not JSON:
app.use(express.text({ type: "application/sdp" }));

app.post("/webrtc", async (req, res) => {
  try {
    const offerSDP = req.body;

    const openai = await fetch(
      "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/sdp",
          "OpenAI-Beta": "realtime=v1"
        },
        body: offerSDP
      }
    );

    const answerText = await openai.text();

    if (!openai.ok) {
      console.error("OpenAI Error:", answerText);
      return res.status(openai.status).send(answerText);
    }

    res.set("Content-Type", "application/sdp");
    res.send(answerText);
  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({ error: "Server crash" });
  }
});

app.listen(process.env.PORT, () =>
  console.log("Backend running on port " + process.env.PORT)
);
