const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Railway asigna el puerto solo
const PORT = process.env.PORT || 3000;

// 🔥 Webhook Telegram
app.post("/webhook", async (req, res) => {
  try {
    const update = req.body;

    console.log("Evento recibido:", JSON.stringify(update, null, 2));

    // 👉 detectar join a canal/grupo
    if (update.message?.new_chat_members) {
      const user = update.message.new_chat_members[0];

      // 🔥 enviar a Meta CAPI
      await axios.post(
        `https://graph.facebook.com/v19.0/${process.env.PIXEL_ID}/events`,
        {
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "system_generated",
              user_data: {
                external_id: String(user.id)
              }
            }
          ],
          access_token: process.env.META_TOKEN
        }
      );

      console.log("🔥 Evento enviado a Meta CAPI");
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Error webhook:", err);
    res.sendStatus(500);
  }
});

// test
app.get("/", (req, res) => {
  res.send("Webhook activo 🚀");
});

// importante Railway
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});
