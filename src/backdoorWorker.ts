import { NS } from "@ns";

export async function main(ns: NS) {
    for (let i = 0; i < ns.args.length; i++) {
        ns.singularity.connect(ns.args[i])
    }
    await ns.singularity.installBackdoor()
}