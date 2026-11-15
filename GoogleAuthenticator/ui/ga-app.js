import _css from './ga.css' with { type: 'css' }
import _appSettings from './appsettings.json' with { type: 'json' }

class GoogleAuthenticatorApp extends HTMLElement {
    #initialized = false
    #googleIdToken = null
    #googleScriptPromise
    #googleIdentityInitialized = false

    loadGoogleIdentityServices() {
        if (!this.#googleScriptPromise) {
            this.#googleScriptPromise = new Promise((resolve, reject) => {
                const script = document.createElement('script')
                script.src = 'https://accounts.google.com/gsi/client'
                script.async = true
                script.defer = true
                script.onload = resolve
                script.onerror = () => {
                    this.#googleScriptPromise = null
                    reject(new Error('Google Identity Services betöltése sikertelen.'))
                }
                document.head.appendChild(script)
            })
        }

        return this.#googleScriptPromise
    }

    async connectedCallback() {
        if (!this.#initialized) {
            this.attachShadow({ mode: 'open' })

            this.shadowRoot.innerHTML = `
<h1>Google JWT - API JWT teszt</h1>

<div id="user-view" class="view">
    <div class="user"></div>
</div>

<div id="login-view" class="view">
    <div class="login">
        <h2>Bejelentkezés</h2>
        <div id="google-login"></div>
        <p id="login-status" aria-live="polite"></p>
    </div>
</div>`
            this.shadowRoot.adoptedStyleSheets = [_css]

            await this.loadGoogleIdentityServices()
            google.accounts.id.initialize({
                client_id: _appSettings.google_client_id,
                callback: response => this.#handleCredentialResponse(response)
            })

            this.#initialized = true
        }

        this.#showView('login')

        try {
            const button = this.shadowRoot.querySelector('#google-login')
            google.accounts.id.renderButton(button, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                locale: 'hu',
                width: 280
            })
        }
        catch (error) {
            console.error(error)

            this.shadowRoot.querySelector('#login-status').textContent =
                'A Google bejelentkezés inicializálása sikertelen.'
        }
    }

    async #handleCredentialResponse(response) {
        if (!response.credential) {
            return
        }

        this.#googleIdToken = response.credential
        this.shadowRoot.querySelector('#login-status').textContent =
            'Google bejelentkezés sikeres. API-hitelesítésre vár.'

        const result = await fetch("https://localhost:44313/auth/login", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${response.credential}`
            }
        })

        if (!result.ok) {
            throw new Error("API login failed.");
        }

        const token = await result.json();

        const user = await fetch("https://localhost:44313/users/me", {
            headers: {
                'Authorization': 'Bearer ' + token.accessToken
            }
        }).then(resp => resp.json())

        this.shadowRoot.querySelector('#user-view>div').innerHTML =
`<img src="${user.picture}"><b>${user.familyName} ${user.givenName}</b>
<i>${user.email}</i>`
    }

    #showView(viewName) {
        this.shadowRoot.querySelectorAll('.view')
            .forEach(view => view.classList.remove('active'))

        this.shadowRoot
            .querySelector(`#${viewName}-view`)
            .classList.add('active')
    }
}

customElements.define('ga-app', GoogleAuthenticatorApp)