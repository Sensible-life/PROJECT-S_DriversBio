const state = {
  apiBase: localStorage.getItem("driveai:api-base") || "http://127.0.0.1:3030",
  currentSession: null,
};

const elements = {
  apiBaseInput: document.querySelector("#apiBaseInput"),
  reloadButton: document.querySelector("#reloadButton"),
  healthStatus: document.querySelector("#healthStatus"),
  sourceTitleInput: document.querySelector("#sourceTitleInput"),
  sourceContentInput: document.querySelector("#sourceContentInput"),
  createSourceButton: document.querySelector("#createSourceButton"),
  sourceCountLabel: document.querySelector("#sourceCountLabel"),
  sourcesList: document.querySelector("#sourcesList"),
  sessionStatusLabel: document.querySelector("#sessionStatusLabel"),
  questionPrompt: document.querySelector("#questionPrompt"),
  answerInput: document.querySelector("#answerInput"),
  submitAnswerButton: document.querySelector("#submitAnswerButton"),
  feedbackCard: document.querySelector("#feedbackCard"),
  feedbackText: document.querySelector("#feedbackText"),
  feedbackMeta: document.querySelector("#feedbackMeta"),
};

elements.apiBaseInput.value = state.apiBase;

async function request(path, options = {}) {
  const response = await fetch(`${state.apiBase}${path}`, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload;
}

async function runWithUiError(task) {
  try {
    await task();
  } catch (error) {
    renderHealth(error.message, true);
  }
}

function renderHealth(text, isError = false) {
  elements.healthStatus.textContent = text;
  elements.healthStatus.style.color = isError ? "#8a1c1c" : "";
}

function renderSession(session) {
  state.currentSession = session;
  elements.submitAnswerButton.disabled = !session?.currentQuizItem;
  elements.sessionStatusLabel.textContent = session
    ? `${session.status} / ${session.mode}`
    : "대기 중";
  elements.questionPrompt.textContent =
    session?.currentQuizItem?.prompt || "세션을 시작하면 질문이 여기에 표시됩니다.";
}

function renderFeedback(evaluation) {
  if (!evaluation) {
    elements.feedbackCard.classList.add("hidden");
    return;
  }

  elements.feedbackCard.classList.remove("hidden");
  elements.feedbackText.textContent = evaluation.spokenFeedback;
  elements.feedbackMeta.textContent = `score=${evaluation.score} missing=${evaluation.missingPoints.join(", ") || "-"}`;
}

function sourceCard(item) {
  const wrapper = document.createElement("article");
  wrapper.className = "source-card";

  const meta = item.quizItemIds?.length || 0;

  wrapper.innerHTML = `
    <div class="source-row">
      <div>
        <h3>${item.title}</h3>
        <p class="meta">${item.status} / quiz ${meta}개</p>
      </div>
      <span class="badge">${item.status}</span>
    </div>
    <p class="meta">${item.content.slice(0, 120)}${item.content.length > 120 ? "..." : ""}</p>
    <div class="actions">
      <button type="button" data-action="process">자료 처리</button>
      <button type="button" data-action="start">세션 시작</button>
    </div>
  `;

  wrapper.querySelector('[data-action="process"]').addEventListener("click", async () => {
    await runWithUiError(async () => {
      await request(`/study-sources/${item.id}/process`, { method: "POST" });
      await loadSources();
    });
  });

  wrapper.querySelector('[data-action="start"]').addEventListener("click", async () => {
    await runWithUiError(async () => {
      const created = await request("/sessions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sourceId: item.id,
          limit: 4,
        }),
      });

      renderSession(created.item);
      renderFeedback(null);
    });
  });

  return wrapper;
}

async function loadHealth() {
  try {
    const health = await request("/health");
    renderHealth(`연결됨: provider=${health.provider}`);
  } catch (error) {
    renderHealth(error.message, true);
  }
}

async function loadSources() {
  const payload = await request("/study-sources");
  elements.sourcesList.replaceChildren(...payload.items.map(sourceCard));
  elements.sourceCountLabel.textContent = `${payload.items.length}개`;
}

elements.reloadButton.addEventListener("click", async () => {
  await runWithUiError(async () => {
    state.apiBase = elements.apiBaseInput.value.trim() || state.apiBase;
    localStorage.setItem("driveai:api-base", state.apiBase);
    await bootstrap();
  });
});

elements.createSourceButton.addEventListener("click", async () => {
  await runWithUiError(async () => {
    const title = elements.sourceTitleInput.value.trim();
    const content = elements.sourceContentInput.value.trim();

    if (!title || !content) {
      renderHealth("제목과 내용을 모두 입력해야 합니다.", true);
      return;
    }

    await request("/study-sources", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    elements.sourceTitleInput.value = "";
    elements.sourceContentInput.value = "";
    await loadSources();
  });
});

elements.submitAnswerButton.addEventListener("click", async () => {
  await runWithUiError(async () => {
    const transcript = elements.answerInput.value.trim();
    if (!transcript || !state.currentSession) {
      return;
    }

    const payload = await request(`/sessions/${state.currentSession.id}/answers`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ transcript }),
    });

    elements.answerInput.value = "";
    renderFeedback(payload.evaluation);
    renderSession(payload.session);
  });
});

async function bootstrap() {
  renderSession(null);
  renderFeedback(null);
  await loadHealth();
  await loadSources();
}

bootstrap().catch((error) => renderHealth(error.message, true));
