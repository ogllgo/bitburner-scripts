import { NS } from '@ns'
import { getRoot } from './utility'
/*
if you aren't using a typescript file, you can ignore the import { NS };
if it screams because you aren't using TS, replace all the 'let foo:type = baa'

import { getRoot } is just my personal getRoot function. You can replace it with yours if you'd like, 
since it uses constant 'root' instead of 'getroot'.
your function will have to return 'true' if the server has a backdoor, or 'false' if it doesn't,
since mine relies on that in The Big Continue.

Functions, for me, require ns AND args to be specified, not just the args. You can remove the (ns)
from functions if it yells at you.
*/
export async function main(ns: NS) {
    const root = getRoot
    // disable if you don't like tail windows
    ns.tail()
    ns.disableLog('ALL')
    ns.enableLog('print')

    let servers = ["home", ...ns.scan("home")];
    let backdoored = []
    for (let i = 1; i < servers.length; i++) {
        servers.push(...ns.scan(servers[i]).slice(1));
    }
    let tempDoored:any[] = []; // when we initially backdoor a server, the other script takes time to respond. This lets us pretend that it has a backdoor, until it actually DOES have a backdoor.


    while (true) {
        for (let server of servers) {
            if (ns.getServer(server).backdoorInstalled == true || tempDoored.includes(server)) {
                backdoored.push(server)
                if (tempDoored.includes(server)) {
                    tempDoored.slice(tempDoored.indexOf(server))
                }
            }
            /*
            if we have a backdoor, or
            the server is too high level, or
            we have a backdoor scheduled, or
            we don't have root,
            skip it!
            */
            if (backdoored.includes(server) || ns.getServerRequiredHackingLevel(server) > ns.getPlayer().skills.hacking || tempDoored.includes(server) || !(await root(ns, server))){
                continue
            }
            let path = await pathTo(server, ns)
            ns.run('backdoorWorker.js', 1, ...path) // this script connects to all args, then installs a backdoor.
            tempDoored.push(server) // push the server to tempDoored, so that we know to avoid it
        }
        // clear the logs, and print the ratio
        ns.clearLog()
        ns.print(`${backdoored.length}/${servers.length} done, ${Math.floor(backdoored.length / servers.length * 10000) / 100}% done`)

        if (backdoored.length == servers.length) {
            break
        }

        // housekeeping, reset backdoored[] and then wait for the next cycle
        backdoored = []
        await ns.sleep(500)
    }
    
} 
/*
The 'ns.tprint' and 'ns.print' are so that we can debug some things.
*/
async function pathTo(server:any, ns: NS) {
    let path = [];
    if (server == 'home') {  // if it's home, just connect to home!
        // ns.tprint('this server is home')
        return server
    }

    if (ns.scan(server)[0] == 'home') {  // if it's directly next to home, just connect to home, then the server!
        // ns.tprint('fast path: home ', server)
        return ['home', server]
    }

    let scanServ = server                // so we can keep track of server whilst changing the server to scan
    while (ns.scan(scanServ)[0] != 'home') {
        path.push(ns.scan(scanServ)[0])  // push the parent to the path
        scanServ = ns.scan(scanServ)[0]  // scan the parent
    }
    path.push('home')  // start out AT home
    path.reverse()     // currently it's the path from parent to home, so we flip it
    path.push(server)  // we want to connect to the parent!

    //debugging print statement
    // ns.tprint('final path: ',path)
    return path
}