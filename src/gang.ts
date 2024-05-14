// this is my my first file to bypass Formulas!
import { GangMemberAscension, GangMemberInfo, GangOtherInfo, GangTaskStats, NS } from "@ns";
import { Run } from "./run";
import { nodeInfo } from "./consts";
const names = [
    "Stabby Mc Stabbington",
    "Macbeth",
    "Sad Sandra",
    "A Random Bear",
    "Carl",
    "Man-Spider",
    "Bastard Man",
    "Bastard Man 2: Sharknado",
    "Halfway Bob",
    "Fullway Bob",
    "Stupid Steve",
    "John",
    "Helen Keller",
    "Just A Sleeve",
    "Some Torn Fabric",
    "Bastard Man 3: Alien Invasion",
    "The Enigmatic Elephant",
    "Lady Macbeth",
    "Clueless Craig",
    "Sir Howls-a-lot",
    "The Spy from Team Fortress 2",
]

export async function main(ns: NS) {
    const hasNode = async (num: number) => {
        const ownedFiles = [...((await Run(ns, "getResetInfo", [], "ownedSF")).keys())];
        const nowNode = await Run(ns, "getResetInfo", [], "currentNode");
        return ownedFiles.includes(num) || nowNode == num;
    }
    ns.tail();
    ns.disableLog("ALL");
    ns.clearLog();
    try {await hasNode(1)} catch {
        ns.tprint("You must have singularity access to run this script!");
        return;
    }
    if (!await hasNode(2)) {
        ns.tprint("You must have access to gangs to run this script!");
        return;
    }
    while (!await Run(ns, "gang.inGang")) {
        ns.clearLog();
        ns.print(`WAITING UNTIL WE ARE IN A GANG`);
        await ns.sleep(1)

    }
    ns.clearLog();
    let prev_state = Object.values(await Run(ns, "gang.getOtherGangInformation"));
    let next_tick;

    let members: string[] = await Run(ns, "gang.getMemberNames");
    for (const member of members) {
        let useNames = names.filter(name => !members.includes(name));
        ns.gang.renameMember(member, useNames[Math.floor(Math.random() * (useNames.length))]);
    }
    members = await Run(ns, "gang.getMemberNames");
    while (true) {
        ns.clearLog();

        const gangInfo = (await Run(ns, "gang.getGangInformation"));
        const now_state = Object.values(await Run(ns, "gang.getOtherGangInformation"));
        const newTick = JSON.stringify(now_state) != JSON.stringify(prev_state);
        const territory = await Run(ns, "gang.getGangInformation", [], "territory");

        if (newTick && !next_tick && territory < 1) {
            const bonus_time = await Run(ns, "gang.getBonusTime");
            let offset = 19000;
            if (bonus_time >= 0) offset = 700;
            next_tick = Date.now() + offset;
        }
        prev_state = now_state;



        ///////////////////////////////////////////////////////////////////////////////// RECRUIT /////////////////////////////////////////////////////////////////////////////////
        const gain_members = await Run(ns, "gang.getRecruitsAvailable");
        for (let c = 0; c < gain_members; c++) {
            let useNames = names.filter(name => !members.includes(name));
            await Run(ns, "gang.recruitMember", [useNames[Math.floor(Math.random() * (useNames.length))]]);
        }
        members = await Run(ns, "gang.getMemberNames");



        ///////////////////////////////////////////////////////////////////////////////// WORK ////////////////////////////////////////////////////////////////////////////////////
        const time_wait = await Run(ns, "gang.getBonusTime") >= 0 ? 100 : 500;
        if (territory < 1 && next_tick && Date.now() + time_wait >= next_tick) {
            for (const member of members) await Run(ns, "gang.setMemberTask", [member, "Territory Warfare"]);
            next_tick = undefined;
        } else {
            for (const member of members) {
                const crime = await bestCrime(await Run(ns, "gang.getMemberInformation", [member]), ns);
                await Run(ns, "gang.setMemberTask", [member, crime]);
            }
        }

        ///////////////////////////////////////////////////////////////////////////////// PRINT /////////////////////////////////////////////////////////////////////////////////
        let totalLength: number = 0;
        for (const name of members) {
            const info = await Run(ns, "gang.getMemberInformation", [name]);
            const linesLength = Math.max(": ".length + name.length + info.task.length, "STR:  DEF:  AGI:  DEX:".length + ns.formatNumber(info.str, 0).length + ns.formatNumber(info.def, 0).length + ns.formatNumber(info.agi, 0).length + ns.formatNumber(info.dex, 0).length);
            totalLength = (linesLength > totalLength ? linesLength : totalLength);
        }
        ns.printf(`\u001b[38;2;50;220;50m┌${"─".repeat(totalLength)}┐`);
        for (const name of members) {
            const info = await Run(ns, "gang.getMemberInformation", [name]);
            const agi = ns.formatNumber(info.agi, 0);
            const def = ns.formatNumber(info.def, 0);
            const dex = ns.formatNumber(info.dex, 0);
            const str = ns.formatNumber(info.str, 0);
            ns.printf(`\u001b[38;2;50;220;50m│${name}: ${info.task.toUpperCase()}${" ".repeat(totalLength - name.length - info.task.length - ": ".length)}│`);
            ns.printf(`\u001b[38;2;50;220;50m│STR:${str}  DEF:${def}  AGI:${agi}  DEX:${dex}${" ".repeat(totalLength - (str.length + def.length + agi.length + dex.length + "STR:  DEF:  AGI:  DEX:".length))}│`);
            if (members.indexOf(name) != members.length - 1) {
                ns.printf(`\u001b[38;2;50;220;50m├${"─".repeat(totalLength)}┤`);
            } else {
                ns.printf(`\u001b[38;2;50;220;50m└${"─".repeat(totalLength)}┘`);

            }
        }



        ///////////////////////////////////////////////////////////////////////////////// BUY /////////////////////////////////////////////////////////////////////////////////
        const reserve_money = 1000**3
        for (const member of members) {
            let equip = await bestItem(member, reserve_money, ns);
            while (equip != undefined) {
                await Run(ns, "gang.purchaseEquipment", [member, equip]);
                equip = await bestItem(member, reserve_money, ns);
                await ns.sleep(1);
            }
        }
        ns.printf(`PURCHASING:        ${(await Run(ns, "getPlayer")).money - reserve_money > 0 ? "YES" : "NO"}`);



        ///////////////////////////////////////////////////////////////////////////////// ASCEND /////////////////////////////////////////////////////////////////////////////////
        const respectToNextRecruit = gangInfo["respectForNextRecruit"] - gangInfo.respect;
        const respectPerCycle = gangInfo.respectGainRate;
        const cyclesToNextRecruit = respectToNextRecruit / respectPerCycle;
        const timePerCycle = 200;
        const timeToNextRecruit = cyclesToNextRecruit * timePerCycle;
        if (timeToNextRecruit > 1000 * 60 * 5) { // 1000 milliseconds per second, 60 seconds per minute, we check to see if we get it in 5 minutes
            for (const member of members) {
                await handleAscend(member, ns);
            }
        }
        ns.printf(`ASCENSION:         ${timeToNextRecruit > 1000 * 60 * 5 ? "YES" : "NO"}`);



        ///////////////////////////////////////////////////////////////////////////////// FIGHT /////////////////////////////////////////////////////////////////////////////////
        const otherGangInformation: GangOtherInfo[] = await Run(ns, "gang.getOtherGangInformation");
        const otherAliveGangs: string[] = [];
        for (const gangIndex in Object.keys(otherGangInformation)) {
            const gang = Object.keys(otherGangInformation)[gangIndex];
            const isNotOurs = gangInfo.faction != gang;
            const isNotDead = Object.values(otherGangInformation)[gangIndex] > 0;
            if (isNotDead && isNotOurs) {
                otherAliveGangs.push(gang);
            }
        }
        const otherGangsWinChances:number[] = [];
        for (const gang of otherAliveGangs) {
            otherGangsWinChances.push(await Run(ns, "gang.getChanceToWinClash", [gang]));
        }
        let averageWinChance = 0; otherGangsWinChances.forEach(chance => averageWinChance += chance / otherGangsWinChances.length);
        const averageFightThreshold = averageWinChance > 0.70;
        const minFightThreshold = Math.min(...otherGangsWinChances) > 0.50;
        const fightThreshold = averageFightThreshold && minFightThreshold;
        if (gangInfo.territory < 100) {
            if (fightThreshold) await Run(ns, "gang.setTerritoryWarfare", ["true"]);
            ns.print(`WIN COMBAT CHANCE: ${ns.formatPercent(averageWinChance, 2)}`);
        }
        await ns.sleep(1000);
    }
}
async function handleAscend(member: string, ns: NS): Promise<void> {
    async function calculateAscendTreshold(member: string, prop: string) { // this is magic and not mine
        const mult = await Run(ns, "gang.getMemberInformation", [member], prop);
        if (typeof mult !== "number") {
            return;
        }
        if (mult < 1.632) return 1.6326;
        if (mult < 2.336) return 1.4315;
        if (mult < 2.999) return 1.284;
        if (mult < 3.363) return 1.2125;
        if (mult < 4.253) return 1.1698;
        if (mult < 4.860) return 1.1428;
        if (mult < 5.455) return 1.1225;
        if (mult < 5.977) return 1.0957;
        if (mult < 6.496) return 1.0869;
        if (mult < 7.008) return 1.0789;
        if (mult < 7.519) return 1.073;
        if (mult < 8.025) return 1.0673;
        if (mult < 8.513) return 1.0631;
        if (mult < 20) return 1.0591;
        return 1.04;
    }


    const result = await Run(ns, "gang.getAscensionResult", [member]);
    if (!result) {
        return;
    }
    const skills = Object.keys(result) as Array<keyof GangMemberAscension>;
    for (let skill of skills) {
        if (skill == "respect") { // lmao i forgot that respect is in this
            continue;
        }
        if (!await Run(ns, "gang.getAscensionResult", [member])) {
            break;
        }
        const ascMulti = result![skill];
        const threshold = (await calculateAscendTreshold(member, skill + "_mult"))!;
        if (!ascMulti) continue;
        if (ascMulti > threshold) await Run(ns, "gang.ascendMember", [member]);
    }
}
async function bestCrime(member: GangMemberInfo, ns: NS): Promise<string> { 
    async function respectGain(task: GangTaskStats): Promise<number> {
        if (task.baseRespect === 0) return 0;
        let statWeight =
        (task.hackWeight / 100) * member["hack"] +
        (task.strWeight / 100) * member.str +
        (task.defWeight / 100) * member.def +
        (task.dexWeight / 100) * member.dex +
        (task.agiWeight / 100) * member.agi +
        (task.chaWeight / 100) * member.cha;
        statWeight -= 4 * task.difficulty;
        if (statWeight <= 0) return 0;
        const territoryMult = Math.max(0.005, Math.pow((await Run(ns, "gang.getGangInformation")).territory * 100, task.territory.respect) / 100);
        const territoryPenalty = (0.2 * (await Run(ns, "gang.getGangInformation")).territory + 0.8) * new nodeInfo(ns.getResetInfo().currentNode, ns.getResetInfo().ownedSF.get(ns.getResetInfo().currentNode)! + 1).GangSoftcap;
        if (isNaN(territoryMult) || territoryMult <= 0) return 0;
        const respectMult = (await Run(ns, "gang.getGangInformation")).respect / ((await Run(ns, "gang.getGangInformation")).respect + (await Run(ns, "gang.getGangInformation")).wantedLevel);
        return Math.pow(11 * task.baseRespect * statWeight * territoryMult * respectMult, territoryPenalty);
    }
    async function moneyGain(task: GangTaskStats): Promise<number> {
        if (task.baseMoney === 0) return 0;
        let statWeight =
            (task.hackWeight / 100) * member["hack"] +
            (task.strWeight / 100) * member.str +
            (task.defWeight / 100) * member.def +
            (task.dexWeight / 100) * member.dex +
            (task.agiWeight / 100) * member.agi +
            (task.chaWeight / 100) * member.cha;
        statWeight -= 3.2 * task.difficulty;
        if (statWeight <= 0) return 0;
        const territoryMult = Math.max(0.005, Math.pow((await Run(ns, "gang.getGangInformation")).territory * 100, task.territory.money) / 100);
        if (isNaN(territoryMult) || territoryMult <= 0) return 0;
        const respectMult = (await Run(ns, "gang.getGangInformation")).respect / ((await Run(ns, "gang.getGangInformation")).respect + (await Run(ns, "gang.getGangInformation")).wantedLevel);
        const territoryPenalty = (0.2 * (await Run(ns, "gang.getGangInformation")).territory + 0.8) * new nodeInfo(ns.getResetInfo().currentNode, ns.getResetInfo().ownedSF.get(ns.getResetInfo().currentNode)! + 1).GangSoftcap;
        return Math.pow(5 * task.baseMoney * statWeight * territoryMult * respectMult, territoryPenalty);
    }

    let values: number[] = [];
    const shouldRespect = await Run(ns, "gang.respectForNextRecruit") != Infinity; // it returns Infinity if we can't recruit more
    const tasks = (await Run(ns, "gang.getTaskNames"));
    const taskStats = [];
    for (const task of tasks) {
        taskStats.push(await Run(ns, "gang.getTaskStats", [task]));
    }
    for (const task of taskStats) {

        // formulas check because i can't be 100% accurate on the sauce, but the game is
        const respect = ns.fileExists("formulas.exe") ? ns.formulas.gang.respectGain((await Run(ns, "gang.getGangInformation")), member, task) : await respectGain(task);
        const money = ns.fileExists("formulas.exe") ? ns.formulas.gang.moneyGain((await Run(ns, "gang.getGangInformation")), member, task) : await moneyGain(task);
        values.push(shouldRespect ? respect : money);
    }
    // you do the optimal respect work before you do the optimal money work, hence the variable limits
    const memberAmount = await Run(ns, "gang.getMemberNames", [], "length");
    const totalStats = member.agi + member.str + 
                       member.def + member.dex;
    const statReqForWork = shouldRespect ? 83 * memberAmount : 100 * memberAmount;
    if (Math.max(...values) == 0 || totalStats <= statReqForWork) {
        return "Train Combat";
    }
    return tasks[values.indexOf(Math.max(...values))];
}

async function bestItem(member: string, reserve: number, ns: NS) {
    const money = (await Run(ns, "getPlayer")).money - reserve;
    const owned_items = (await Run(ns, "gang.getMemberInformation", [member])).augmentations.concat((await Run(ns, "gang.getMemberInformation", [member])).upgrades)
    async function costOf(equip: string): Promise<number> { return await Run(ns, "gang.getEquipmentCost", [equip]); }
    let unFilteredEquips = await Run(ns, "gang.getEquipmentNames"); let equips = [];
    for (const i in unFilteredEquips) {
        const cost = await costOf(unFilteredEquips[i]);
        if (cost > money || owned_items.includes(unFilteredEquips[i])) {
            continue;
        }
        equips.push(unFilteredEquips[i])
    }
    async function evaluate(equip: string): Promise<number> {
        const info = await Run(ns, "gang.getEquipmentStats", [equip]);
        let value = 0;
        if (info.agi)  value += info.agi  * 1;
        if (info.cha)  value += info.cha  * 0.8;
        if (info.def)  value += info.def  * 1;
        if (info.dex)  value += info.dex  * 1;
        if (info.str)  value += info.str  * 1;
        if ((await Run(ns, "gang.getGangInformation")).isHacking && info["hack"]) value += info["hack"] * 0.2; // we only care for hacking if we're a hacking gang

        if ((await Run(ns, "gang.getMemberInformation", [member])).augmentations.includes(equip)) value *= 2; // give augs 2x the value cause they persist
        return value;
    }
    let best_equip = equips[0];
    for (const equip of equips) {
        if (await evaluate(equip) > await evaluate(best_equip) && await evaluate(equip) != 0) best_equip = equip;
    }
    return best_equip;
}