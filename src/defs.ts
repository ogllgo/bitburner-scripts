import { NS } from "@ns";

export class Server {
    public name: string;
    public ram: number;
    public level: number;
    public value: number;
    public maxRam: number;
    constructor (name: string, ns: NS) {
        this.name = name;
        const homeReserved = Math.max(ns.getServerMaxRam('home') - ns.getServerUsedRam('home') / 10, 64);
        this.maxRam = name != 'home' ? ns.getServerMaxRam(name) : Math.max(ns.getServerMaxMoney(name) - homeReserved, 0);
        this.ram = Math.max(this.maxRam - ns.getServerUsedRam(name), 0);
        this.level = ns.getServerRequiredHackingLevel(name);
        this.value = ns.getHackingLevel() - 2 > this.level && getRoot(this.name, ns)? ns.getServerMaxMoney(name) / (ns.getWeakenTime(name) / 25 + ns.getServerMinSecurityLevel(name) + ns.getServerSecurityLevel(name) * 0.01 + Math.log2(ns.getHackingLevel() - this.level)) : 0;
    }
}
export function chooseServer(servers:Server[], ns: NS) {
    let hacking = ns.getHackingLevel();

    // the game is boring if you need to prep for years
    if (hacking <= 50) {
        return new Server('joesguns', ns); // joesguns is the best exp server, always
    }
    // make 'values' the values of every server
    let values = servers.map(serv => serv.value);

    // return the index of the highest value in the servers
    return servers[values.indexOf(Math.max(...values))];
}
export function scan(ns: NS) {
    let servers = ['home', ...ns.scan('home')]
    for (let i = 1; i < servers.length; i++) {
        servers.push(...ns.scan(servers[i]).slice(1))
    }
    let objServs:Server[] = []; servers.forEach(server => objServs.push(new Server(server, ns)))
    return objServs
}

export function getRoot(server: string, ns: NS) {
    if (ns.hasRootAccess(server)) {
        return true;
    }
    let openPorts = 0;
    let reqPorts = ns.getServerNumPortsRequired(server);

    if (ns.fileExists('brutessh.exe'))  {ns.brutessh(server);  openPorts++;}
    if (ns.fileExists('ftpcrack.exe'))  {ns.ftpcrack(server);  openPorts++;}
    if (ns.fileExists('relaysmtp.exe')) {ns.relaysmtp(server); openPorts++;}
    if (ns.fileExists('httpworm.exe'))  {ns.httpworm(server);  openPorts++;}
    if (ns.fileExists('sqlinject.exe')) {ns.sqlinject(server); openPorts++;}
    if (openPorts >= reqPorts) {
        ns.nuke(server);
        return true;
    }
    return false;
}

export function getBackdoor(server: Server, ns: NS): boolean | number {
    if (!getRoot(server.name, ns)) {
        return false;
    }
    if (ns.getServerRequiredHackingLevel(server.name) > ns.getPlayer().skills.hacking) {
        return false;
    }
    if (ns.getServer(server.name).backdoorInstalled || ns.getServer(server.name).purchasedByPlayer) {
        return true;
    }
    ns.singularity.connect('home');
    // make a backdoor script to run outside this one
    let connections = [server.name]; // start it flipped
    while (connections[connections.length - 1] != 'home') {
        connections.push(ns.scan(connections[connections.length - 1])[0]);
    }
    connections.reverse();

    const fileName = "temp/backDoor/" + server.name + ".js"; // keep track of the fileName
    ns.write(fileName, `export async function main(ns) {
  const connections = ${JSON.stringify(connections)};
  for (const connection of connections) {
    ns.singularity.connect(connection);
  }
  await ns.singularity.installBackdoor();
  
  ns.toast("backdoored ${connections[connections.length - 1]}", "success");
  ns.writePort(ns.getRunningScript()!.pid, true);
}`, "w");
    const pid = ns.run(fileName);
    return pid;
}