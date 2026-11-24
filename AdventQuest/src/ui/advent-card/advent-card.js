import _css from "./advent-card.css" with { type: "css" };
const _html = await fetch(import.meta.resolve("./advent-card.html")).then(
  (resp) => resp.text(),
);

class AdventCard extends HTMLElement {
  #initialized = false;
  #cardData;
  #date = "?";
  #state;

  constructor(cardData) {
    super();
    this.#cardData = cardData;
  }

  connectedCallback() {
    if (!this.#initialized) {
      this.#initializeCard();
      this.#initialized = true;
    }
  }

  // #region Inicializálás és DOM felépítés
  #initializeCard() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [_css];
    this.shadowRoot.innerHTML = _html;

    if (!this.#cardData) return;

    // Állapot beállítása és zárolt jelzés hozzáadása
    this.dataset.state = this.#cardData.state ?? "locked";
    if (this.dataset.state === "locked") {
      this.shadowRoot.querySelector('[data-field="date"]').textContent += "🔒";
    }

    this.#setupCardFlip();
    this.#populateFields();
    this.#setupSubmitButton();
  }
  // #endregion

  // #region Eseménykezelők és mezők feltöltése
  // Kártya átfordítása csak a háttérre kattintva (ha nincs zárolva)
  #setupCardFlip() {
    if (this.dataset.state === "locked") return;

    this.addEventListener("click", (e) => {
      if (e.composedPath()[0] !== this) return;
      this.classList.toggle("flipped");
    });
  }

  // Adatok betöltése a HTML sablon mezőibe
  #populateFields() {
    for (const [key, value] of Object.entries(this.#cardData)) {
      if (!value) continue;

      const elem = this.shadowRoot.querySelector(`[data-field="${key}"]`);
      if (!elem) continue;

      if (key === "options") {
        elem.innerHTML = value
          .split(";")
          .map((opt) => `<option value="${opt}">${opt}</option>`)
          .join("");

        // Lezárt kártyánál a választás letiltása és a mentett válasz beállítása
        if (this.dataset.state === "closed") {
          elem.disabled = true;
          elem.value = this.#cardData.answer ?? "";
        }
      } else if (key === "image") {
        elem.src = value.startsWith("http") ? value : `./assets/${value}`;
      } else {
        elem.textContent += value;
      }

      elem.hidden = false;
    }
  }

  // Válasz küldése gomb beállítása vagy eltávolítása
  #setupSubmitButton() {
    const btSendAnswer = this.shadowRoot.querySelector(".btSendAnswer");

    if (this.dataset.state !== "open") {
      btSendAnswer.remove();
      return;
    }

    btSendAnswer.addEventListener("click", () => {
      const answer = this.shadowRoot.querySelector(
        '[data-field="options"]',
      ).value;

      this.dispatchEvent(
        new CustomEvent("answer-submitted", {
          detail: {
            id: this.#cardData.id,
            date: this.#cardData.date,
            answer,
          },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }
  // #endregion
}

customElements.define("advent-card", AdventCard);

export default AdventCard;
