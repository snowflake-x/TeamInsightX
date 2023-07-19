export class DataQuery {
    constructor() { }

    async queryPlayerInfo(summonerId) {
        const result = await fetch('/lol-summoner/v1/summoners/' + summonerId.toString()).then(
            (res) => res.json()
        );
        const name = result.displayName;
        const status = result.privacy;
        const level = result.summonerLevel;
        const puuid = result.puuid;
        return [name, status == 'PUBLIC' ? '开放' : '隐藏', level, puuid];
    }

    async queryRank(puuid) {
        const Ranks = {
            CHALLENGER: '最强王者',
            GRANDMASTER: '傲世宗师',
            MASTER: '超凡大师',
            DIAMOND: '璀璨钻石',
            PLATINUM: '华贵铂金',
            GOLD: '荣耀黄金',
            SILVER: '不屈白银',
            BRONZE: '英勇黄铜',
            IRON: '坚韧黑铁',
            '': '无段位'
        };
        const QueueTypes = {
            RANKED_SOLO_5x5: '单/双排位',
            RANKED_FLEX_SR: '灵活组排',
            RANKED_TFT: '云顶之弈排位赛'
        };
        const result = await fetch('/lol-ranked/v1/ranked-stats/' + puuid.toString()).then((res) =>
            res.json()
        );
        const queue = result.queues;

        const LP = [];
        const Rank = [];
        const Type = [];
        const divisionS = [];
        for (let index = 0; index < Object.keys(QueueTypes).length; index++) {
            LP.push(queue[index].leaguePoints);
            Rank.push(Ranks[queue[index].tier]);
            Type.push([QueueTypes[queue[index].queueType]]);
            divisionS.push(queue[index].division);
        }
        return [LP, Rank, Type, divisionS];
    }


    async queryGameMode(id) {
        const result = await fetch('/lol-game-queues/v1/queues/' + id.toString()).then((res) => res.json());
        if (result.isRanked) {
            return result.name.substring(4);
        } else {
            return result.name;
        }

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
        MList[5].forEach((item) => {
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
                const itemKey = 'item' + i;
                const itemValue = item.participants[0].stats[itemKey];
                tmp_items.push(itemValue);
            }
            items.push(tmp_items);
        });

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
