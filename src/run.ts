import { NS } from "@ns";

type Leaves<T> = T extends object ? { [K in keyof T]:
    `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? "" : `.${Leaves<T[K]>}`}`
  }[keyof T] : never

/**
 * @param {NS} ns The ns object
 * @param {Leaves<NS>} path String of ns function to run, eg "gang.getMemberNames" or "getPlayer"
 * @param {array} params Parameters to run function with, eg ["n00dles",{ramOverride:10}]
 * @param {string} props properties to access, eg "skills".
 * @return {Promise<Any> | null} Whatever the passed function returns, or null if it fails to execute (probably low ram)
 */
export async function Run(ns: NS, path: Leaves<NS>, params: string[]= [], props: string = "") {
    !ns.fileExists("temp/run.js")
        && ns.write(`temp/run.js`, [
            '/** @param ns {NS} */',
            'export async function main(ns) {',
            'const [path, props, ...params] = ns.args;',
            'const func_return = path.split(".").reduce((a, b) => a[b], ns)(...params)',
            'const return_value = !props ? func_return : props.split(".").reduce((a,b) => a?.[b], func_return)',
            'ns.atExit(() => ns.writePort(ns.pid, return_value || 0));',
            '}',
        ].join("\n"),
            "w");
    const run_pid: number = ns.run(`temp/run.js`, { ramOverride: 1.6 + ns.getFunctionRamCost(path), temporary: true }, path, props, ...params);
    return !run_pid
        ? (ns.tprintf(`${path.toUpperCase()} DID NOT RUN !!`), null)
        : (await ns.nextPortWrite(run_pid), ns.readPort(run_pid));
};