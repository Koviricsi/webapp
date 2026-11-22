import _appSettings from './appsettings.json' with { type: 'json' }
import WebApp from '../../JsLib/components/web-app.js'
import UserCard from '../../JsLib/components/user-card/user-card.js'
import MessageBox from '../../JsLib/components/message-box/message-box.js'

class GoogleAuthenticatorApp extends WebApp {

    #loginContainer = null
    #userCard = null
    #views = new Map()

    constructor() {
        super({
            apiUrl: _appSettings['api-url'],
            authUrl: _appSettings['auth-url'],
            css: _appSettings.css,
            template: _appSettings.template
        })
    }

    initializeDom() {
        super.initializeDom()
        this.addView('login', '.login-view')
        this.addView('user', '.user-view')
        this.#loginContainer = this.shadowRoot.querySelector('.login-container')
        this.#userCard = this.shadowRoot.querySelector('user-card')
        this.getView('user').querySelector('button').addEventListener('click', () => this.logout())
        MessageBox.setCssProperties({
            'font-size': '2rem',
            'bg-colorLight': '#fecc',
            'bg-colorDark': '#8768',
            'transparency': 0.2
        })
        MessageBox.setOverlayColor('#210c')
    }

    authRequiredHandler(event) {
        this.showView('login')
        event.detail.resolve({
            // autentikáció típusa
            type: 'google',
            // a bejelentkező felületet tartalmazó elem
            container: this.#loginContainer,
            // a google autentikációhoz kell a kliens id
            clientId: _appSettings['google_client_id']
        })
    }

    authCompletedHandler(event) {
        this.showView('login', false)
        if (event.detail.success) {
            MessageBox.showModal('Sikeres bejelentkezés')
        }
        if (event.detail.error) {
            
        }
    }

    async logout() {
        this.apiClient.logout()
        MessageBox.showModal('Sikeres kijelentkezés')
        this.showView('user', false)
    }
    
    async main() {
        try {
            const userData = await this.apiClient.get('users/me')
            this.#userCard.user = userData
            this.showView('user')
        } catch (error) {
            MessageBox.showModal(error.message, 'Hiba')
        }
    }
}

customElements.define('ga-app', GoogleAuthenticatorApp)