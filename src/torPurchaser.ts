import { NS } from "@ns";

export async function main(ns: NS) {
    ns.tail()
    const programs = ns.singularity.getDarkwebPrograms()
    ns.disableLog('ALL')
    ns.clearLog()
    ns.enableLog('print')
    let exit1, exit = false;
    while (true) {
        if (ns.getPlayer().money >= 200000 && !(ns.hasTorRouter())) {
            ns.singularity.purchaseTor()
        }
        if (!ns.hasTorRouter()) { // if you don't have a tor router, say "No Tor Router!"
            ns.printf(`\u001b[38;2;200;55;55m No Tor Router!`)
            while (!ns.hasTorRouter()) { // wait till you have a tor router
                await ns.sleep(20)
            }
        }
        for (let program of programs) {
            if (!ns.fileExists(program) && ns.singularity.getDarkwebProgramCost(program) <= ns.getPlayer().money) {
                ns.singularity.purchaseProgram(program)
            }
        }
        exit1 = true
        for (let program of programs){if(!ns.fileExists(program)){exit1 = false}}
        if (exit) {
            ns.printf(`\u001b[38;2;55;200;55m All programs exist!`)
            return
        }
        await ns.sleep(2000)
    }
}