import { NS } from "@ns";

export async function main(ns: NS) {
    const path = "files/cct/fib.txt";

    let sequence: number[] = [];
    if (ns.fileExists(path) && JSON.parse(ns.read(path)).length >= 2) sequence = JSON.parse(ns.read(path));
    const before = performance.now();
    const beforeLength = sequence.length;
    while (sequence.length < Number(ns.args[0])) {
        if (sequence.length < 2) {
            sequence.push(1);
            continue;
        }
        if (sequence[sequence.length - 1] + sequence[sequence.length - 2] == Number.POSITIVE_INFINITY) break;
        sequence.push(sequence[sequence.length - 1] + sequence[sequence.length - 2]);
    }
    const after = performance.now();
    ns.write(path, JSON.stringify(sequence), "w");
    if (sequence.length - beforeLength > 0) ns.tprint(`${sequence.length - beforeLength} fibbonaci numbers made in ${ns.tFormat(after - before, true)}`);
}