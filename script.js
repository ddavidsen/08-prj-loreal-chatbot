/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const workerUrl = "https://loreal-worker.ddavidsen3366.workers.dev/";
const assistantInstructions =
  "You are a helpful L'Oréal beauty assistant. Only answer questions about L'Oréal products, beauty routines, skincare, makeup, haircare, fragrances, and closely related beauty topics. If the user asks about anything else, politely refuse and redirect them back to L'Oréal or beauty-related help.";

// Add a message bubble to the chat window.
function addMessageBubble(role, text) {
  const messageBubble = document.createElement("div");
  messageBubble.classList.add("msg", role);
  messageBubble.textContent = text;
  chatWindow.appendChild(messageBubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return messageBubble;
}

// Set initial assistant message.
addMessageBubble("assistant", "👋 Hello! How can I help you today?");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();

  if (!message) {
    return;
  }

  // Show only the current exchange by clearing older messages.
  chatWindow.innerHTML = "";

  // Show the user's message right away.
  addMessageBubble("user", message);

  // Add a temporary thinking bubble while waiting for the API.
  const thinkingBubble = addMessageBubble("assistant", "Thinking...");
  thinkingBubble.classList.add("typing");

  userInput.value = "";

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: assistantInstructions,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const botReply = data.choices[0].message.content;

    thinkingBubble.remove();
    addMessageBubble("assistant", botReply);
  } catch (error) {
    thinkingBubble.remove();
    addMessageBubble(
      "assistant",
      "Sorry, I could not get a response right now.",
    );
    console.error("Worker request error:", error);
  }
});
