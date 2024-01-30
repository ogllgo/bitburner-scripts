import {NS} from '@ns'
export async function main(ns: NS) {
    ns.tail()
    ns.disableLog('ALL')
    ns.enableLog('print')
    ns.print('base time')
    ns.run('infiltrate.js')
    ns.run('bitnodes/factions/joiner.js')
    ns.run('bitnodes/backdoor.js')
    ns.run('bitnodes/torPurchaser.js')
    ns.run('initial-deployer.js', 1, 'n00dles')
    while (ns.getPlayer().money < 2000000) {
        await ns.sleep(ns.getGrowTime('n00dles') + 100)
    }
    if (!ns.fileExists('reimproved/pserv-manager.js')) {
        ns.tprint('no pserv manager? you need a file called `reimproved/pserv-manager.js`, or just edit this file')
        return
    }
    ns.print('pserv time')
    ns.run('reimproved/pserv-manager.js')
    await ns.sleep(30000) // give it time to purchase pservs, 30s of waiting
    ns.print('HGW, big leagues time')
    ns.run('HGW-study.js', 1) // GO GO GO
    ns.closeTail();
}