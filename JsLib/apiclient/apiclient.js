import IAuthenticator from './iauthenticator.js'
import ApiError from './apierror.js'

export default class ApiClient {
    #apiUrl = null
    get apiUrl() { return this.#apiUrl }

    #authType = null
    get authType() { return this.#authType }

    #authenticator = null
    #authenticatorPromise = null

    #accessToken = null

    static #loadDependency(dependency) {
        if (dependency.type === 'module') {
            return import(dependency.src)
        }

        if (dependency.type === 'script') {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script')
                script.src = dependency.src
                script.onload = resolve
                script.onerror = () => reject(
                    new Error(`Nem sikerült betölteni: ${dependency.src}`))
                document.head.append(script)
            })
        }

        throw new Error(`Ismeretlen dependency típus: ${dependency.type}`)
    }

    #prepareBody(body, headers) {
        if (body === null || body === undefined) {
            return body;
        }

        if (ArrayBuffer.isView(body)) {
            return new Blob([
                body.buffer.slice(
                    body.byteOffset,
                    body.byteOffset + body.byteLength
                )])
        }

        if (body instanceof Blob
            || body instanceof FormData
            || body instanceof URLSearchParams
            || body instanceof ArrayBuffer) {
            return body
        }
        
        if (typeof body === 'object') {
            if (!headers.has('Content-Type')) {
                headers.set('Content-Type', 'application/json')
            }
            return JSON.stringify(body)
        }

        return body
    }

    async #getAuthenticator() {
        if (this.#authenticator !== null) {
            return this.#authenticator
        }

        if (this.#authenticatorPromise === null) {
            this.#authenticatorPromise = this.#loadAuthenticator()
        }

        try {
            this.#authenticator = await this.#authenticatorPromise
            return this.#authenticator
        } catch (error) {
            this.#authenticatorPromise = null
            throw error
        }
    }

    async #loadAuthenticator() {
        const authConfig = registry[this.#authType]
        if (!authConfig) {
            throw new ApiError('Unsupported authenticator')
        }

        // függőségi szkriptek vagy modulok betöltése
        const loading = (authConfig.dependencies ?? [])
                            .map(dependency => ApiClient.#loadDependency(dependency))
        await Promise.all(loading)

        // Authenticator betöltése
        const { default: Authenticator } = await import(authConfig.authenticator)
        const authenticator = new Authenticator(this)
        if (!(authenticator instanceof IAuthenticator)) {
            throw new Error('Invalid authenticator')
        }
        return authenticator
    }

    authorizeRequest(request) {
        this.#accessToken ??= localStorage.getItem('accessToken')
        if (this.#accessToken) {
            request.headers.set(
                'Authorization',
                `Bearer ${this.#accessToken}`
            )
        } else {
            request.headers.delete('Authorization')
        }
    }

    constructor(url, authType) {
        this.#apiUrl = url
        this.#authType = authType
    }

    async request(path, options = {}) {
        const fetchOptions = {
            method: options.method ?? 'get',
            headers: new Headers(options.headers),
            mode: options.mode,
            credentials: options.credentials,
            cache: options.cache,
            redirect: options.redirect,
            referrer: options.referrer,
            integrity: options.integrity,
            keepalive: options.keepalive,
            signal: options.signal
        }
        fetchOptions.body = this.#prepareBody(options.body, fetchOptions.headers)

        const url = new URL(path, this.#apiUrl)
        const sendRequest = async () => {
            this.authorizeRequest(fetchOptions)
            try {
                return await fetch(url.toString(), fetchOptions)
            } catch (error) {
                throw new Error(`Hálózati hiba: ${error.message}`, { cause: error })
            }
        }

        let response = await sendRequest()

        if (response.status === 401) {
            const authenticator = await this.#getAuthenticator()
            document.dispatchEvent(
                new CustomEvent('auth-required', {
                    detail: { callback: container => this }}))
        }

        await authenticator.authenticate({
            clientId: '',
            responseHandler: credentials => {
                // credentials küldése a login végpontra
                // access token tárolása
            }
        })
        response = await sendRequest()

        return response
    }

    async getContent(response, responseType = 'auto') {
        if (response.status === 401) {
            throw ApiError.fromResponse(
                response,
                'A kérés hitelesítése sikertelen'
            )
        }

        if (!response.ok) {
            throw ApiError.fromResponse(response)
        }

        if (response.status === 204) {
            return null
        }

        if (responseType === 'auto') {
            const contentType = response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()

            if (contentType === 'application/json' || contentType?.endsWith('+json')) {
                responseType = 'json'
            } else if (contentType?.startsWith('text/')) {
                responseType = 'text'
            } else {
                responseType = 'blob'
            }
        }

        try {
            switch (responseType) {
                case 'json':
                    return await response.json()
                case 'text':
                    return await response.text()
                case 'blob':
                    return await response.blob()
                case 'arrayBuffer':
                    return await response.arrayBuffer()
                default:
                    throw ApiError.fromResponse(response, `Ismeretlen responseType: ${responseType}`)
            }
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            } else {
                throw ApiError.fromResponse(
                    response,
                    'A válasz tartalmának feldolgozása sikertelen',
                    error
                )
            }
        }
    }

    async get(path, options = {}) {
        const response = await this.request(path, {
            ...options,
            method: 'get'
        })
        return this.getContent(response, options.responseType)
    }

    async post(path, data, options = {}) {
        const response = await this.request(path, {
            ...options,
            method: 'post',
            body: data
        })
        return this.getContent(response, options.responseType)
    }

    async put(path, data, options = {}) {
        const response = await this.request(path, {
            ...options,
            method: 'put',
            body: data
        })
        return this.getContent(response, options.responseType)
    }

    async delete(path, options = {}) {
        const response = await this.request(path, {
            ...options,
            method: 'delete'
        })
        return this.getContent(response, options.responseType)
    }
}