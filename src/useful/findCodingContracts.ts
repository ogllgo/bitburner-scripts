import { NS } from "@ns";
import { scan, getRoot } from "@/defs";

export async function main(ns: NS) {
    const servs = scan(ns).map(serv => serv.name).filter(serv => getRoot(serv, ns));
    for (const serv of servs) {
        for (const file of ns.ls(serv)) {
            if (file.endsWith(".cct")) ns.tprint('Coding Contract ', file, ' found on ', serv);
        }
    }
}