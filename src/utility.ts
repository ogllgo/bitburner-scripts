import { NS } from '@ns';

export async function findServer(ns: NS) {
    if (ns.getPlayer().skills.hacking <= 500) {
        return 'n00dles'
    }
    const servs = (await getNetworkInfo(ns)).names
    const servsValue = [];
    var playerHacking = ns.getPlayer().skills.hacking;
    for (let serv of servs) {
        const maxMoney = ns.getServerMaxMoney(serv);
        const hackingReq = ns.getServerRequiredHackingLevel(serv);
        if (maxMoney == 0 || hackingReq > playerHacking) {
            servsValue.push(0); 
            continue;
            // there's no point in trying to target a server with a high hacking level requirement or no money!
        }
        const minSecurity = ns.getServerMinSecurityLevel(serv);
        const value = maxMoney / (minSecurity * Math.log2(Math.abs(hackingReq + 2 - playerHacking)));
        servsValue.push(value); 
    }
    const bestIndex = servsValue.indexOf(Math.max(...servsValue))
    if (ns.getPlayer().skills.hacking > 750) {
        return servs[bestIndex]
    } else {
        return 'foodnstuff'
    }
}

export async function getRoot(ns: NS, target: string) {
    var openPorts: number = 0;
    var reqPorts: number = ns.getServerNumPortsRequired(target);
    // tries different ways of opening ports
    if (ns.fileExists('bruteSSH.exe')) {ns.brutessh(target); openPorts++}
    if (ns.fileExists('FTPCrack.exe')) {ns.ftpcrack(target); openPorts++}
    if (ns.fileExists('relaySMTP.exe')) {ns.relaysmtp(target); openPorts++}
    if (ns.fileExists('HTTPWorm.exe')) {ns.httpworm(target); openPorts++}
    if (ns.fileExists('SQLInject.exe')) {ns.sqlinject(target); openPorts++}
    // if we can nuke it, do it
    if (reqPorts <= openPorts) {ns.nuke(target); return target;}
    if (ns.hasRootAccess(target)) {
        return true
    } else {
        return false
    }
}

export async function getNetworkInfo(ns: NS) {
    let totalThreads:number = 0; let serverThreads:number[] = [];let nukedServers = [];let servers:string[], uncheckedServers:string[]; for (uncheckedServers = [ns.getHostname()], servers = []; uncheckedServers.length > 0; servers.push(uncheckedServers[0]), uncheckedServers.splice(0, 1)) { ns.scan(uncheckedServers[0]).filter(potentialServer => !servers.includes(potentialServer) && !uncheckedServers.includes(potentialServer)).forEach(currentServer => uncheckedServers.push(currentServer))}
    for (let servIndex:number = 0; servIndex < servers.length; servIndex++) {
        var serv = servers[servIndex]
        if (await getRoot(ns, serv) && ns.getServerRequiredHackingLevel(serv) <= ns.getPlayer().skills.hacking) {
            nukedServers.push(serv)
        } else {
            nukedServers.push(0)
        }
        
        if (ns.hasRootAccess(serv) && ns.getServerRequiredHackingLevel(serv) <= ns.getPlayer().skills.hacking) {
            const scriptRam:number = ns.getScriptRam('hack.js')
            const serverRam:number = ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv)
            const numThreads:number = Math.floor(serverRam/scriptRam)
            serverThreads.push(numThreads)
            totalThreads += numThreads
        } else {
            serverThreads.push(0)
        }
    }
    const server = {
        names:servers,
        nuked:nukedServers,
        threads:serverThreads,
        total:totalThreads
    }    
    return server;
}