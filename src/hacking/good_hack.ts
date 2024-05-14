import { NS } from "@ns";
import { Server, scan, getRoot, chooseServer } from "../defs";
export async function main(ns: NS) {
    ns.tail();
    ns.disableLog('ALL');
    const files = {
        hack:"shared/hack.js",
        grow:"shared/grow.js",
        weak:"shared/weaken.js",
        scp: [
            "shared/hack.js",
            "shared/grow.js",
            "shared/weaken.js"
        ]
    };
    const offset = 50;
    const batch_offset = offset;
    let target = chooseServer(scan(ns), ns);
    let threads = getThreads(ns); threads.maxBatches = Math.min(Math.floor((ns.getWeakenTime(target.name) - offset * 3) / batch_offset), threads.maxBatches);
    while (true) { // repeat forever
        let servs = scan(ns).filter(serv => getRoot(serv.name, ns));
        target = chooseServer(scan(ns), ns);
        threads = getThreads(ns); threads.maxBatches = Math.min(Math.floor(ns.getWeakenTime(target.name) / (3 * offset + batch_offset)), threads.maxBatches);
        const starting_max_batches = threads.maxBatches; // so that we can call it later on
        while (getThreads(ns).hack == 0) {
            prep(scan(ns), chooseServer(scan(ns), ns), files, ns);
            await ns.sleep(ns.getWeakenTime(chooseServer(scan(ns), ns).name) + 100);
        }
        let batch_number = 0;
        while (threads.maxBatches > 0) { // threads.maxBatches decreases by 1 for every batch
            ns.clearLog();
            servs = scan(ns).filter(serv => getRoot(serv.name, ns));
            target = chooseServer(servs, ns);
            threads = getThreads(ns); threads.maxBatches = Math.min(Math.floor(ns.getWeakenTime(target.name) / batch_offset), threads.maxBatches);
            let totalRam = 0; servs.map(serv => serv.ram).forEach(ram => totalRam += ram);
            while (threads.hack + threads.weak1 + threads.grow + threads.weak2 > 0) { // in-batch repeat
                servs = scan(ns).filter(serv => getRoot(serv.name, ns));
                for (let serv of servs.filter(server => server.name != "pserv-0" && server.name != "pserv-1")) { // pserv-1 is the share server, pserv-0 is the hacknet server
                    ns.scp(files.scp, serv.name);
                    const hack_time = ns.getWeakenTime(target.name) - ns.getHackTime(target.name); const weak_1_time = offset; const grow_time = ns.getWeakenTime(target.name) - ns.getGrowTime(target.name) + 2 * offset; const weak_2_time = 3 * offset;
                    let localThreads = Math.floor(serv.ram / ns.getScriptRam(files.grow));
                    if (threads.hack > 0 && localThreads > 0) {
                        if (ns.exec(files.hack, serv.name, {threads:Math.min(localThreads, threads.hack), temporary:true}, target.name, hack_time + batch_number * batch_offset)) {
                            threads.hack -= Math.min(localThreads, threads.hack);
                            threads.total -= Math.min(localThreads, threads.hack);
                            localThreads -= Math.min(localThreads, threads.hack);
                        }
                    }
                    if (threads.weak1 > 0 && localThreads > 0) {
                        if (ns.exec(files.weak, serv.name, {threads:Math.min(localThreads, threads.weak1), temporary:true}, target.name, weak_1_time + batch_number * batch_offset)) {
                            threads.weak1 -= Math.min(localThreads, threads.weak1);
                            threads.total -= Math.min(localThreads, threads.weak1);
                            localThreads -= Math.min(localThreads, threads.weak1);
                        }
                    }
                    if (threads.grow > 0 && localThreads > 0) {
                        if (ns.exec(files.grow, serv.name, {threads:Math.min(localThreads, threads.grow), temporary:true}, target.name, grow_time + batch_number * batch_offset)) {
                            threads.grow -= Math.min(localThreads, threads.grow);
                            threads.total -= Math.min(localThreads, threads.grow);
                            localThreads -= Math.min(localThreads, threads.grow);
                        }
                    }
                    if (threads.weak2 > 0 && localThreads > 0) {
                        if (ns.exec(files.weak, serv.name, {threads:Math.min(localThreads, threads.weak2), temporary:true}, target.name, weak_2_time + batch_number * batch_offset)) {
                            threads.weak2 -= Math.min(localThreads, threads.weak2);
                            threads.total -= Math.min(localThreads, threads.weak2);
                            localThreads -= Math.min(localThreads, threads.weak2);
                        }
                    }
                }
            }
            batch_number++;
            await ns.sleep(0);
        }
        await ns.sleep(ns.getWeakenTime(target.name) + offset * 3 + batch_offset * starting_max_batches + 50);
    }
}
function prep(servs:Server[], target:Server, files:any, ns: NS) { // i dont like the 'any' type declaration, but i dont know how to make an 'object' type declaration without it erroring
    ns.clearLog();
    if (ns.getServerMinSecurityLevel(target.name) != ns.getServerSecurityLevel(target.name)) {
        ns.printf(`INFO: prepping security on ${target.name}`)
        for (let serv of servs) {
            ns.scp(files.scp, serv.name)
            const threads = Math.floor(serv.ram / ns.getScriptRam('shared/weaken.js'));
            if (threads == 0) {
                continue;
            }
            ns.exec(files.weak, serv.name, threads, target.name);
        }
    } else if (ns.getServerMoneyAvailable(target.name) != ns.getServerMaxMoney(target.name)) {
        ns.printf(`INFO: prepping money on ${target.name}`)
        for (let serv of servs) {
            ns.scp(files.scp, serv.name);
            const threads = Math.floor(serv.ram / ns.getScriptRam('shared/grow.js'));
            if (threads == 0) {
                continue;
            }
            if (threads > 3) {
                ns.exec(files.weak, serv.name, threads - Math.floor(threads / 3), target.name, 50);
                ns.exec(files.grow, serv.name, Math.floor(threads / 3), target.name, ns.getWeakenTime(target.name) - ns.getGrowTime(target.name));
            } else {
                ns.exec(files.weak, serv.name, threads, target.name);
            }
        }
    } else {
        ns.printf("ERROR: Why are we still in prep?");
    }
}
function getThreads(ns: NS) {
    let target = ns.getServer(chooseServer(scan(ns), ns).name);
    if (target.moneyMax != target.moneyAvailable || ns.getServerMinSecurityLevel(target.hostname) != ns.getServerSecurityLevel(target.hostname)) {
        return {
            maxBatches:0,
            hack:0,
            weak1:0,
            grow:0,
            weak2:0,
            total:0
        };
    }
    let player = ns.getPlayer();

    const minSec = ns.getServerMinSecurityLevel(target.hostname);
    let hackEffect = ns.formulas.hacking.hackPercent(target, player);
    let hackThreads = Math.floor(1 / hackEffect - 1);

    target.moneyAvailable = Math.max(Number(target.moneyAvailable) - hackEffect * hackThreads, 0);
    target.hackDifficulty = Math.min(Number(target.hackDifficulty) + hackThreads * 0.002, 100);
    player.exp.hacking += ns.formulas.hacking.hackExp(target, player) * hackThreads;

    let firstSecLoss = ns.getServerSecurityLevel(target.hostname) + (hackThreads * 0.002);
    let firstWeakThreads = Math.ceil((Math.min(100, firstSecLoss) - minSec) / 0.05);
    player.exp.hacking += ns.formulas.hacking.hackExp(target, player) * hackThreads;
    let growThreads = ns.formulas.hacking.growThreads(target, player, ns.getServerMaxMoney(target.hostname));
    
    let secondSecLoss = ns.getServerSecurityLevel(target.hostname) + (growThreads * 0.1);
    let secondWeakThreads = Math.floor((Math.min(100, secondSecLoss) - minSec) / 0.05);
    let totalThreads = hackThreads + firstWeakThreads + growThreads + secondWeakThreads;
    let totalNetThreads = 0; scan(ns).filter(serv => serv.name != "pserv-0" && serv.name != "pserv-1" && getRoot(serv.name, ns)).forEach(serv => totalNetThreads += Math.floor(serv.ram / ns.getScriptRam('shared/grow.js')));
    while (totalNetThreads < totalThreads) {
        target = ns.getServer(target.hostname)
        hackThreads--; // it's all based off hackThreads, and it's too high, so we reduce hackThreads
        target.moneyAvailable = Number(target.moneyAvailable) - hackEffect * hackThreads; 
        firstSecLoss = ns.getServerSecurityLevel(target.hostname) + (hackThreads * 0.002);
        firstWeakThreads = Math.floor((Math.min(100, firstSecLoss) - minSec) / 0.05);
        growThreads = ns.formulas.hacking.growThreads(target, player, ns.getServerMaxMoney(target.hostname));
        secondSecLoss = ns.getServerSecurityLevel(target.hostname) + (growThreads * 0.1);
        secondWeakThreads = Math.floor((Math.min(100, secondSecLoss) - minSec) / 0.05);
        totalThreads = hackThreads + firstWeakThreads + growThreads + secondWeakThreads;
    }
    return {
        maxBatches:Math.min(Math.floor(totalNetThreads / totalThreads)),
        hack:hackThreads,
        weak1:firstWeakThreads,
        grow:growThreads,
        weak2:secondWeakThreads,
        total:hackThreads + firstWeakThreads + growThreads + secondWeakThreads
    };
    
}