import { NS } from "@ns";

export async function main(ns: NS) {
    const nodes = ns.hacknet.numNodes();
    ns.tprint(nodes);
    let totalCapacity = 0;
    for (let i = 0; i < nodes; i++) {
        const node = ns.hacknet.getNodeStats(i);
        totalCapacity += node.hashCapacity!;
    }
    ns.tprint(totalCapacity)
}