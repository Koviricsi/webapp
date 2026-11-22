import IAuthenticator from './iauthenticator.js'
import ApiError from './apierror.js'
import _registry from './registry.json' with { type: 'json' }

export default class ApiClient {
    #config = null
    get apiUrl() { return this.#config.apiUrl }
    #authType = null

    #authenticator = null
    #authenticatorPromise = null
    #authenticationPromise = null

    #accessToken = null

    static #dependencies = new Map()

    loadDependency({ type = 'script', src }) {
        const key = `${type}:${src}`

        if (ApiClient.#dependencies.has(key)) {
            return ApiClient.#dependencies.get(key)
        }

        let promise

        if (type === 'module') {
            const url = new URL(src, import.meta.url)
            promise = import(url.href)
        } else if (type === 'script') {
            promise = new Promise((resolve, reject) => {
                const script = document.createElement('script')
                script.src = src
                script.async = true
                script.onload = () => resolve()
                script.onerror = () => reject(
                    new Error(`Nem sikerült betölteni: ${src}`)
                )
                document.head.append(script)
            })
        } else {
            return Promise.reject(
                new Error(`Ismeretlen dependency típus: ${type}`)
            )
        }

        ApiClient.#dependencies.set(key, promise)
        promise.catch(() => ApiClient.#dependencies.delete(key))

        return promise
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

    async #getAuthenticator(config /*{type:'google', container: null}*/) {
        if (this.#authenticator) {
            if (this.#authType !== config.type) {
                throw new ApiError('Authenticator type mismatch')
            }
            return this.#authenticator
        }

        if (this.#authenticatorPromise) {
            if (this.#authType !== config.type) {
                throw new ApiError('Authenticator type mismatch')
            }
            return this.#authenticatorPromise
        }

        const authConfig = _registry[config.type]
        if (!authConfig) {
            throw new ApiError('Unsupported authenticator')
        }
        this.#authType = config.type
        this.#authenticatorPromise = (async () => {
            const { default: Authenticator } = await this.loadDependency({ src: authConfig.authenticator, type: 'module' })

            const authenticator = new Authenticator(this, authConfig)

            if (!(authenticator instanceof IAuthenticator)) {
                throw new Error('Invalid authenticator')
            }

            await authenticator.initialize(config)
            return authenticator
        })()

        try {
            this.#authenticator = await this.#authenticatorPromise
            return this.#authenticator
        } catch (error) {
            this.#authType = null
            throw error
        } finally {
            this.#authenticatorPromise = null
        }
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

    constructor(config) {
        this.#config = config
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

        const url = new URL(path, this.apiUrl)
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
            if (this.#authenticationPromise == null) {
                this.#authenticationPromise = (async () => {
                    let error = null
                    try {
                        const config = await new Promise((resolve, reject) => {
                            const timeout = setTimeout(() => {
                                error = new ApiError('The application did not respond within 30 seconds.')
                                reject(error)
                            }, 30000)
                            document.dispatchEvent(new CustomEvent('auth-required', {
                                detail: {
                                    resolve: config => {
                                        clearTimeout(timeout)
                                        resolve(config)
                                    }
                                }}))
                        })
                        await this.#getAuthenticator(config)
                        const result = await this.#authenticator.authenticate()

                        if (!result.success) {
                            throw new ApiError(result.error ?? 'Authentication failed')
                        }

                        const authUrl = new URL(this.#config.authUrl ?? 'login', this.#config.apiUrl)
                        const tokenResponse = await fetch(

                            authUrl,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + result.data
                                },
                                body: JSON.stringify(result.data)
                            }
                        )

                        if (!tokenResponse.ok) {
                            throw ApiError.fromResponse(tokenResponse, 'Token exchange failed')
                        }

                        const content = await tokenResponse.json()
                        this.#accessToken = content.accessToken
                        localStorage.setItem('accessToken', this.#accessToken)
                    } catch (err) {
                        error = err
                    } finally {
                        this.#authenticationPromise = null
                        document.dispatchEvent(
                            new CustomEvent(
                                'auth-completed', {
                                    detail: {
                                        success: !!this.#accessToken && !error,
                                        error
                                    }
                                }))
                    }
                })()
            }
            await this.#authenticationPromise
            response = await sendRequest()
        }

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

    async logout() {
        return this.delete(this.#config.authUrl)
    }
}