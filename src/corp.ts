import { NS } from "@ns";

export async function main(ns: NS) {
    ns.corporation.createCorporation("corp", false);
    if (!ns.corporation.hasCorporation()) {
        ns.tprint('no corp?')
        return;
    }
    ns.tprint(ns.corporation.getCorporation().divisions);
    ns.corporation.expandIndustry("Agriculture", "Agriculture");
    ns.tprint(ns.corporation.getCorporation().divisions);
}