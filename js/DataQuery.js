export class DataQuery {
    constructor() { }

/**
 * 
 * @param {string} name 
 * @returns summonerId
 */
    async queryPlayerSummonerId(name) {
        const result = await fetch('/lol-summoner/v1/summoners?name='+name).then((res) => res.json());
        return result.summonerId;
    }
    async queryPlayerInfo(summonerId) {
        const result = await fetch('/lol-summoner/v1/summoners/' + summonerId.toString()).then(
            (res) => res.json()
        );
        const name = result.displayName;
        const status = result.privacy;
        const level = result.summonerLevel;
        const puuid = result.puuid;
        return [name, status, level, puuid];
    }

    /**
     * 
     * @param {string} method  方法
     * @param {string} endpoint   地址
     * @param {*} action 请求体
     * @returns 
     */
    async sendRequest(method, endpoint, action) {
        const initialize = {
          method: method,
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
          },
          ...(action ? { data: action } : undefined)
        };
      
        const request = await fetch(endpoint, initialize);
        const response = await request.json();
      
        return response;
      }

    async queryRank(puuid) {
        const result = await fetch('/lol-ranked/v1/ranked-stats/' + puuid.toString()).then((res) =>
            res.json()
        );
        const queue = result.queues;

        const LP = [];
        const Rank = [];
        const Type = [];
        const divisionS = [];
        for (let index = 0; index < 3; index++) {
            LP.push(queue[index].leaguePoints);
            Rank.push(queue[index].tier);
            Type.push(queue[index].queueType);
            divisionS.push(queue[index].division);
        }
        return [LP, Rank, Type, divisionS];
    }

    

    /**
     * 
     * @param {number} id 
     * @returns string 模式
     */
    async queryGameMode(id) {
        const result = await fetch('/lol-game-queues/v1/queues/' + id.toString()).then((res) => res.json());
        return result.name;
    }


    async queryMatch(puuid, begIndex, endIndex) {
        if (typeof begIndex !== 'number' || isNaN(begIndex)) {
            begIndex = 0;
        }
        if (typeof endIndex !== 'number' || isNaN(endIndex)) {
            endIndex = 0;
        }
        const result = await fetch(
            '/lol-match-history/v1/products/lol/' +
            puuid.toString() +
            '/matches?begIndex=' +
            begIndex.toString() +
            '&endIndex=' +
            endIndex.toString()
        ).then((res) => res.json());
        const matchList = await result.games;
        const gameMode = [];
        const championIds = [];
        const killList = [];
        const deathsList = [];
        const assistsList = [];
        const Minions = [];
        const gold = [];
        const winList = [];
        const causedEarlySurrenderList = [];
        const laneList = [];
        const spell1Id = [];
        const spell2Id = [];
        const items = [];
        const MList = Object.values(matchList);
        for (let item of MList[5]) {
            gameMode.push(item.queueId);
            championIds.push(item.participants[0].championId);
            killList.push(item.participants[0].stats.kills);
            deathsList.push(item.participants[0].stats.deaths);
            assistsList.push(item.participants[0].stats.assists);
            Minions.push(item.participants[0].stats.neutralMinionsKilled + item.participants[0].stats.totalMinionsKilled);
            gold.push(item.participants[0].stats.goldEarned);
            winList.push(item.participants[0].stats.win);
            causedEarlySurrenderList.push(item.participants[0].stats.causedEarlySurrender);
            laneList.push(item.participants[0].timeline.lane);
            spell1Id.push(item.participants[0].spell1Id);
            spell2Id.push(item.participants[0].spell2Id);
            const tmp_items = [];
            for (let i = 0; i < 7; i++) {
                //数据中的装备是以 1 2 3 4 5
                const itemKey = 'item' + i;
                const itemValue = item.participants[0].stats[itemKey];
                tmp_items.push(itemValue);
            }
            items.push(tmp_items);
        };

        return {
            gameMode: gameMode,
            championId: championIds,
            killList: killList,
            deathsList: deathsList,
            assistsList: assistsList,
            Minions: Minions,
            gold: gold,
            winList: winList,
            causedEarlySurrenderList: causedEarlySurrenderList,
            laneList: laneList,
            spell1Id: spell1Id,
            spell2Id: spell2Id,
            items: items
        };




    }
}
