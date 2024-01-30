import { NS } from '@ns';

export async function main(ns: NS) {
    ns.tail()
    ns.disableLog('disableLog')
    ns.disableLog('ALL')
    ns.enableLog('print')
    ns.renamePurchasedServer('pserv-', 'pserv-0')
    await purchase(ns)
    const allEqual = (arr: any[]) => arr.every(val => val === arr[0]);
    var rams = [];
    var servs = ns.getPurchasedServers()
    for (let serv of servs) {
        rams.push(ns.getServerMaxRam(serv))
    }
    var desiredRam = Math.min(...rams) * 2;
    while (true) { 
        for (let index in servs) {
            if (ns.serverExists(servs[index]) && servs[index] != 'pserv-' + index) {
                ns.deleteServer('pserv-' + index)
            }
            ns.renamePurchasedServer(servs[index], 'pserv-')
        }
        var allowedMoney = ns.getServerMoneyAvailable('home') / 3
        var servs = ns.getPurchasedServers()
        rams = []

        for (let serv of servs) {
            rams.push(ns.getServerMaxRam(serv))
        }

        let servLengths:number[] = []; servs.forEach(serv => {servLengths.push(serv.length)})
        let usedRamLengths:number[] = []; servs.forEach(serv => {usedRamLengths.push(ns.formatRam(ns.getServerUsedRam(serv)).length)})
        let totalRamLengths:number[] = []; servs.forEach(serv => {totalRamLengths.push(ns.formatRam(ns.getServerMaxRam(serv)).length)})
        ns.clearLog()
        for (let i in servs) {
            let servIndex = parseInt(i)
            let nameSpaces = ' '.repeat(Math.max(Math.max(...servLengths) - servLengths[servIndex], 0))
            let totalRamSpaces = ' '.repeat(Math.max(...totalRamLengths) + 1 - totalRamLengths[servIndex])
            let usedRamSpaces = ' '.repeat(Math.max(...usedRamLengths) + 3 - (usedRamLengths[servIndex] + 2))
            if (servIndex % 2 == 1) {
                ns.printf(`\u001b[38;2;0;255;13m${servs[servIndex] + nameSpaces} | ${ns.formatRam(rams[servIndex]) + totalRamSpaces} | ${ns.formatRam(ns.getServerUsedRam(servs[servIndex])) + usedRamSpaces} | ${ns.formatRam(rams[servIndex] - ns.getServerUsedRam(servs[servIndex]))}`)
            } else {
                ns.printf(`\u001b[38;2;173;255;139m${servs[servIndex] + nameSpaces} | ${ns.formatRam(rams[servIndex]) + totalRamSpaces} | ${ns.formatRam(ns.getServerUsedRam(servs[servIndex])) + usedRamSpaces} | ${ns.formatRam(rams[servIndex] - ns.getServerUsedRam(servs[servIndex]))}`)
            }
        }
        


        if (!allEqual(rams) && desiredRam > Math.min(...rams)) {
            for (let serv of servs) {
                if (ns.getPurchasedServerCost(desiredRam) < allowedMoney) {
                    ns.upgradePurchasedServer(serv, desiredRam)
                    ns.scp(['hack.js', 'grow.js', 'weaken.js'], serv, 'home')
                } else {
                    await ns.sleep(300)
                    break
                }
            }
        } else {

            desiredRam = (ns.getServerMaxRam(servs[0]) * 2)
            if (desiredRam > 2 ** 20) {
                return
            }
            ns.upgradePurchasedServer(servs[0], desiredRam)
        }


        await ns.sleep(150)
    }
}

async function purchase(ns: NS) {
    const ram = 16;
    while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
        for (let i:any = 0; i < ns.getPurchasedServerLimit(); i++) {
            if (ns.getPurchasedServerCost(ram) > ns.getServerMoneyAvailable('home') && ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
                await ns.sleep(20)
                break
            }
            var name = 'pserv-' + i
            ns.purchaseServer(name, ram)
            ns.scp(['hack.js', 'grow.js', 'weaken.js'], name, 'home')

            await ns.sleep(20)
        }
        await ns.sleep(2000)
    }
    for (let i in ns.getPurchasedServers()) {
        var wantedName = 'pserv-' + i
        var actualName = ns.getPurchasedServers()[i]
        if (wantedName != actualName) {
            ns.renamePurchasedServer(ns.getPurchasedServers()[i], wantedName)
        }
    }
}
