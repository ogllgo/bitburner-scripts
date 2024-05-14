import { NS, SourceFileLvl } from "@ns";
import { getBackdoor, Server } from "./defs";
import { Run } from "./run";
import { nodeInfo } from "./consts";
const hasNode = async (ns: NS, num: number): Promise<boolean> => {
    const files: SourceFileLvl[] = await Run(ns, "singularity.getOwnedSourceFiles");
    return files.map(data => data.n).includes(num) || ns.getResetInfo().currentNode == num;
}
export async function main(ns: NS) {
    if (!hasNode(ns, 2)) {
        ns.tprint("This needs access to the Singularity API.");
        ns.exit();
    }
    ns.tail();
    ns.disableLog('ALL');
    let moneyReserve: number = 1000**2;
    let augs: string[] = [];
    let countdown: number | undefined;
    let reqAugs: number = 15;
    while (true) {
        const gangAvailable = await hasNode(ns, 2);
        if (gangAvailable) {
            if (ns.heart.break() <= -54000) {
                if (!ns.scriptRunning('gang.js', ns.getHostname())) await Run(ns, "run", ["gang.js"]);
            }
        }
        purchasePrograms(ns, moneyReserve);
        if (ns.singularity.exportGameBonus()) {
            ns.singularity.exportGame();
        }
        if (!Number.isNaN(Number(ns.readPort(1)))) {
            moneyReserve = ns.readPort(1);
        }
        let ports = 0;
        let openers = [
            "brutessh.exe",
            "ftpcrack.exe",
            "relaysmtp.exe",
            "httpworm.exe",
            "sqlinject.exe"
        ];
        openers.forEach((opener) => { if (ns.fileExists(opener)) ports++})
        await ns.asleep(25);
        if (ports >= 3) {
            if (!ns.isRunning("hacking/pserv_man.js")) ns.run("hacking/pserv_man.js");
        }
        if (ports <= 5 || !ns.fileExists("formulas.exe")) {
            purchasePrograms(ns, moneyReserve, ["deepscanv1.exe", "deepscanv2.exe", "serverprofiler.exe", "autolink.exe"]);
        } else if (ns.fileExists("formulas.exe")) {
            purchasePrograms(ns, moneyReserve);
        }
        const allOwnedAugs = await Run(ns, "singularity.getOwnedAugmentations", ["true"]);
        const allInstalledAugs = (await Run(ns, "singularity.getOwnedAugmentations"));
        const newAugs = (await planAugs(ns, moneyReserve, allOwnedAugs)); 

        // JSON.stringify so that, if we're choosing between NFG and QLink, we choose it
        // aug length check so that we dont replace 200 levels of NFG with QLink
        if (JSON.stringify(newAugs) !== JSON.stringify(augs) && newAugs.length >= augs.length) augs = newAugs;
        const augCount = augs.length + allOwnedAugs.length - allInstalledAugs.length;
        if (augCount > reqAugs) {
            countdown = Date.now() + 300000;
            reqAugs = augCount + 1;
        }
        if (countdown) ns.toast(`We plan to install ${augs.length} augs in ${ns.tFormat(countdown - Date.now())}`, "info");
        if (countdown && countdown - Date.now() <= 0) {
            for (const aug of augs) {
                const factions: string[] = await Run(ns, "singularity.getAugmentationFactions", [aug]);
                for (const faction of factions) {
                    const rep = await Run(ns, "singularity.getFactionRep", [faction]);
                    const repReq = await Run(ns, "singularity.getAugmentationRepReq", [aug]);
                    if (repReq >= rep) factions.splice(factions.indexOf(faction))
                }
                if (gangAvailable && await Run(ns, "gang.inGang")) {
                    const gangName = await Run(ns, "gang.getGangInformation", [], "faction");
                    const gangAugs = await Run(ns, "singularity.getAugmentationsFromFaction", [gangName]);
                    if (gangAugs.includes(aug)) factions.push(gangName);
                }
                ns.tprint(factions)
                if (factions[0] && aug) await Run(ns, "singularity.purchaseAugmentation", [factions[0], aug]);
            }
            await Run(ns, "singularity.installAugmentations", ["game_man.js"]);
        }


        ns.clearLog();
        ns.print(`Planned augs: ${augs.length > 0 ? augs : "none"}`);
        ns.print(`Planned augs length: ${augs.length}`);
        if (!await hasNode(ns, 10)) await manageActionNoSleeves(ns);
        await ns.sleep(1000);
    }
}

async function manageActionNoSleeves(ns: NS): Promise<void> {

    const gangAvailable  = await hasNode(ns, 2);  // node 2:  unlocks gangs
    const bladeAvailable = await hasNode(ns, 7);  // node 7:  unlocks the bb api
    const giftAvailable  = await hasNode(ns, 13); // node 13: unlocks Stanek's Gift
    let stage;
    const hackFactions = [
        "CyberSec", "NiteSec",
        "BitRunners", "The Black Hand",
        "Daedalus"
    ];
    const rawFactions = [
        /* misc */ "Tian Di Hui", "Netburners", 
        /* cities */ "Sector-12", "Chongqing", "New Tokyo", "Ishima", "Volhaven", "Aevum",
        /* secret organizations */ "The Covenant", "Illuminati", "Daedalus",
        /* criminal organizations */ "Slum Snakes", "Tetrads", "Silhouette", "Speakers for the Dead", "The Dark Army", "The Syndicate",
        /* megacorporations */ "ECorp", "MegaCorp", "KuaiGong International", "Four Sigma", "NWO", "Blade Industries", "OmniTek Incorporated", "Bachman & Associates", "Clarke Incorporated", "Fulcrum Secret Technologies",
    ];
    const allJoinFactions = rawFactions.filter((fact) => {
        !ns.getPlayer().factions.includes(fact)
    });
    const allOwnedAugs = await Run(ns, "singularity.getOwnedAugmentations", ["true"]);
    const allAugFactions: string[] = [];
    for (const fact of rawFactions) {
        const augs: string[] = await Run(ns, "singularity.getAugmentationsFromFaction", [fact])
        if (augs.filter(aug => !allOwnedAugs.includes(aug) && aug != "Neuroflux Governor").length == 0) allAugFactions.push(fact)
    }
    let hackAugs: string[] = [];
    for (const faction of hackFactions) {
        const ownedAugs = await Run(ns, "singularity.getOwnedAugmentations", ["true"]);
        const factionAugs: string[] = await Run(ns, "singularity.getAugmentationsFromFaction", [faction]);
        const unownedAugs = factionAugs.filter(aug => !ownedAugs.includes(aug));
        hackAugs.push(...unownedAugs);
    }
    const withHackAugs = hackAugs.length == 0;
    const stages = {
        gettingGift:0,
        gang:1,
        Simulacrum:2,
        hackFactions:3,
        allFactionsGetting:4,
        allFactionsMaxxing:5,
    }
    const installedAugs = (await Run(ns, "singularity.getOwnedAugmentations"));
    if (giftAvailable && !allOwnedAugs.includes("Stanek's Gift")) stage = stages.gettingGift;
    if (gangAvailable && !ns.gang.inGang() && !stage) stage = stages.gang;
    if (bladeAvailable && !installedAugs.includes("The Blade's Simulacrum") && !stage) stage = stages.Simulacrum;
    if (hackAugs.length != 0 && withHackAugs && !stage) stage = stages.hackFactions;
    if (!stage && allJoinFactions.length > 0) stage = stages.allFactionsGetting;
    if (!stage && allAugFactions.length > 0) stage = stages.allFactionsMaxxing;
    switch (stage) {
        case stages.gettingGift:
            if (!ns.stanek.acceptGift()) {
                const work = ns.singularity.getCurrentWork();
                if (!work || work.type != "CRIME" || work.crimeType != "Mug") await Run(ns, "singularity.commitCrime", ["Mug", "true"]);
            }
        break;

        case stages.gang:
            const work = ns.singularity.getCurrentWork();
            if (!work || work.type != "CRIME" || work.crimeType != "Homicide") { await Run(ns, "singularity.commitCrime", ["Homicide", "true"]); return; }
            const kma = ns.heart.break();
            const kmaPerSecond = 3 * await Run(ns, "singularity.getCrimeChance", ["Homicide"]);
            const timeToFinish = (54000-Math.abs(kma)) * (1 / kmaPerSecond * 3000);
            const facts = await Run(ns, "getPlayer", [], "factions");
            if (kma <= -54000 && facts.includes("Slum Snakes")) {
                await Run(ns, "gang.createGang", ["Slum Snakes"]);
            } else if ((await Run(ns, "singularity.checkFactionInvitations")).includes("Slum Snakes")) {
                await Run(ns, "singularity.joinFaction", ["Slum Snakes"]);
            }

            ns.print(`KMA:  ${ns.formatNumber(kma, 1)} KMA LEFT: ${ns.formatNumber(54000 - Math.abs(kma), 1)}, KM/S: ${ns.formatNumber(kmaPerSecond)} \nDONE: ${ns.tFormat(timeToFinish)}`);
        break;

        case stages.Simulacrum:
            const skills = {
                agi:ns.getPlayer().skills.agility,
                str:ns.getPlayer().skills.strength,
                def:ns.getPlayer().skills.defense,
                dex:ns.getPlayer().skills.dexterity
            };
            if (Math.min(...Object.values(skills)) < 100) {
                train(ns, 1000000, true);
            } else if (!ns.bladeburner.inBladeburner()) ns.bladeburner.joinBladeburnerDivision(); // get into BB
            // TBF
        break;

        case stages.hackFactions:
            for (const fact of hackFactions) {
                if (ns.singularity.joinFaction(fact)) ns.toast(`Joined ${fact}`, "success");
            }
            const useHackFactions = [];
            for (const fact of hackFactions) {
                const allAugs: string[] = await Run(ns, "singularity.getAugmentationsFromFaction", [fact]);
                const augs: string[] = allAugs.filter(aug => aug == "NeuroFlux Governor" || !allOwnedAugs.includes(aug));
                if (augs.length == 0) useHackFactions.push(fact);
            }
            const wantedHackFaction = useHackFactions[0];
            ns.singularity.workForFaction(wantedHackFaction, "hacking");
        break;

        case stages.allFactionsGetting:
            // TBF
        break;

        case stages.allFactionsMaxxing:
            for (const fact of allJoinFactions) {
                if (ns.singularity.joinFaction(fact)) {
                    ns.toast(`Joined ${fact}`, "success");
                }
            }
            const useFactions = [];
            for (const fact of hackFactions) {
                const allAugs: string[] = await Run(ns, "singularity.getAugmentationsFromFaction", [fact]);
                const augs: string[] = allAugs.filter(aug => !allOwnedAugs.includes(aug) && aug != "NeuroFlux Governor");
                if (augs.length == 0) useFactions.push(fact);
            }
            const wantedFaction = useFactions[0];
            ns.singularity.workForFaction(wantedFaction, "hacking");
            if (hackFactions.includes(wantedFaction)) {
                ns.singularity.workForFaction(wantedFaction, "hacking");
            } else {
                ns.singularity.workForFaction(wantedFaction, "field");
            }
        break;
    }
}
async function planAugs(ns: NS, reserve: number = 1000**2, ignore: String[]): Promise<string[]> {
    const sing = ns.singularity;
    let money = ns.getPlayer().money - reserve;
    let augs: string[] = [];
    for (const faction of ns.getPlayer().factions) {
        const factionAugs = sing.getAugmentationsFromFaction(faction).filter(aug => !ignore.includes(aug));
        const rep = sing.getFactionRep(faction);
        for (const aug of factionAugs.filter(aug => rep >= sing.getAugmentationRepReq(aug))) {
            if (!augs.includes(aug)) augs.push(aug);
        }
    }
    let planned_augs: string[] = sing.getOwnedAugmentations(true).filter(aug => !sing.getOwnedAugmentations().includes(aug));
    let availableAugs: string[] = [];
    let nfgLevel = [...ns.getResetInfo().ownedAugs.values()][[...ns.getResetInfo().ownedAugs.keys()].indexOf("NeuroFlux Governor")];
    for (const aug of augs) {const cost = 1.9**planned_augs.length * sing.getAugmentationBasePrice(aug);
        const ownedAugs = sing.getOwnedAugmentations(true).concat(planned_augs).concat(availableAugs);
        const shouldIgnore = (ownedAugs.includes(aug) && aug != "NeuroFlux Governor") || ignore.includes(aug) || availableAugs.includes(aug);
        let nfgRepCost;
        if (aug === "NeuroFlux Governor") {
            nfgRepCost = 500 * Math.pow(1.14, nfgLevel) * new nodeInfo(await Run(ns, "getResetInfo", [], "currentNode")).AugmentationRepCost;
        }
        let bestNFGFaction;
        for (const fact of await Run(ns, "singularity.getAugmentationFactions", ["NeuroFlux Governor"])) {
            if (bestNFGFaction || await Run(ns, "singularity.getFactionRep", [fact]) > await Run(ns, "singularity.getFactionRep", [fact])) bestNFGFaction = fact;
        }
        if (nfgRepCost && !(await Run(ns, "singularity.getFactionRep", [bestNFGFaction]) > nfgRepCost)) {
            continue;
        }
        let hasPreReqs = true;
        for (const preReqAug of sing.getAugmentationPrereq(aug)) if (!ownedAugs.includes(preReqAug)) hasPreReqs = false;
        if (cost > money || shouldIgnore || !hasPreReqs) {
            continue;
        }
    }
    let augMap: Map<string, number> = await Run(ns, "getResetInfo", [], "ownedAugs");
    let augNames = [...augMap.keys()]; let augValues = [...augMap.values()];
    if (augNames.includes("NeuroFlux Governor")) nfgLevel = augValues[augNames.indexOf("NeuroFlux Governor")];
    while (money > Math.min(...availableAugs.map(aug => sing.getAugmentationBasePrice(aug) * 1.9**planned_augs.length))) {
        availableAugs = [];
        for (const aug of augs) {
            const cost = 1.9**planned_augs.length * sing.getAugmentationBasePrice(aug);
            const ownedAugs = sing.getOwnedAugmentations(true).concat(planned_augs).concat(availableAugs);
            const shouldIgnore = (ownedAugs.includes(aug) && aug != "NeuroFlux Governor") || ignore.includes(aug) || availableAugs.includes(aug);
            let nfgRepCost;
            if (aug === "NeuroFlux Governor") {
                nfgRepCost = 500 * Math.pow(1.14, nfgLevel) * new nodeInfo(await Run(ns, "getResetInfo", [], "currentNode")).AugmentationRepCost;
            }
            let bestNFGFaction;
            for (const fact of await Run(ns, "singularity.getAugmentationFactions", ["NeuroFlux Governor"])) {
                if (bestNFGFaction || await Run(ns, "singularity.getFactionRep", [fact]) > await Run(ns, "singularity.getFactionRep", [fact])) bestNFGFaction = fact;
            }
            if (nfgRepCost && !(await Run(ns, "singularity.getFactionRep", [bestNFGFaction]) > nfgRepCost)) {
                continue;
            }
            let hasPreReqs = true;
            for (const preReqAug of sing.getAugmentationPrereq(aug)) if (!ownedAugs.includes(preReqAug)) hasPreReqs = false;
            if (cost > money || shouldIgnore || !hasPreReqs) {
                continue;
            }
            availableAugs.push(aug);
        }
        let values = [];
        for (const aug of availableAugs) {
            const info = sing.getAugmentationStats(aug);
            let value = 0;
            value += 15 *  (info.hacking - 1);
            value += 5 *   (info.hacking_exp - 1);
            value += 4 *   (info.hacking_chance - 1);
            value += 4 *   (info.hacking_grow - 1);
            value += 4 *   (info.hacking_money - 1);
            value += 4 *   (info.hacking_speed - 1);
            value += 3 *   (info.bladeburner_analysis - 1);
            value += 3 *   (info.bladeburner_max_stamina - 1);
            value += 3 *   (info.bladeburner_stamina_gain - 1);
            value += 3 *   (info.bladeburner_success_chance - 1);
            value += 2 *   (info.agility - 1);
            value += 2 *   (info.charisma - 1);
            value += 2 *   (info.strength - 1);
            value += 2 *   (info.defense - 1);
            value += 2 *   (info.dexterity - 1);
            value += 1.5 * (info.agility_exp - 1);
            value += 1.5 * (info.charisma_exp - 1);
            value += 1.5 * (info.strength_exp - 1);
            value += 1.5 * (info.defense_exp - 1);
            value += 1.5 * (info.dexterity_exp - 1);
            value += 1.5 * (info.company_rep - 1);
            value += 1 *   (info.crime_success - 1);
            value += 1 *   (info.crime_money - 1);
            value += 1 *   (info.faction_rep - 1);
            value += 1 *   (info.hacknet_node_money);
            value += 1 /   (info.hacknet_node_core_cost);     // lower is better
            value += 1 /   (info.hacknet_node_level_cost);    // lower is better
            value += 1 /   (info.hacknet_node_purchase_cost); // lower is better
            value += 1 /   (info.hacknet_node_ram_cost);      // lower is better
            value += 1 *   (info.work_money - 1);
            if (aug == "The Red Pill") {
                value = Number.POSITIVE_INFINITY; // funny
            }
            values.push(value);
        }
        const chosenAug = availableAugs[values.indexOf(Math.max(...values))];
        if (!chosenAug) {
            continue;
        }
        const basePrice = await Run(ns, "singularity.getAugmentationBasePrice", [chosenAug]);
        if (money < basePrice * 1.9**planned_augs.length) {
            break;
        }
        money -= basePrice * 1.9**planned_augs.length;
        planned_augs.push(chosenAug);
    }
    return planned_augs;
}


async function backdoorServers(ns: NS): Promise<void> {
    let servs = ['home', ...ns.scan('home')];
    for (let i = 1; i < servs.length; i++) {
        servs.push(...(await Run(ns, "scan", [servs[i]])).slice(1));
    }
    servs = servs.filter(serv => serv !== "W0r1dD43m0n" || getBackdoor(new Server(serv, ns), ns));
}


function purchasePrograms(ns: NS, reserveMoney: number = 1000**2, filters?: string[]): boolean {
    let money = Math.max(ns.getPlayer().money - reserveMoney, 0);
    if (ns.singularity.getDarkwebPrograms().length == 0 && money >= 200000) {
        ns.singularity.purchaseTor();
        money -= 200000;
    }

    const programs = ns.singularity.getDarkwebPrograms();
    const hasWeb = programs.length != 0;
    if (!hasWeb) {
        return false;
    }

    for (const prog of programs) {
        if (typeof filters !== "undefined" && filters.indexOf(prog) !== -1) {
            continue;
        }

        const cost = ns.singularity.getDarkwebProgramCost(prog);
        if (!ns.fileExists(prog) && money >= cost) {
            ns.singularity.purchaseProgram(prog);
            money -= cost;
        }
    }
    // if it doesn't exist, or we filter it out, don't count it. 
    return programs.filter(program => !ns.fileExists(program) || !filters?.includes(program)).length == 0;
}

function train(ns: NS, reserveMoney: number = 1000**2, combatOnly: boolean = false) { // TODO: incorporate this into the focus manager and make this a purely offensive trainer
    const tryGym = (money: number, skill: string) => {
        const gymWorks = Object.values(ns.enums.GymType).map(ele => String(ele));
        if (gymWorks.includes(skill) && (work?.type == "CLASS" && work?.classType != skill) || work == null) {
            if (money >= 200000 && ns.getPlayer().city != "Sector-12") { // Sector-12 has the best gyms, so we go there if we can
                ns.singularity.travelToCity("Sector-12");
            }
            if (ns.getPlayer().city == "Sector-12") {
                ns.singularity.gymWorkout(ns.enums.LocationName.Sector12PowerhouseGym, skill, false);
                return;
            }
            if (ns.getPlayer().city == "Aevum") {
                ns.singularity.gymWorkout(ns.enums.LocationName.AevumSnapFitnessGym, skill, false);
                return;
            }
            if (ns.getPlayer().city == "Volhaven") {
                ns.singularity.gymWorkout(ns.enums.LocationName.VolhavenMilleniumFitnessGym, skill, false);
                return;
            }
            // the others dont have gyms, how do they get strong?
        }
    }
    const tryLearn = (money: number, skill: string) => {

        const learnWorks = Object.values(ns.enums.UniversityClassType).map(ele => String(ele));
        const existingSkill = learnWorks.includes(skill);
        const areNotDoingSkill = work?.type == "CLASS" && work?.classType != skill;

        if (existingSkill && areNotDoingSkill) {
            if (skill != "Computer Science") { // if the skill isn't free, then we try to go to the best place to learn
                if (ns.getPlayer().city != "Aevum" && money > 200000) {
                    sing.travelToCity("Aevum");
                }
            }
            if (ns.getPlayer().city == "Sector-12") { // sector-12 has a uni
                sing.universityCourse(ns.enums.LocationName.Sector12RothmanUniversity, skill, false);
                return;
            }
            if (ns.getPlayer().city == "Aevum") { // aevum has a uni
                sing.universityCourse(ns.enums.LocationName.AevumSummitUniversity, skill, false);
                return;
            }
            if (ns.getPlayer().city == "Volhaven") { // volhaven has a uni
                sing.universityCourse(ns.enums.LocationName.VolhavenZBInstituteOfTechnology, skill, false);
                return;
            }
            // nobody else has unis

        }
    }
    const moneyAvailable = Math.max(ns.getPlayer().money - reserveMoney, 0);
    const sing = ns.singularity;
    if (moneyAvailable == 0) { // if we don't have money and this runs, then we make sure that whatever we're doing is free and then we leave
        const workType = ns.singularity.getCurrentWork()?.type;
        if (workType != "COMPANY" && workType != "CREATE_PROGRAM" && workType != "FACTION" && workType != "CRIME") {
            if (workType == "GRAFTING") { // don't stop grafting! 
                return;
            }
            tryLearn(moneyAvailable, "Computer Science");
        }
    }
    
    const exp = {
        str:ns.getPlayer().exp.strength,
        def:ns.getPlayer().exp.defense,
        dex:ns.getPlayer().exp.dexterity,
        agi:ns.getPlayer().exp.agility,
        cha:ns.getPlayer().exp.charisma,
        hck:ns.getPlayer().exp.hacking,

    }
    const smallestStat = Math.min(exp.str, exp.def, exp.dex, exp.agi, exp.cha, exp.hck);
    const work = ns.singularity.getCurrentWork();
    if (!combatOnly) {
               if (smallestStat == exp.str) {
            tryGym(moneyAvailable, 'str');
        } else if (smallestStat == exp.def) {
            tryGym(moneyAvailable, 'def');
        } else if (smallestStat == exp.dex) {
            tryGym(moneyAvailable, 'dex');
        } else if (smallestStat == exp.agi) {
            tryGym(moneyAvailable, 'agi');
        } else if (smallestStat == exp.cha) {
            tryLearn(moneyAvailable, 'Leadership');
        } else if (smallestStat == exp.hck) {
            tryLearn(moneyAvailable, 'Algorithms');
        }
    } else {
               if (smallestStat == exp.str) {
            tryGym(moneyAvailable, 'str');
        } else if (smallestStat == exp.def) {
            tryGym(moneyAvailable, 'def');
        } else if (smallestStat == exp.dex) {
            tryGym(moneyAvailable, 'dex');
        } else { // who cares about that nerd stuff
            tryGym(moneyAvailable, 'agi');
        }
    }
}