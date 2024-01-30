import { NS } from "@ns";
// this is not to be used by humans, you will probably format it wrong (i know i will), 
// it's a helper script!
export async function main(ns: NS) {
    for (let i = 0; i < ns.args.length; i++) {
        ns.singularity.connect(ns.args[i]) // connect to every server in args
    }
    await ns.singularity.installBackdoor() // install a backdoor
}
