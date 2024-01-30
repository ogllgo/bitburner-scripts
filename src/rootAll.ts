import { NS } from "@ns";
import { getRoot } from "./utility";
export async function main(ns: NS) {
    while (true) {
        let servs = await list(ns)
        if (servs.bd == servs.list && servs.bd.length > 0) {
            ns.tprint('All servers are backdoored!')
            return
        }
        for (let serv of servs.bd) {
            await getRoot(ns, serv)
        }
        await ns.sleep(500)
    }
}
async function list(ns: NS) {
    let servers:string[], uncheckedServers:string[]; for (uncheckedServers = [ns.getHostname()], servers = []; uncheckedServers.length > 0; servers.push(uncheckedServers[0]), uncheckedServers.splice(0, 1)) { ns.scan(uncheckedServers[0]).filter(potentialServer => !servers.includes(potentialServer) && !uncheckedServers.includes(potentialServer)).forEach(currentServer => uncheckedServers.push(currentServer))}
    let backdoored:string[] = [];
    for (let server of servers) {
        if (ns.hasRootAccess(server)) {
            backdoored.push(server)
        }
    }
    let returnObj = {
        bd:backdoored,
        list:servers
    }
    return returnObj
}