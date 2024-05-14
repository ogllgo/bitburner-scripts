import { NS } from "@ns";

export async function main(ns: NS) {
    if (ns.args.length < 2) {
        ns.tprint('you must specify an argument to change, and what it will become')
    }
    const arg = ns.args[0];
    const data = ns.args[1];
    if (arg.toString().toLowerCase() == "reserve") {
        if (Number.isNaN(Number(data))) {
            ns.tprintf(`ERROR: NOT A NUMBER INPUTTED FOR CHANGING RESERVED MONEY, INSTEAD TYPE "${typeof data}" AND DATA "${data}`);
            return;
        }
        if (ns.tryWritePort(1, data)) {
            ns.tprintf(`SUCCESS! Reserved ${ns.formatNumber(Number(data))} for use outside scripts.`);
        }
    } else if (arg.toString().toLowerCase() == "focus") {
        if (ns.tryWritePort(2, Boolean(data))) {
            ns.tprintf(`SUCCESS! ${Boolean(data) ? "We will now focus when training. This will flicker." : "We will not focus when training."}`);
        }
    }
}