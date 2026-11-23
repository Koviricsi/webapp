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
    }
  }

  #initializeCard() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [_css];
    this.shadowRoot.innerHTML = _html;

    if (!this.#cardData) return;

    this.dataset.state = this.#cardData.state ?? "locked";

    for (const [key, value] of Object.entries(this.#cardData)) {
      if (!value) continue; //ha üres a value átugorjuk

      const elem = this.shadowRoot.querySelector(`[data-field="${key}"]`);
      if (!elem) continue; //ha nincs ilyen mező átugorjuk

      if (key === "options") {
        elem.innerHTML = value
          .split(";")
          .map((opt) => `<option value="${opt}">${opt}</option>`)
          .join("");

        if (this.#cardData.state === "closed") {
          elem.disabled = true;
          elem.value = this.#cardData.answer ?? "";
        }
      } else if (key === "image") {
        elem.src = `./assets/${value}`;
      } else {
        elem.textContent = value;
      }

      elem.hidden = false; //az elem(ek) alapvetően nem láthatóak, ezért láthatóvá kell tenni őket
    }
  }
}

customElements.define("advent-card", AdventCard);

export default AdventCard;
