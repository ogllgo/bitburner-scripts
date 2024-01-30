import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns:NS) {
    const server = ns.args[0];
    ns.tprint(`${ns.getServerMoneyAvailable(server) / ns.getServerMaxMoney(server) * 100}% of max money`)
    ns.tprint(`${ns.getServerSecurityLevel(server) - ns.getServerMinSecurityLevel(server)} away from min security`)
}