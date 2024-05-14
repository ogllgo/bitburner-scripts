import { NS } from "@ns";
import { getBackdoor, Server, getRoot, chooseServer, scan } from "@/defs";

export async function main(ns: NS) {
    let target: string = String(ns.args[0]);
    if (target == "TARGET") {
        target = chooseServer(scan(ns), ns).name
    }
    if (!ns.serverExists(target)) {
        ns.tprint('You must specify a real server!');
        return;
    }
    ns.tprint(`SERVER:           ${target}`)
    ns.tprint(`MAX MONEY:        ${ns.formatNumber(ns.getServerMaxMoney(target))}`);
    ns.tprint(`CURRENT MONEY:    ${ns.formatNumber(ns.getServerMoneyAvailable(target))}`);
    ns.tprint(`MIN SECURITY:     ${ns.getServerMinSecurityLevel(target)}`);
    ns.tprint(`ACTUAL SECURITY:  ${ns.getServerSecurityLevel(target)}`);
    ns.tprint(`HAS ROOT:         ${getRoot(target, ns)}`);
    ns.tprint(`HAS BACKDOOR:     ${getBackdoor(new Server(target, ns), ns)}`)
    ns.tprint(`TIME TO WEAKEN:   ${ns.tFormat(ns.getWeakenTime(target))}`)
}