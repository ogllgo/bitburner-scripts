import { NS } from "@ns";
import { nodeInfo } from "./consts";
export async function main(ns: NS) {
    ns.tprint(new nodeInfo(ns.getResetInfo().currentNode, ns.getResetInfo().ownedSF.get(ns.getResetInfo().currentNode)! + 1).GangSoftcap)
}