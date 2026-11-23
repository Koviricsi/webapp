import WebApp from '../../../JsLib/components/web-app.js'
import appSettings from './appsettings.json' with { type: 'json' }
// import UserCard from '../../components/user-card/user-card.js'
import MessageBox from '../../../JsLib/components/message-box/message-box.js'
import AdventCard from './advent-card/advent-card.js'

class AdventApp extends WebApp {

    #cards
    #contentContainer

    constructor() {
        super(appSettings)
    }

    async connectedCallback() {
        await super.connectedCallback()

        try {
            // load components
            // - user-card
            // - question-card
            // - advent-calendar


            // const user = await this.apiClient.get('/users/me')
            // this.views.login.style.display = 'none'
            // this.views.content.style.display = ''
            // console.log('Bejelentkezett felhasználó:', user)
            // this.views['user-card'].user = user
        
        } catch (error) {
            this.views.login.style.display = 'none'
            this.views.content.style.display = 'none'
            await MessageBox.showModal(error.message, 'Hiba', 'Ok')
        }
    }

    initializeDom() {
        super.initializeDom()
        this.#contentContainer = this.shadowRoot.querySelector('.content-view');
        this.loadCards().then(() => this.createCards());
        // this.views['user-card'] = this.shadowRoot.querySelector('user-card')
        // this.shadowRoot.querySelector('section.content-view>button')
        //     .addEventListener('click', () => this.logout())
    }

//#region Advent Cards
    async loadCards(){
        const cards = await fetch('cards.json').then(resp => {
            if (!resp.ok)
                throw new Error('Nem sikerült betölteni a kártyákat');
            return resp;
        }).then(resp => resp.json());
        this.#cards = cards;
        console.log(cards);
    }

    createCards(){
        this.#cards.map(data => {
            const card = new AdventCard(data);
            this.#contentContainer.appendChild(card);
        })
    }
//#endregion
}

customElements.define('advent-app', AdventApp)