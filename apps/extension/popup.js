const apiBaseInput = document.querySelector("#apiBaseInput");
const titleInput = document.querySelector("#titleInput");
const contentInput = document.querySelector("#contentInput");
const captureButton = document.querySelector("#captureButton");
const saveButton = document.querySelector("#saveButton");
const statusText = document.querySelector("#statusText");

chrome.storage.local.get(["driveaiApiBase"], ({ driveaiApiBase }) => {
  if (driveaiApiBase) {
    apiBaseInput.value = driveaiApiBase;
  }
});

function setStatus(text, isError = false) {
  statusText.textContent = text;
  statusText.style.color = isError ? "#8a1c1c" : "#4b5563";
}

captureButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  const response = await chrome.tabs.sendMessage(tab.id, {
    type: "DRIVEAI_GET_SELECTION",
  });

  titleInput.value = response.title || "";
  contentInput.value = response.selection || "";
  setStatus(response.selection ? "선택한 텍스트를 불러왔습니다." : "선택된 텍스트가 없습니다.");
});

saveButton.addEventListener("click", async () => {
  try {
    const apiBase = apiBaseInput.value.trim();
    const content = contentInput.value.trim();

    if (!content) {
      throw new Error("저장할 텍스트가 없습니다.");
    }

    chrome.storage.local.set({ driveaiApiBase: apiBase });

    const response = await fetch(`${apiBase}/study-sources`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: titleInput.value.trim() || "Captured page",
        content,
        metadata: {
          source: "extension",
        },
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || `Request failed: ${response.status}`);
    }

    setStatus(`저장 완료: ${payload.item.id}`);
  } catch (error) {
    setStatus(error.message, true);
  }
});
