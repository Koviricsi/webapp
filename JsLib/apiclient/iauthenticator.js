export default class IAuthenticator {
    #client = null
    get client() { return this.#client }

    constructor(client) {
        this.#client = client
    }

    // getAuthenticationView() {
    //     throw new Error('Not implemented!')
    // }

    async initialize() {
    }

    async authenticate(response) {
        throw new Error('Not implemented!')
    }

    // async clearAuthentication() {
    //     throw new Error('Not implemented!')
    // }

    // async getAuthorizationInfo() {
    //     throw new Error('Not implemented!')
    // }
}