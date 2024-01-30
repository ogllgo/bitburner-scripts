import { NS } from '@ns';
/** @param {NS} ns **/
export async function main(ns: NS) {
    await ns.sleep(ns.args[1] || 1)
    await ns.hack(ns.args[0])
}