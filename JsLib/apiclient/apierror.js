export default class ApiError extends Error {
    constructor(message, {
        status = null,
        statusText = null,
        cause = undefined
    } = {}) {
        super(message, { cause })

        this.name = 'ApiError'
        this.status = status
        this.statusText = statusText
    }

    static fromResponse(response, message = null, cause = undefined) {
        return new ApiError(
            message ?? `HTTP hiba: ${response.status} ${response.statusText}`,
            {
                status: response.status,
                statusText: response.statusText,
                cause
            }
        )
    }
}