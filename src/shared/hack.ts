import { NS } from "@ns";

export async function main(ns: NS) {
    await ns.sleep(Number(ns.args[1]) || 0)
    await ns.hack(String(ns.args[0]))
}