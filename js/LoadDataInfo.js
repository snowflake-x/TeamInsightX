export class LoadDataInfo {
  constructor() {
    this._icon_info = null;
    this._champion_info = null;
    this._spell_info = null;
  }

  initUi() {
    const glod =
      ".user-gold:after { background: url(/fe/lol-match-history/icon_gold.png) no-repeat 0 0; }";
    const minion =
      ".user-minions:after { background: url(/fe/lol-match-history/icon_minions.png) no-repeat 0 0; }";
    const head = document.head || document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    style.appendChild(document.createTextNode(glod));
    style.appendChild(document.createTextNode(minion));
    head.appendChild(style);
  }
  async update() {
    try {
      const [iconInfo, championInfo, spellInfo] = await Promise.all([
        this.GetInfo("items.json"),
        this.GetInfo("champion-summary.json"),
        this.GetInfo("summoner-spells.json"),
      ]);
      this._icon_info = iconInfo;
      this._champion_info = championInfo;
      this._spell_info = spellInfo;
      console.log("所有数据加载完成");
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  async GetInfo(str) {
    console.log("载入" + str);
    const result = await fetch("/lol-game-data/assets/v1/" + str.toString());
    const result_json = await result.json();
    return result_json;
  }

  getItemIconPath(id) {
    const iconInfo = this._icon_info;
    const item = iconInfo.find((item) => item.id === id);
    return item ? String(item.iconPath) : "";
  }

  getChampionPath(id) {
    const championInfo = this._champion_info;
    const item = championInfo.find((item) => item.id === id);
    return item ? String(item.squarePortraitPath) : "";
  }

  getSpellPath(id) {
    const spellInfo = this._spell_info;
    const item = spellInfo.find((item) => item.id === id);
    return item ? String(item.iconPath) : "";
  }
}
