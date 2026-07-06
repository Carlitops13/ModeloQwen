const form = document.getElementById("chatForm");
const promptInput = document.getElementById("prompt");
const messagesBox = document.getElementById("messages");
const clearBtn = document.getElementById("clearBtn");
const modelSelect = document.getElementById("modelSelect");
const suggestionsBox = document.getElementById("suggestions");

const modelOptions = [
  { label: "Llama 3.1 8B Instruct", value: "meta-llama/Llama-3.1-8B-Instruct" },
  {
    label: "Mistral 7B Instruct v0.3",
    value: "mistralai/Mistral-7B-Instruct-v0.3",
  },
  { label: "Qwen 3 8B", value: "Qwen/Qwen3-8B" },
  { label: "DeepSeek R1", value: "deepseek-ai/DeepSeek-R1" },
  { label: "Gemma 3 12B IT", value: "google/gemma-3-12b-it" },
  { label: "Phi-4", value: "microsoft/Phi-4" },
  { label: "TinyLlama 1.1B Chat", value: "TinyLlama/TinyLlama-1.1B-Chat-v1.0" },
];

const suggestionPrompts = [
  "Explica qué es una API con un ejemplo simple.",
  "Resume la diferencia entre frontend y backend.",
  "Dame una analogía para entender Hugging Face.",
  "Escribe un prompt útil para estudiar JavaScript.",
];

let messages = JSON.parse(localStorage.getItem("minigpt_messages")) || [];
let selectedModel =
  localStorage.getItem("minigpt_model") || modelOptions[0].value;

function populateModelSelect() {
  modelSelect.innerHTML = "";

  modelOptions.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.value;
    option.textContent = model.label;
    modelSelect.appendChild(option);
  });

  modelSelect.value = modelOptions.some(
    (model) => model.value === selectedModel,
  )
    ? selectedModel
    : modelOptions[0].value;

  selectedModel = modelSelect.value;
  localStorage.setItem("minigpt_model", selectedModel);
}

function populateSuggestions() {
  suggestionsBox.innerHTML = "";

  suggestionPrompts.forEach((prompt) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggestion-chip";
    button.textContent = prompt;
    button.addEventListener("click", async () => {
      promptInput.value = prompt;
      await sendMessage(prompt);
      promptInput.value = "";
      promptInput.focus();
    });
    suggestionsBox.appendChild(button);
  });
}

function saveMessages() {
  localStorage.setItem("minigpt_messages", JSON.stringify(messages));
}

function renderMessages() {
  messagesBox.innerHTML = "";

  if (messages.length === 0) {
    addBubble(
      "assistant",
      "Hola 👋 Soy MiniGPT HF. Pregúntame algo sobre desarrollo web, APIs o inteligencia artificial.",
      false,
    );
    return;
  }

  messages.forEach((msg) => addBubble(msg.role, msg.content, false));
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function addBubble(role, content, shouldScroll = true) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = content;
  messagesBox.appendChild(div);
  if (shouldScroll) messagesBox.scrollTop = messagesBox.scrollHeight;
}

async function sendMessage(userText) {
  messages.push({ role: "user", content: userText });
  saveMessages();
  renderMessages();

  const loading = { role: "assistant", content: "Pensando..." };
  messages.push(loading);
  renderMessages();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.filter((m) => m.content !== "Pensando..."),
        model: selectedModel,
        provider: "auto",
      }),
    });

    const data = await response.json();

    messages.pop();

    if (!response.ok) {
      messages.push({
        role: "assistant error",
        content: data.detail
          ? `${data.error || "Error desconocido."}\n${data.detail}`
          : data.error || "Error desconocido.",
      });
    } else {
      messages.push({ role: "assistant", content: data.answer });
    }
  } catch (error) {
    messages.pop();
    messages.push({
      role: "assistant error",
      content: "No se pudo conectar con el backend: " + error.message,
    });
  }

  saveMessages();
  renderMessages();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = promptInput.value.trim();
  if (!text) return;

  promptInput.value = "";
  form.querySelector("button").disabled = true;
  await sendMessage(text);
  form.querySelector("button").disabled = false;
  promptInput.focus();
});

promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

clearBtn.addEventListener("click", () => {
  messages = [];
  saveMessages();
  renderMessages();
});

modelSelect.addEventListener("change", () => {
  selectedModel = modelSelect.value;
  localStorage.setItem("minigpt_model", selectedModel);
});

populateModelSelect();
populateSuggestions();
renderMessages();
