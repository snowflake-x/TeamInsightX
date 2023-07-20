import translate from '../assets/translate.json';
export class Translator{
    /**
     * Initialize language settings
     * @param {string} locale 
     */
    constructor(locale){
        this.data = translate.translations;
        this.LangIndex = this.data.findIndex(item => item._locales.includes(locale))||0;
    }

    getTitleText(status){
        const levelText = this.data[this.LangIndex].display[0];
        const privacy_t = this.data[this.LangIndex].display[1].privacy["text"];
        const privacyText = this.data[this.LangIndex].display[1].privacy[status];
        return[levelText,privacy_t,privacyText]
    }

    getText(rank,type){
        const rankText = this.data[this.LangIndex].ranks[rank];
        const typeText = this.data[this.LangIndex].queueTypes[type];
        return [rankText,typeText];
    }
    getWinText(win){
        const Win_t = this.data[this.LangIndex].display[1].winLoss[win] 
        return Win_t;
    }
    getMatchTitleText(){
        const match_t = this.data[this.LangIndex].display[2];
        return match_t;
    }
}