import { Tooltip } from "./js/tooltip";
import { LoadDataInfo } from "./js/LoadDataInfo";
import { DataQuery } from "./js/DataQuery";
import { Translator } from "./js/Translator.js";
import "./css/resource.css";
const delay = (t) => new Promise((r) => setTimeout(r, t)); //delay function
const isPromise = obj => obj instanceof Promise || (obj && typeof obj.then === 'function'); //isPromise function
const isValidGameMode = () => gameMode_ === "aram" || gameMode_ === "urf"; //isValidGameMode function
let playerManager = document.getElementById("lol-uikit-layer-manager-wrapper");

const LoadDataInfo_ = new LoadDataInfo();
const DataQuery_ = new DataQuery();
let Translator_ = null; //Translator Object
let userLanguage = null; //suerLangaue
const tooltips = []; //tooltips objects
let teamChatInfo = null; //teamChatInfo

let gameMode_ = ""; //gameMode

const version = "0.1.9-u9";

const getKDAGrade = (kda) => 
  kda >= 4.0 ? 'S' :
  kda >= 3.0 ? 'A' :
  kda >= 2.0 ? 'B' :
  kda >= 1.0 ? 'C' :
  'D';

/**
 * 
 * @param {string} server Language
 * @returns 
 */
async function updateInfo(server) {
  let info = null;
  const session = await fetch("/lol-champ-select/v1/session").then((r) => r.json()); //getChampSelectSession
  const mode = await fetch("/lol-gameflow/v1/session").then((r) => r.json()); //getGameflow
  gameMode_ = mode.map.gameMode.toLowerCase(); //setGameMode
  let team = session.myTeam;
  let count = 0;
  
  do {
    teamChatInfo = await DataQuery_.sendRequest("get","/lol-chat/v1/conversations");//wating for teamChatInfo
    await delay(200);
  } while (teamChatInfo.length<1);
  
  teamChatInfo = teamChatInfo.find(item => item.type === "championSelect"); //queryTeamChatInfos
  if (server!="zh-CN"&&mode.map.id == 11) {
    console.log("Ranked Game");
    do {
      info = await DataQuery_.sendRequest("get","//riotclient/chat/v5/participants/champ-select");
      await delay(500);
    } while (info.participants.length<5||!info);
  team = [];
  for (const [index, participant] of info.participants.entries()) {
    let summonerId = await DataQuery_.queryPlayerSummonerId(participant.name);
    team.push({
      summonerId : summonerId,
      puuid : participant.puuid
    })
   }
  }
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
    const [name, statusText, level, puuid] = await DataQuery_.queryPlayerInfo(item.summonerId);
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
  const action = {
    "body": "[TeamInsightX] Loaded!",
    "type": "celebration"
  };
  const msg = await DataQuery_.sendRequest("POST","/lol-chat/v1/conversations/"+ teamChatInfo.id +"/messages",action);
  return [summonerIds, puuids, names, levels, status, playerRanks, leaguePoints, playerRanks_Mode, divisionS];
}

function unmount() {
  console.log("unmount");
  tooltips.forEach((tool) => {
    tool.umount();
  });
  tooltips.length = 0;
  teamChatInfo = null;
}



/**
 *
 * @param {string} puuid
 * @param {number} begIndex
 * @param {number} endIndex
 * @param {object} tool
 * @returns
 */

async function add(puuid, begIndex, endIndex, tool) {
  const matchData = await DataQuery_.queryMatch(puuid, 0, 20);
  if (!matchData) {
    return -1; //queryMatchError
  }
  let k = 0,
    d = 0,
    a = 0;
    let win = 0;
    let loss = 0;
    console.log(matchData);
  for (let i = 0; i < matchData.items.length; i++) {
    const heroIcon = LoadDataInfo_.getChampionPath(matchData.championId[i]);
    const spell1Id = LoadDataInfo_.getSpellPath(matchData.spell1Id[i]);
    const spell2Id = LoadDataInfo_.getSpellPath(matchData.spell2Id[i]);
    const wins = matchData.winList[i];
    const kills = matchData.killList[i];
    const deaths = matchData.deathsList[i];
    const assist = matchData.assistsList[i];
    let items_id = matchData.items[i];
    const items_path = [];
    const minions = matchData.Minions[i];
    const glod = matchData.gold[i];
    const mode = matchData.gameMode[i];
    const win_t = Translator_.getWinText(wins);
    if (isPromise(items_id)) {
      return false;
    }
      items_id.forEach((data) => {
        items_path.push(LoadDataInfo_.getItemIconPath(data));
      });
    const str = await DataQuery_.queryGameMode(mode).catch(console.error);
    if (i>=begIndex&&i<endIndex) {
      if (matchData.types[i]=="CUSTOM_GAME") {
          endIndex++;
          continue;
      }
      tool.appendMatchRecord(heroIcon, spell1Id, spell2Id, wins, str?str:"Other", kills, deaths, assist, items_path, minions, glod, win_t,);
    }
    wins?win++:loss++;
    (k = k + kills), (d = d + deaths), (a = a + assist);
  }
  tool.setwinrate(win,loss);
  return (k + a) / d;
}

/**
 *
 * @param {string} summonerId
 * @param {string} puuid
 * @param {string} name
 * @param {number} level
 * @param {string} status
 * @param {string} Rank
 * @param {number} LP
 * @param {string} Mode
 * @param {string} divisionS
 * @param {Element} el
 * @returns obj
 */
async function mountDisplay(summonerId, puuid, name, level, status, Rank, LP, Mode, divisionS, el) {
  console.log(name, puuid);
  const [level_t, privacy_t, privacy_status] = Translator_.getTitleText(status);
  const [rank1_t, type1_t] = Translator_.getText(Rank[0], Mode[0]);
  const [rank2_t, type2_t] = Translator_.getText(Rank[1], Mode[1]);
  const match_t = Translator_.getMatchTitleText();
  const tooltip = new Tooltip(playerManager);
  tooltips.push(tooltip); //addtooltips
  tooltip.mount(
    el,
    "right",
    name,
    level_t +
    ":" +
    level +
    "\t" +
    privacy_t +
    ":" +
    privacy_status +
    "\n" +
    type1_t +
    ":" +
    rank1_t +
    "|" +
    divisionS[0] +
    "\t" +
    "LP:" +
    LP[0] +
    "\n" +
    type2_t +
    ":" +
    rank2_t +
    "|" +
    divisionS[1] +
    "\t" +
    "LP:" +
    LP[1] +
    "\nversion:" +
    version,
    match_t
  );
  let kda = await add(puuid, 0, 5, tooltip);
  while(!kda){
    await delay(200);
    kda = await add(puuid, 0, 5, tooltip);
  }
  const action = {
    "body": "[KDA - "+getKDAGrade(kda)+"] "+ name + "\t->\t"+kda.toFixed(2),
    "type": "celebration"
  };
  await DataQuery_.sendRequest("POST","/lol-chat/v1/conversations/"+ teamChatInfo.id +"/messages",action);

  tooltip.repositionElement(el, "right");
  tooltip.hide();
  return tooltip;
}

async function mount() {
  const [summonerId, puuid, name, level, status, Rank, LP, Mode, divisionS] = await updateInfo(userLanguage);
  
  
  let summoners;
  do {
    await delay(100);
    summoners = document.querySelector(".summoner-array.your-party");
  } while (!summoners);
  const team = summoners.querySelectorAll(".summoner-wrapper.visible.left");
  for (const [index, el] of team.entries()) {
   // player-name-wrapper ember-view
   // const LocalName = el.querySelector(".player-name__summoner").textContent;
    let lname = name[index];
   /* if (name[index] !== LocalName) {
      lname = name[index] + "(" + LocalName + ")";
    }*/
    let tooltip = await mountDisplay(
      summonerId[index],
      puuid[index],
      lname,
      level[index],
      status[index],
      Rank[index],
      LP[index],
      Mode[index],
      divisionS[index],
      el
    );
    el.addEventListener("mouseout", () => tooltip.hide());
    el.addEventListener(isValidGameMode() ? "contextmenu" : "mouseover", async() =>  {
      
      tooltip.show();
      tooltip.repositionElement(el, "right");
    });

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
  userLanguage = document.body.dataset["locale"];
  Translator_ = new Translator(userLanguage);
  let paly = document.querySelector(".play-button-content");
  setPlay(paly);
  LoadDataInfo_.initUi();

  console.log("TeamInsightX\t\t" + version + "\t\t" + userLanguage);
  console.log("Update Data\t->\t" + (await LoadDataInfo_.update()));
  const link = document.querySelector('link[rel="riot:plugins:websocket"]');
  const ws = new WebSocket(link.href, "wamp");

  const EP_GAMEFLOW = "OnJsonApiEvent/lol-gameflow/v1/gameflow-phase".replace(/\//g, "_");

  ws.onopen = () => {
    ws.send(JSON.stringify([5, EP_GAMEFLOW]));
  };

  ws.onmessage = (e) => {
    const [, endpoint, { data }] = JSON.parse(e.data);
    if (data === "ChampSelect") {
      mount();
    } else if (data === "None" || data === "Matchmaking" || data === "GameStart" || data == "EndOfGame") {
      unmount();
    }
  };
}

window.addEventListener("load", load);