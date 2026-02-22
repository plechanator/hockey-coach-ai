import type { Express } from "express";
import type { Server } from "http";
import OpenAI from "openai";

/*
=====================================
OPENAI INIT
=====================================
*/

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/*
=====================================
ROUTES
=====================================
*/

export async function registerRoutes(
  _server: Server,
  app: Express,
) {

  /*
  ===============================
  HEALTH CHECK
  ===============================
  */

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      env: process.env.NODE_ENV,
    });
  });

  /*
  ===============================
  TEST ROUTE
  ===============================
  */

  app.get("/api/test", (_req, res) => {
    res.json({
      message: "Hockey Coach AI backend running 🚀",
    });
  });

  /*
  ===============================
  OPENAI CHAT ENDPOINT
  ===============================
  */

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          error: "Message required",
        });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a professional ice hockey coaching assistant.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      });

      const reply =
        completion.choices[0]?.message?.content ?? "";

      res.json({
        reply,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "AI request failed",
      });
    }
  });

  /*
  ===============================
  FALLBACK API
  ===============================
  */

  app.get("/api/*", (_req, res) => {
    res.status(404).json({
      error: "API route not found",
    });
  });
}
