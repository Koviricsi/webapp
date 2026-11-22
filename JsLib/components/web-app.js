import WebComponent from './web-component.js'
import ApiClient from '../apiclient/apiclient.js'

export default class WebApp extends WebComponent {
    //#region Properties
    static #defaultSettings = {
        apiUrl: '',
        authUrl: '',

        'css': './style.css',
        'template': './template.html'
    }

    #apiClient = null
    get apiClient() { return this.#apiClient }

    #settings = null
    get settings() { return this.#settings }

    #components = null
    get components() {
        if (this.#components == null && this.initialized) {
            this.#components = new Map()
            for (let e of this.shadowRoot.querySelectorAll('[name]')) {
                if (e.tagName.includes('-')) {
                    this.#components.set(e.name, e)
                }
            }
        }

        return this.#components
    }

    #authRequiredListener = event => this.authRequiredHandler(event)
    #authCompletedListener = event => this.authCompletedHandler(event)

    #unhandledRejectionListener = event => {
        this.handleError(event.reason)
    }

    handleError(error) {
        console.error(error)
    }
    //#endregion

    //#region Views
    #views = new Map()

    addView(name, selector) {
        const element = this.shadowRoot.querySelector(selector)

        if (!element) {
            throw new Error(`View "${name}" not found: ${selector}`)
        }

        if (this.#views.has(name)) {
            throw new Error(`View "${name}" already exists.`)
        }

        this.#views.set(name, element)
        element.hidden = true

        return element
    }

    getView(name) {
        const view = this.#views.get(name)
        if (!view) {
            throw new Error(`View "${name}" not found.`)
        }
        return view
    }

    showView(name, isVisible = true) {
        const view = this.getView(name)
        view.hidden = !isVisible
    }
    //#endregion

    constructor(settings) {
        settings = {
            ...WebApp.#defaultSettings,
            ...settings
        }

        settings.apiUrl = new URL(settings.apiUrl).href,
        settings.authUrl = settings.authUrl,
        settings.css = new URL(settings.css, document.location.href).href,
        settings.template = new URL(settings.template, document.location.href).href

        super(settings)
        this.#settings = settings
        this.#apiClient = new ApiClient(settings)
    }

    //#region WebComponent overrides
    connectedCallback() {
        super.connectedCallback()
        document.addEventListener('auth-required', this.#authRequiredListener)
        document.addEventListener('auth-completed', this.#authCompletedListener)
    }

    disconnectedCallback() {
        document.removeEventListener(this.#authRequiredListener)
    }

    initializeDom() {
        super.initializeDom()
    }

    update() {

    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    authRequiredHandler(event) {
        event.detail.resolve({})
    }

    authCompletedHandler(event) {
        if (event.detail.success) {

        }
        if (event.detail.error) {

        }
    }
    //#endregion
}
