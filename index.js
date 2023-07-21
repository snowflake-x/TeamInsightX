import { Tooltip } from "./js/tooltip";
import { LoadDataInfo } from "./js/LoadDataInfo";
import { DataQuery } from "./js/DataQuery";
import { Translator } from "./js/Translator.js";
import "./css/resource.css";
const delay = (t) => new Promise((r) => setTimeout(r, t));
let playerManager = document.getElementById("lol-uikit-layer-manager-wrapper");

let tooltip_ = null;
const LoadDataInfo_ = new LoadDataInfo();
const DataQuery_ = new DataQuery();
let Translator_ = null;

const tooltips = [];

const version = "0.0.2";

async function updateInfo() {
  const fetchResult = await fetch("/lol-champ-select/v1/session");
  const session = await fetchResult.json();
  const team = session.myTeam;
  const summonerIds = [];
  const puuids = [];
  const names = [];
  const levels = [];
  const status = [];
  const playerRanks = [];
  const leaguePoints = [];
  const playerRanks_Mode = [];
  const divisionS = [];
  for (const item of team) {
    if (item.summonerId == 0) {
      continue;
    }
    const [name, statusText, level, puuid] = await DataQuery_.queryPlayerInfo(
      item.summonerId
    );
    console.log(name + "-玩家uuid->" + puuid);
    const [LP, Rank, Type, division] = await DataQuery_.queryRank(puuid);
    summonerIds.push(item.summonerId);
    puuids.push(puuid);
    names.push(name);
    levels.push(level);
    status.push(statusText);
    playerRanks.push(Rank);
    leaguePoints.push(LP);
    playerRanks_Mode.push(Type);
    divisionS.push(division);
  }
  return [
    summonerIds,
    puuids,
    names,
    levels,
    status,
    playerRanks,
    leaguePoints,
    playerRanks_Mode,
    divisionS,
  ];
}

function unmount() {
  tooltips.forEach((tool) => {
    tool.umount();
  });
  tooltips.length = 0;
}

async function add(puuid, begIndex, endIndex, tool) {
  const matchData = await DataQuery_.queryMatch(puuid, begIndex, endIndex);
  let k = 0,
    d = 0,
    a = 0;
  for (let i = 0; i <= endIndex; i++) {
    const heroIcon = LoadDataInfo_.getChampionPath(matchData.championId[i]);
    const spell1Id = LoadDataInfo_.getSpellPath(matchData.spell1Id[i]);
    const spell2Id = LoadDataInfo_.getSpellPath(matchData.spell2Id[i]);
    const wins = matchData.winList[i];
    const kills = matchData.killList[i];
    const deaths = matchData.deathsList[i];
    const assist = matchData.assistsList[i];
    const items_id = matchData.items[i];
    const items_path = [];
    const minions = matchData.Minions[i];
    const glod = matchData.gold[i];
    const mode = matchData.gameMode[i];
    const win_t = Translator_.getWinText(wins);
    items_id.forEach((data) => {
      items_path.push(LoadDataInfo_.getItemIconPath(data));
    });

    let str = "";
    await DataQuery_.queryGameMode(mode)
      .then((result) => {
        str = result;
      })
      .catch((error) => {
        console.error(error);
      });
    tool.appendMatchRecord(
      heroIcon,
      spell1Id,
      spell2Id,
      wins,
      str,
      kills,
      deaths,
      assist,
      items_path,
      minions,
      glod,
      win_t
    );
    (k = k + kills), (d = d + deaths), (a = a + assist);
  }
  return (k + a) / d;
}

async function mount() {
  const [summonerId, puuid, name, level, status, Rank, LP, Mode, divisionS] =
    await updateInfo();
  let party;
  do {
    await delay(100);
    party = document.querySelector(".summoner-array.your-party");
  } while (!party);
  
  const summoners = party.querySelectorAll(".summoner-container-wrapper");
  for (const [index, el] of summoners.entries()) {
    if (puuid[index]) {
      const [level_t,privacy_t,privacy_status] = Translator_.getTitleText(status[index]);
      const [rank1_t,type1_t] = Translator_.getText(Rank[index][0],Mode[index][0]);
      const [rank2_t,type2_t] = Translator_.getText(Rank[index][1],Mode[index][1]);
      const match_t = Translator_.getMatchTitleText();
      const tooltip = new Tooltip(playerManager);
      tooltips.push(tooltip);

      tooltip.mount(
        el,
        "right",
        name[index],
        level_t +":" + level[index] + "\t"+ privacy_t +":" + privacy_status+"\n" +
        type1_t +
          ":" +
          rank1_t + "|"+
          divisionS[index][0] +
          "\t" +
          "LP:" +
          LP[index][0] +
          "\n" +
          type2_t +
          ":" +
          rank2_t +"|"+
          divisionS[index][1] +
          "\t" +
          "LP:" +
          LP[index][1] +
          "\nversion:" +
          version,
          match_t
      );
      const kda = await add(puuid[index], 0, 4, tooltip);
    //  tooltip.setKdaColor(el, kda);
      tooltip.repositionElement(el, "right");
      tooltip.hide();
      el.addEventListener("mouseout", () => tooltip.hide());
      el.addEventListener("mouseover", () => {
        tooltip.show();
      });
    }
  }
}

function setPlay(el) {
  const span = el.querySelector("span");
  el.addEventListener("mouseout", () => {
    span.textContent = "PLAY";
  });
  el.addEventListener("mouseover", () => {
    span.textContent = "Insight";
  });
}

async function load() {
  do {
    await delay(100);
    playerManager = document.getElementById("lol-uikit-layer-manager-wrapper");
  } while (!playerManager);
  const userLanguage = document.body.dataset['locale'];
  Translator_ = new Translator(userLanguage);
  let paly = document.querySelector(".play-button-content");
  setPlay(paly);
  LoadDataInfo_.initUi();
  console.log("TeamInsightX加载成功\t\t"+version);
  console.log("LCU地址\t->\t" + window.location.href);
  console.log("更新数据\t->\t" + (await LoadDataInfo_.update()));
  const link = document.querySelector('link[rel="riot:plugins:websocket"]');
  const ws = new WebSocket(link.href, "wamp");

  const EP_GAMEFLOW = "OnJsonApiEvent/lol-gameflow/v1/gameflow-phase".replace(
    /\//g,
    "_"
  );

  ws.onopen = () => {
    ws.send(JSON.stringify([5, EP_GAMEFLOW]));
  };

  ws.onmessage = (e) => {
    const [, endpoint, { data }] = JSON.parse(e.data);
    if (data === "ChampSelect") {
      mount();
    } else if (data === "None" || data === "Matchmaking" || data === "GameStart") {
      unmount();
    }
    console.log(endpoint);
    console.log(data);
  };
}

window.addEventListener("load", load);
