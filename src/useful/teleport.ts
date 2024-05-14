import { NS } from "@ns";
import { scan } from "../defs";
export async function main(ns: NS) {
    const sing = ns.singularity;

    const servList = scan(ns).map(serv => serv.name);
    const target = String(ns.args[0]);
    if (ns.getServer(target).backdoorInstalled) {
        sing.connect(target);
        return;
    }
    if (ns.scan(target)[0] == "home") { // scan(home).includes(target) works as well but is less efficient
        sing.connect('home');
        sing.connect(target);
        return
    }
    let connections = [target]; // start it flipped
    while (connections[connections.length - 1] != 'home') {
        connections.push(ns.scan(connections[connections.length - 1])[0]);
    }
    connections.reverse();
    ns.tprint(connections);
    for (const connection of connections) {
        sing.connect(connection);
    }
}