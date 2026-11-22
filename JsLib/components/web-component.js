export default class WebComponent extends HTMLElement {
    static observedAttributes = []

    #options = null

    #css = null
    get css() { return this.#css }

    #templateNode = null
    get templateNode() { return this.#templateNode }

    #initializationPromise = null
    #initialized = false
    get initialized() {
        return this.#initialized
    }

    async isInitialized() {
        if (this.#initializationPromise) {
            await this.#initializationPromise
        }

        return this.#initialized
    }

    constructor(options = {}) {
        super()
        this.#options = { ...options }
    }

    async connectedCallback() {
        if (!this.#initializationPromise) {
            this.#initializationPromise = (async () => {
                const options = {
                    css: this.getAttribute('css'),
                    template: this.getAttribute('template'),
                    ...this.#options
                }

                const loading = []

                if (options.css) {
                    loading.push(this.loadResource(options.css, 'css').then(res => this.#css = res))
                }

                if (options.template) {
                    loading.push(this.loadResource(options.template, 'html').then(res => this.#templateNode = res))
                }

                await Promise.all(loading)
                this.initializeDom()
                this.#initialized = true
            })()
        }

        try {
            await this.#initializationPromise
            await this.update()
            await this.main()
        }
        catch (error) {
            this.dispatchEvent(new CustomEvent('component-error', {
                detail: error,
                bubbles: true,
                composed: true
            }))
        }
    }

    disconnectedCallback() {

    }

    initializeDom() {
        const shadow = this.attachShadow({ mode: 'open' })

        if (this.#css) {
            shadow.adoptedStyleSheets = [this.#css]
        }

        if (this.#templateNode) {
            shadow.append(this.#templateNode.content.cloneNode(true))
        }
    }

    async update() {
    }

    async main() {
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    setCssProperty(name, value) {
        this.style.setProperty(`--${name}`, value)
    }

    setCssProperties(properties) {
        for (let [name, value] of Object.entries(properties)) {
            this.style.setProperty(`--${name}`, value)
        }
    }

    addStyleSheet(css) {
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(css)

        this.shadowRoot.adoptedStyleSheets = [
            ...this.shadowRoot.adoptedStyleSheets,
            sheet
        ]
    }

    show(isVisible = true) {
        this.hidden = !isVisible
    }

    async loadResource(url, type) {
        const response = await fetch(url);

        if (!response.ok)
            throw new Error(`Resource loading failed: ${url} (${response.status})`);

        switch (type) {
            case 'text':
                return response.text();

            case 'json':
                return response.json();

            case 'html': {
                const template = document.createElement('template');
                template.innerHTML = await response.text();
                return template;
            }

            case 'css': {
                const stylesheet = new CSSStyleSheet();
                await stylesheet.replace(await response.text());
                return stylesheet;
            }

            case 'image': {
                const image = new Image();
                const objectUrl = URL.createObjectURL(await response.blob());

                image.src = objectUrl;

                try {
                    await image.decode();
                } finally {
                    URL.revokeObjectURL(objectUrl);
                }

                return image;
            }

            case 'blob':
                return response.blob();

            case 'arrayBuffer':
                return response.arrayBuffer();

            default:
                throw new Error(`Unsupported resource type: ${type}`);
        }
    }
}