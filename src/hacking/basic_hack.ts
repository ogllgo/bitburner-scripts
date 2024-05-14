import { NS } from "@ns";
import { Server, chooseServer, scan, getRoot } from "../defs.js";

export async function main(ns: NS) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    const files = {
        hack: "shared/hack.js",
        grow: "shared/grow.js",
        weak: "shared/weaken.js",
        copy: [
            "shared/hack.js",
            "shared/grow.js",
            "shared/weaken.js"
        ]
    }
    while (true) {
        const servers = scan(ns).filter(serv => getRoot(serv.name, ns));
        const target = chooseServer(servers, ns);
        for (let server of servers) {
            if (server.name == 'home') {
                server.ram = Math.max(0, server.ram - 64)
            }
            ns.scp(files.copy, server.name);
            if (server.ram < ns.getScriptRam(files.grow)) { // if we don't have enough ram to run a single thread, then continue
                continue;
            }
            const threads = Math.floor(server.ram / ns.getScriptRam(files.grow));

            let minSecurity = ns.getServerMinSecurityLevel(target.name); let actualSecurity = ns.getServerSecurityLevel(target.name);
            let maxMoney = ns.getServerMaxMoney(target.name); let actualMoney = ns.getServerMoneyAvailable(target.name);
            let totalRam = 0; servers.map(server => server.ram).forEach(ram => totalRam += ram);
            ns.print(`TOTAL RAM: ${totalRam}`)
            ns.print(`TARGET:    ${target.name}`)
            if (ns.getServerSecurityLevel(target.name) > ns.getServerMinSecurityLevel(target.name)) {
                ns.print(`MODE:      WEAKEN`)
            } else if (ns.getServerMaxMoney(target.name) > ns.getServerMoneyAvailable(target.name)) {
                ns.print(`MODE:      GROW`)
            } else {
                ns.print(`MODE:      HACK`)
            }
            if (actualSecurity > minSecurity) {
                
                // no cancelling out weaken with weaken, so no check to see if we can
                ns.exec(files.weak, server.name, threads, target.name);
            } else if (maxMoney > actualMoney) {
                // threads for grow is 2weak for 1grow, so if we have 3 then we use this
                if (threads >= 3) {
                    ns.exec(files.grow, server.name, Math.floor(threads / 3), target.name);
                    ns.exec(files.weak, server.name, threads - Math.floor(threads / 3), target.name, ns.getWeakenTime(target.name) - ns.getGrowTime(target.name) + 100);
                } else {
                    ns.exec(files.weak, server.name, threads, target.name, ns.getWeakenTime(target.name) - ns.getGrowTime(target.name) + 100); // free exp on bad servers
                }
            } else {

                // we need 25+ threads to cancel out hack
                if (threads >= 25) {
                    ns.exec(files.hack, server.name, threads - Math.ceil(threads / 25), target.name);
                    ns.exec(files.weak, server.name, Math.ceil(threads / 25), target.name, ns.getWeakenTime(target.name) - ns.getHackTime(target.name) + 100);
                } else {
                    ns.exec(files.weak, server.name, threads, target.name, ns.getWeakenTime(target.name) - ns.getHackTime(target.name) + 100); // free exp on bad servers
                }
            }
        }
        // anti-crash
        await ns.sleep(10);
    }
}