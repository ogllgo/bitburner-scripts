import { NS } from "@ns";
export async function main(ns: NS) {
    const location = 'files/data/dummy.js';
    const connections = ["home", "sigma-cosmetics", "max-hardware"];
    ns.write(location, `export async function main(ns) {
  const connections = ${JSON.stringify(connections)};
  for (const connection of connections) {
    ns.singularity.connect(connection);
  }
  await ns.singularity.installBackdoor();
  ns.toast("backdoored ${connections[connections.length - 1]}", "success");
}`, "w");
    ns.tprint(ns.read(location));
}