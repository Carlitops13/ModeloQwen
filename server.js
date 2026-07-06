import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct";
const HF_PROVIDER = process.env.HF_PROVIDER || "together";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const hf = new InferenceClient(HF_TOKEN);
const allowedModels = new Set([
  "meta-llama/Llama-3.1-8B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.3",
  "Qwen/Qwen3-8B",
  "deepseek-ai/DeepSeek-R1",
  "google/gemma-3-12b-it",
  "microsoft/Phi-4",
  "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
]);
const fallbackModels = [
  HF_MODEL,
  "mistralai/Mistral-7B-Instruct-v0.3",
  "Qwen/Qwen3-8B",
  "meta-llama/Llama-3.1-8B-Instruct",
  "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
];

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Backend funcionando",
    model: HF_MODEL,
    provider: HF_PROVIDER,
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!HF_TOKEN) {
      return res.status(500).json({
        error: "Falta HF_TOKEN en el archivo .env",
      });
    }

    const { messages, model, provider } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Debes enviar un arreglo messages con al menos un mensaje.",
      });
    }

    const safeMessages = messages
      .filter((m) => m && typeof m.content === "string")
      .map((m) => ({
        role: ["system", "user", "assistant"].includes(m.role)
          ? m.role
          : "user",
        content: m.content.slice(0, 3000),
      }))
      .slice(-10);

    const selectedModel =
      typeof model === "string" && allowedModels.has(model) ? model : HF_MODEL;
    const selectedProvider =
      typeof provider === "string" && provider.trim() ? provider : HF_PROVIDER;

    const candidateModels = [selectedModel, ...fallbackModels].filter(
      (model, index, array) =>
        typeof model === "string" && array.indexOf(model) === index,
    );

    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const response = await hf.chatCompletion({
          provider: selectedProvider,
          model: modelName,
          messages: [
            {
              role: "system",
              content:
                "Eres un asistente educativo, claro, breve y útil para estudiantes de desarrollo web.",
            },
            ...safeMessages,
          ],
          max_tokens: 350,
          temperature: 0.7,
        });

        const answer =
          response.choices?.[0]?.message?.content ||
          "No se recibió respuesta del modelo.";

        return res.json({
          answer,
          modelUsed: modelName,
          providerUsed: selectedProvider,
          fallbackApplied: modelName !== selectedModel,
        });
      } catch (error) {
        lastError = error;
      }
    }

    return res.json({
      answer:
        "No pude conectar con un modelo remoto en este momento. Intenta de nuevo en unos segundos o elige otro modelo del selector.",
      modelUsed: selectedModel,
      providerUsed: selectedProvider,
      fallbackApplied: true,
      fallbackReason: lastError?.message || "No se pudo generar la respuesta.",
    });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    res.status(500).json({
      error: "No se pudo generar la respuesta.",
      detail: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
