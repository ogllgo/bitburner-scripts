import { NS } from "@ns";

export async function main(ns: NS) {
    ns.tail()
    const symbols = ' AWEO9IU8JRFW8T(*%$#'.split('')
    ns.disableLog('sleep')
    symbols.push(`'`)
    ns.clearLog()
    while (true) {
        let printStatements = [];
        while (printStatements.length < 2) {
            let printStatement = [];
            const limit = 1000
            for (let i = 0; i < limit; i++) {
                printStatement.push([symbols[randomInt(symbols.length)]])
            }
            printStatements.push(printStatement.join().trim().replaceAll(',', ''))
        }
        let printText = printStatements.join().trim().replaceAll(',', '')
        ns.tprint(`${printText}`)
        await ns.sleep(200)
    }
}

function randomInt(max:number) { // min and max included 
    return Math.floor(Math.random() * max)
}