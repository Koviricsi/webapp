export default class IAuthenticator {
    #client = null
    get client() {
        return this.#client
    }
    
    #container = null
    get container() {
        return this.#container
    }

    #config = null
    get config() {
        return this.#config
    }

    constructor(client, config) {
        this.#client = client
        this.#config = config
    }

    async initialize({ container = null } = {}) {
        this.#container = container

        const loading = (this.#config.dependencies ?? [])
            .map(dependency => this.client.loadDependency(dependency))

        await Promise.all(loading)
    }

    async authenticate(context) {
        throw new Error('Not implemented!')
    }
}