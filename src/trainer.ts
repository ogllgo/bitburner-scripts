import { NS } from "@ns";

export async function main(ns: NS) {
    ns.tail()
    let player = ns.getPlayer().skills
    let thresholds = [ // different thresholds for different factions
        30,            // Slum Snakes
        75,            // Tetrads
        200,           // The Syndicate
        300,           // Speakers for the Dead, The Dark Army
        850,           // The Covenant
        1200,          // Illuminati
        1500,          // Daedalus
        Infinity       // Always good to be training
    ]
    let threshold = thresholds[0]
    let work = 4 // initializes to 4 in order to avoid some tomfoolery
    while (true) {
        player = ns.getPlayer().skills
        let agi = player.agility
        let str = player.strength
        let dex = player.dexterity
        let def = player.defense
        if (threshold <= 1500) { // if we're before Infinity
            // ns.tprint(threshold)
            if (agi < threshold || str < threshold || dex < threshold || def < threshold) {
                if (agi < threshold) {// train the stats to requirement, one by one
                    if (work != 0) {
                        ns.singularity.gymWorkout('powerhouse gym', 'agility')
                        work = 0
                        continue;
                    } else {
                        // ns.tprint(`${work} == 0`)
                    }
                } else if (str < threshold) {
                    if (work != 1) {
                        ns.singularity.gymWorkout('powerhouse gym', 'strength')
                        work = 1
                        continue;
                    } else {
                        // ns.tprint(`${work} == 1`)
                    }
                } else if (dex < threshold) {
                    if (work != 2) {
                        ns.singularity.gymWorkout('powerhouse gym', 'dexterity')
                        work = 2
                        continue;
                    } else {
                        // ns.tprint(`${work} == 2`)
                    }
                } else if (def < threshold) {
                    if (work != 3) {
                        ns.singularity.gymWorkout('powerhouse gym', 'defense')
                        work = 3
                        continue;
                    } else {
                        // ns.tprint(`${work} == 3`)
                    }
                }
            } else if (agi >= threshold && str >= threshold && dex >= threshold && def >= threshold){
                threshold = thresholds[thresholds.indexOf(threshold) + 1]
            }
        } else { // this would just train one stat endlessly, so we train the lowest stat
            if (agi < str && agi < dex && agi < def) {
                if (work != 0) {
                    ns.singularity.gymWorkout('powerhouse gym', 'agility')
                    work = 0
                }
            } else if (str < agi && str < dex && str < def) {
                if (work != 1) {
                    ns.singularity.gymWorkout('powerhouse gym', 'strength')
                    work = 1
                }
            } else if (dex < agi && dex < str && dex < def) {
                if (work != 2) {
                    ns.singularity.gymWorkout('powerhouse gym', 'strength')
                    work = 2
                }
            } else if (def < agi && def < dex && def < str) {
                if (work != 3) {
                    ns.singularity.gymWorkout('powerhouse gym', 'defense')
                    work = 3
                }
            }
        }
        await ns.sleep(20)
    }
}