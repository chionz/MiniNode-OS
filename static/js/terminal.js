const terminalInput = document.getElementById("terminalInput");
const terminalOutput = document.getElementById("terminalOutput");

terminalInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const command = terminalInput.value.trim();
    if (!command) return;

    appendLine(`$ ${command}`);
    terminalInput.value = "";

    try {
      const res = await fetch("/api/v1/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command })
      });

      const data = await res.json();
      if (res.ok) {
        appendLine(data.output || "(no output)");
      } else {
        appendLine(`Error: ${data.detail || "Unknown error"}`);
      }
    } catch (err) {
      appendLine(`Error: ${err.message}`);
    }

    scrollToBottom();
  }
});

function appendLine(text) {
  const line = document.createElement("div");
  line.textContent = text;
  terminalOutput.appendChild(line);
}

function scrollToBottom() {
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Optional close button
document.querySelector("#terminalWindow .win-close").onclick = () => {
  document.getElementById("terminalWindow").style.display = "none";
};
