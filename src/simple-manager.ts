import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns:NS) {
    let files = [
        'hack.js',
        'grow.js',
        'weaken.js',
        'findRealInfo.js'
    ]
    ns.tail()
    ns.clearLog()
    ns.disableLog('ALL')
    ns.enableLog('print')
    var HGWThreshold = 500; // threshold of available threads to go from ''normal'' hack function to the HGW function
    var sleepTime = 50; // delay interval, used in both pre-thres and post-thres functions
    var basedHGW = false;

    // initialize the network: get nuke, copy the files, and check if we can run scripts.
    var info = await networkInfo(ns);
    var totalThreads = info.total;
    var servThreads = info.threads;
    var servs = info.servs;
    var target = info.target;
    for (let serv of servs) {
        ns.scp(files, serv)
    }
    ns.tprint(target)

    ns.print(`Total threads in the usable network of ${totalThreads}, with the distributed threads being ${servThreads}`)
    while (!basedHGW) { // this is a non-HGW function that will 

        // redefine the network!
        info = await networkInfo(ns);
        totalThreads = info.total;
        servThreads = info.threads;
        servs = info.servs;
        target = info.target;
        ns.tprint(target)


        if (totalThreads < HGWThreshold) {
            var servsToUse = [];
            for (let servIndex in servs) {
                 let serverThreads = servThreads[servIndex]
                 let serv = servs[servIndex]
                if (serverThreads > 0) {
                    servsToUse.push(serv)
                }
            }
            var totalActions = [];
            for (let serv of servsToUse) {
                let threads = await getThreads(ns, serv)
                if (ns.getServerMinSecurityLevel(target) < ns.getServerSecurityLevel(target)) {
                    ns.tprint(target)
                    ns.exec('weaken.js', serv, threads, target)
                    ns.print(`Weakening ${target} on ${serv} with ${threads} threads`)
                    totalActions.push('weaken')
                } else if (ns.getServerMaxMoney(target) > ns.getServerMoneyAvailable(target)) {
                    if (threads - Math.ceil(threads / 3) > 0) {
                        ns.exec('grow.js', serv, Math.ceil(threads / 3), target)
                        ns.exec('weaken.js', serv, threads - Math.ceil(threads / 3), target)
                        totalActions.push('grow', 'weaken')
                    } else {
                        ns.exec('grow.js', serv, threads, target)
                    }
                } else {
                    if (threads - Math.ceil(threads / 25) > 0) {
                        ns.exec('hack.js', serv, threads - Math.ceil(threads / 25), target)
                        ns.exec('weaken.js', serv, Math.ceil(threads/25), target)
                        totalActions.push('hack', 'weaken')
                    } else {
                        ns.exec('hack.js', serv, threads, target)
                        ns.print(`Hacking ${target} on ${serv} with ${threads} threads`)
                        totalActions.push('hack')
                    }
                }
            }
            if (totalActions.includes('grow')) {
                await ns.sleep(ns.getGrowTime(target) + 100)
            } else if (totalActions.includes('weaken')) {
                await ns.sleep(ns.getWeakenTime(target) + 100)
            } else {
                await ns.sleep(ns.getHackTime(target) + 100)
            }
        } else {
            basedHGW = true;
            sleepTime = 0;
            continue
        }
        await ns.sleep(sleepTime)
    }
    while (true) {
        info = await networkInfo(ns);
        totalThreads = info.total;
        servThreads = info.threads;
        servs = info.servs;
        target = info.target;
        var weakenThreads = 0;
        var growThreads = 0;
        for (let servIndex = 0; servIndex < servs.length; servIndex++) {
            weakenThreads = Math.floor(Math.min(servThreads[servIndex] / 2, (ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)) / 0.05))
            growThreads = Math.floor(Math.min(servThreads[servIndex] / 2, ns.formulas.hacking.growThreads(ns.getServer(target), ns.getPlayer(), ns.getServerMaxMoney(target))))
            const serv = servs[servIndex]
            if (weakenThreads >= 1) {
                ns.exec('weaken.js', serv, weakenThreads, target)
            }
            if (growThreads >= 1) {
                ns.exec('grow.js', serv, growThreads, target)
            }
        }
        if (weakenThreads >= 1 || growThreads >= 1) {
            await ns.sleep(ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer()) + 100)
        } else {
            break
        }
    }

    var player = ns.getPlayer()
    var targetInfo = ns.getServer(target)
    var threadsMemory = [];
    var hackThreads:number = 250; var growThreads:number = 0; var weakThreads:number = 0;
    var pastActions:any[] = [];
    var totalThreads = 0;
    while (true) {
        if (pastActions.includes(0) && pastActions.includes(1) && totalThreads <= info.total) {
            break
        }
        player = ns.getPlayer()
        targetInfo = ns.getServer(target)
        while ((threadsMemory.length) < hackThreads + 1) {
            threadsMemory.push(0)
        }
        var hackMoneyChange = 1 - ns.formulas.hacking.hackPercent(targetInfo, player) * hackThreads;
        targetInfo.moneyAvailable = Math.max(targetInfo.moneyAvailable * hackMoneyChange, 0); // clamps the money to 0
        player.exp.hacking += ns.formulas.hacking.hackExp(targetInfo, player) * hackThreads;
        growThreads = ns.formulas.hacking.growThreads(targetInfo, player, ns.getServerMaxMoney(target));
        player.exp.hacking += ns.formulas.hacking.hackExp(targetInfo, player) * growThreads;
        weakThreads = Math.ceil(hackThreads / 25) + growThreads * 2; 
        totalThreads = hackThreads + growThreads + weakThreads + 1; // I don't know why it needs this constant. If it doesn't happen, then it tries to call ONE more thread than it can.

        if (totalThreads > info.total) { // if the required threads for n hackthreads is more than the amount in the network,
            pastActions.push(0)
            hackThreads--                // reduce hackthreads by 1
        } else {                         // otherwise (the network can support more than this many hackthreads),
            pastActions.push(1)
            hackThreads++                // hackthreads increases by 1
        }
        if (threadsMemory[hackThreads + 1] > info.total)
        if (!threadsMemory[hackThreads]) {
            threadsMemory.push(totalThreads)
        } else {
            threadsMemory.splice(hackThreads, 1, totalThreads)
        }
        if (pastActions.length > 2) {
            pastActions = pastActions.slice(1, 1)
        }
        await ns.sleep(1)
    }
    var mode = 'grow'
    var timeToWait = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer()) - ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer()) - sleepTime;
    ns.tprint(!(hackThreads < 0 || growThreads < 0 || weakThreads < 0))
    hackThreads < 0
    while (hackThreads >= 1 || growThreads >= 1 || weakThreads >= 1) {
        for (let servIndex in servs) {
            const serv = servs[servIndex]
            const threads = servThreads[servIndex]
            if (threads == 0) {
                ns.tprint(`server ${serv} has no threads to use`)
                continue
            }
            ns.tprint(growThreads > 0)
            ns.tprint(mode == 'grow')
            ns.tprint(growThreads > 0 && mode == 'grow')
            if (growThreads > 0 && mode == 'grow') {                                // if growing needs to happen, 
                ns.exec('grow.js', serv, Math.min(threads, growThreads), target)    // grow with XX threads
                ns.tprint(Math.min(threads, growThreads))
                growThreads -= Math.min(threads, growThreads)                       // tell the variable 'growing is happening with XX threads'
    
            } else if (weakThreads > 0 && mode == 'weak') {                         // if weakening needs to happen, 
                ns.exec('weaken.js', serv, Math.min(threads, weakThreads), target)  // weaken with XX threads
                ns.tprint(Math.min(threads, weakThreads))
                weakThreads -= Math.min(threads, weakThreads)                       // tell the variable 'weakening is happening with XX threads'
    
            } else if (hackThreads > 0 && mode == 'hack') {                         // if hacking needs to happen, 
                ns.exec('hack.js', serv, Math.min(threads, hackThreads), target)    // hack with XX threads
                ns.tprint(`hacking with ${threads} threads on ${serv}`)
                hackThreads -= Math.min(threads, hackThreads)                       // tell the variable 'hacking is happening with XX threads'
            }
            ns.tprint(`grow threads: ${Math.min(threads, growThreads)}`)
            ns.tprint(`hack threads: ${Math.min(threads, hackThreads)}`)
            ns.tprint(`weak threads: ${Math.min(threads, weakThreads)}`)
            if (mode == 'grow' && growThreads == 0) {
                ns.tprint('grow finished, time to weaken')
                await ns.sleep(sleepTime)
                timeToWait -= sleepTime;
                mode = 'weak'
            }
            if (mode == 'weak' && weakThreads == 0) {
                ns.tprint('waiting for hack time')
                timeToWait -= sleepTime;
                await ns.sleep(timeToWait)
                ns.tprint('weaken finished, time to hack')
                mode = 'hack'
            }
        }
    }
}

async function getThreads(ns:NS, serv:'') {
    var scriptRam = ns.getScriptRam('weaken.js');
    var serverRam = ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);
    var serverThreads = Math.floor(serverRam / scriptRam)
    return serverThreads;
}

async function nukeServers(ns: NS) {
    let servers:any[], uncheckedServers:any[]; for (uncheckedServers = [ns.getHostname()], servers = []; uncheckedServers.length > 0; servers.push(uncheckedServers[0]), uncheckedServers.splice(0, 1)) { ns.scan(uncheckedServers[0]).filter(potentialServer => !servers.includes(potentialServer) && !uncheckedServers.includes(potentialServer)).forEach(currentServer => uncheckedServers.push(currentServer))}
    // NUKE
    let nukedServers = [];
    let files = [
        'hack.js',
        'grow.js',
        'weaken.js',
        'findRealInfo.js'
    ]
    for (let server of servers) {
        if (ns.hasRootAccess(server)) { nukedServers.push(server); continue }
        var openedPorts:any = 0;

        // try every way of getting a port, and update the amount of ports opened according to what has been opened
        if (ns.fileExists('BruteSSH.exe')) { ns.brutessh(server); openedPorts++ }
        if (ns.fileExists('FTPCrack.exe')) { ns.ftpcrack(server); openedPorts++ }
        if (ns.fileExists('relaySMTP.exe')) { ns.relaysmtp(server); openedPorts++ }
        if (ns.fileExists('HTTPWorm.exe')) { ns.httpworm(server); openedPorts++ }
        if (ns.fileExists('SQLInject.exe')) { ns.sqlinject(server); openedPorts++ }

        // if there's enough opened ports to nuke, nuke.
        if (openedPorts >= ns.getServerNumPortsRequired(server)) {
            ns.nuke(server)
            nukedServers.push(server)
        }
        ns.scp(files, server)
    }
    servers = nukedServers;
    return servers
}

async function findTarget (ns: NS, servs:any[]) {
    var values = []
    for (let serv of servs) {
        const maxMoney = ns.getServerMaxMoney(serv);
        const minSecurity = ns.getServerMaxMoney(serv);
        const hackingLevel = ns.getServerRequiredHackingLevel(serv);
        const playerHacking = ns.getPlayer().skills.hacking + 2;  // since the evaluate function uses log2, if you don't add 2, then a divide by 0 error will occur
        if (maxMoney == 0 || playerHacking + 2 <= hackingLevel) { // if the server has no money, or won't fit the function,
            values.push(0)                                        // push 0 so that it knows 'this server has no value'
            continue;                                             // continue to save processing time
        }
        var levelDistance = playerHacking - hackingLevel;
        if (levelDistance < 0) {
            continue;
        }
        var value = maxMoney / (minSecurity * Math.log2(levelDistance))
        values.push(value)
    }
    for (var i = 0; i < values.length; i++) {
        for (var j = 0; j < (values.length - i - 1); j++) {
            if (values[j] > values[j + 1]) {

                // sort values
                var temp:any = values[j]
                values[j] = values[j + 1]
                values[j + 1] = temp

                // sort servers by values (when you swap values[x] with values[y], servers[x] and servers[y] also swap, keeping parity.)
                var temp2:any = servs[j]
                servs[j] = servs[j + 1]
                servs[j + 1] = temp2
            }
        }
    }
    // since the sorting puts the highest number at the back, call the very back of the sorted list and make that the target.
    var target = '';
    if (ns.getPlayer().skills.hacking >= 750) {
        target = servs[servs.length-1]
    } else {
        target = 'n00dles';
    }
    return target;
}

async function networkInfo(ns: NS) {

    var servers = await nukeServers(ns);

    // filter out unusable servers
    let allowedServers = [];
    for (let server of servers) {
        if (ns.getServerRequiredHackingLevel(server) <= ns.getPlayer().skills.hacking) {
            allowedServers.push(server)
        }
    }

    var servs = allowedServers;

    const target = await findTarget(ns, servs)
    // IF YOU ONLY WANT PSERVS TO BE USED, USE THIS.
    servs = ns.getPurchasedServers();
    let servThreads = [];
    let totalThreads = 0;

    for (let serv of servs) {
        var threads = await getThreads(ns, serv)
        servThreads.push(threads);
        totalThreads += threads;
    }

    var returnValues = {
        threads:servThreads,
        total:totalThreads,
        servs:servs,
        target:target
    }
    return returnValues
}