import { NS } from "@ns";

export async function main(ns: NS) {
    function isPrime(num: number): boolean {
        if (num == 2 || num == 3) return true;
        if (num < 5) return false; // all primes below 5 are checked, so we dont care about other cases
        if (num % 2 == 0 || num % 3 == 0) return false; // 6k, 6k+2, 6k+3, 6k+4 checks
        for (let i = 5; i*i<num; i += 6) { // increase by 6 because we're checking by 6
            const minus1 = num % i == 0; // 6k-1
            const plus1 = num % (i + 2) == 0; // 6k + 1
            if (minus1 || plus1) return false;
        }
        return true;
    }

    let maxNum = Number(ns.args[0]);
    if (ns.args[0] == undefined) maxNum = 1000000;
    let checkOne = false;
    if (ns.args[1] && (ns.args[1] + "").toLowerCase() == "exact") {
        checkOne = true;
    }
    if (checkOne) {
        ns.tprint(isPrime(maxNum));
        ns.exit();
    }
    const path = "files/cct/primes.txt";
    let primes: number[] = [];
    if (ns.fileExists(path) && JSON.parse(ns.read(path)).length > 0) primes = JSON.parse(ns.read(path));
    const starting_length = primes.length;
    const minNum = primes.length > 0 ? primes[primes.length - 1] : 2;
    let waitTime = Date.now() + 5000;
    const prevTime = Date.now();
    for (let num = minNum; primes.length < maxNum; num++) {
        if (isPrime(num)) {
            try {
                primes.push(num);
            } catch {
                ns.tprint(`Pushing to the array failed with length ${primes.length}. Javascript moment.`);
                return;
            }
        }
        if (Date.now() > waitTime) {
            await ns.sleep(0);
            waitTime = Date.now() + 5000;
        }
    }
    const postTime = Date.now();
    const waitedTime = postTime - prevTime;
    ns.write(path, JSON.stringify(primes), "w");
    ns.tprint(`${ns.formatNumber(primes.length, 0)} primes, time to add is ${ns.tFormat(waitedTime, true)} from ${ns.formatNumber(starting_length, 0)} primes`);
}