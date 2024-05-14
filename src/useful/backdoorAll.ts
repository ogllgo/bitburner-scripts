import { NS } from "@ns";
import { getBackdoor, scan } from "@/defs";

export async function main(ns: NS) {
    let servs = scan(ns).filter(serv => !getBackdoor(serv, ns));
    while (servs.length > 0) { // while we have servers to backdoor
        servs = servs.filter(serv => !getBackdoor(serv, ns)); // backdoor as many as possible
        await ns.sleep(10)
    }
    if (ns.serverExists('W0r1dD43m0n')) {
        ns.tprint('we need to backoor W0r1dD43M0n and also run the sing function to destroy it');
    } else {
        ns.tprint(scan(ns).filter(serv => !getBackdoor(serv, ns)))
    }
}