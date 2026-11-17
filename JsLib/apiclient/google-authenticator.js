import AuthenticationError from './authentication-error.js'
import IAuthenticator from './iauthenticator.js'

export default class GoogleAuthenticator extends IAuthenticator {
    #authorizePromise = null
    #resolveAuthorize = null
    #rejectAuthorize = null
    #authorizeTimer = null
    #isInitialized = false

    #clientId = null
    #responseHandler = null

    constructor(options) {
        super()
        this.#clientId = options.clientId
        this.#responseHandler = options.responseHandler
    }

    #cleanUpAuthorization() {
        clearTimeout(this.#authorizeTimer)
        this.#authorizeTimer = null
        this.#authorizePromise = null
        this.#resolveAuthorize = null
        this.#rejectAuthorize = null
    }

    async initialize(container) {
        if (!this.#isInitialized) {
            google.accounts.id.initialize({
                context: 'signin',
                auto_prompt: false,
                class: 'gsi',
                ux_mode: 'popup',
                client_id: this.client.options.client_id,
                callback: this.#responseHandler
            });

            this.#isInitialized = true;
        }

        google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large'
        });
    }

    async getCredentials() {
        // Az azonosítás eredményének visszaadása

    }

    async authenticate(response) {
        clearTimeout(this.#authorizeTimer)
        this.#authorizeTimer = null

        const promise = this.#authorizePromise
        if (!promise) return

        try {
            const token = await this.client.getToken(response)
            if (this.#authorizePromise !== promise) return

            localStorage.setItem('at', token)
            this.#resolveAuthorize?.(token)
        } catch (err) {
            if (this.#authorizePromise === promise) {
                this.#rejectAuthorize?.(new AuthenticationError(err.message, { cause: err }))
            }
        } finally {
            if (this.#authorizePromise === promise) {
                this.#cleanUpAuthorization()
            }
        }
    }

    async clearAuthentication() {
        try {
            localStorage.removeItem('at')
        } catch (err) {
            throw new AuthenticationError('A hitelesítési adatok törlése sikertelen', { cause: err })
        }
    }

    async getAuthorizationInfo() {
        return this.client.get('/users/me')
    }
}