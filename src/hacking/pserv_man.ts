import { NS } from "@ns";
import { Server } from "../defs";
export async function main(ns: NS) {
    const keepMoney: number = Number(ns.args[0] || 1000000) // specify amount to keep
    ns.tail();
    ns.disableLog('ALL');
    while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
        if (ns.getServerMoneyAvailable('home') >= ns.getPurchasedServerCost(2)) {
            ns.purchaseServer(`pserv-${ns.getPurchasedServers().length}`, 2); // the pserv stand for private server
        }
        await ns.sleep(100);
    }
    let servs = ns.getPurchasedServers().map(serv => new Server(serv, ns));

    let minRam = Math.min(...servs.map(serv => serv.maxRam));
    let desiredRam = minRam;

    while (true) {
        ns.clearLog();
        minRam = Math.min(...servs.map(serv => serv.maxRam));
        // DISPLAY HERE
        let ramDisplays: number[] = servs.map(serv => serv.maxRam);
        let maxLengthNames: number = Math.max(...servs.map(serv => serv.name.length), "NAME:".length);
        let maxLengthRams: number = Math.max(...ramDisplays.map(ram => ns.formatRam(ram).length), "MAXRAM:".length) + 1;
        let maxLengthPercents: number = Math.max(...servs.map(serv => ns.formatPercent(1 - serv.ram / serv.maxRam).length), "USED%:".length);
        ns.print(`┌${"─".repeat(maxLengthNames + 2)}┬${"─".repeat(maxLengthRams + 1)}┬${"─".repeat(maxLengthPercents + 2)}┐`);
        ns.print(`│ NAME: ${" ".repeat(maxLengthNames - "NAME: ".length + 1)}│ MAXRAM:${" ".repeat(maxLengthRams - "MAXRAM:".length)}│ USED%:${" ".repeat(maxLengthPercents - "USED%:".length)} │`)
        for (let serv of servs) {
            let currentLengthRam = ns.formatRam(serv.maxRam).length;
            let ramSpaces = " ".repeat(maxLengthRams - currentLengthRam);
            let currentLengthName = serv.name.length;
            let nameSpaces = " ".repeat(maxLengthNames - currentLengthName);
            let percent = ns.formatPercent(1 - serv.ram / serv.maxRam);
            ns.print(`│ ${serv.name}${nameSpaces} │ ${ns.formatRam(serv.maxRam)}${ramSpaces}│ ${percent}${" ".repeat(maxLengthPercents - percent.length)} │`);
        }
        ns.print(`└${"─".repeat(maxLengthNames + 2)}┴${"─".repeat(maxLengthRams + 1)}┴${"─".repeat(maxLengthPercents + 2)}┘`);
        servs = ns.getPurchasedServers().map(serv => new Server(serv, ns));

        for (let i = 0; i < servs.length; i++) {

            let ram = servs[i].maxRam;

            if (ram < desiredRam) {

                let cost = ns.getPurchasedServerUpgradeCost(servs[i].name, desiredRam);
                let money = ns.getPlayer().money - keepMoney;
                if (money > cost) {
                    ns.upgradePurchasedServer(servs[i].name, desiredRam);
                }
            }
        }
        if (minRam == desiredRam && desiredRam != ns.getPurchasedServerMaxRam()) {
            desiredRam *= 2
        }
        await ns.sleep(10)
    }
}