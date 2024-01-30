import { NS } from '@ns';

export async function main(ns: NS) {
    while (true) {
        const totalSleeves:any = ns.sleeve.getNumSleeves() // -1 because it's the length of the sleeves, not highest index of the sleeves
        for (let currentSleeve = 0; currentSleeve < totalSleeves; currentSleeve++) {
            let sleeveInfo = ns.sleeve.getSleeve(currentSleeve);
            let task = ns.sleeve.getTask(currentSleeve)?.type;
            let karma = ns.heart.break();
            if (sleeveInfo.shock > 0) { // recovery check, for work effectiveness
                if (task != 'RECOVERY') {
                    ns.sleeve.setToShockRecovery(currentSleeve)
                    ns.tprint(`set sleeve ${currentSleeve + 1} to shock recovery`)
                }
            } else if (sleeveInfo.sync < 100) { // syncro check, for skill gain
                if (task != 'SYNCHRO') {
                    ns.sleeve.setToSynchronize(currentSleeve)
                    ns.tprint(`set sleeve ${currentSleeve + 1} to synchronize`)
                }
            } else if (karma > -54000 && !ns.gang.inGang()) { // gang check
                if (task != 'CRIME') {
                    ns.sleeve.setToCommitCrime(currentSleeve, 'Homicide')
                    ns.tprint(`set sleeve ${currentSleeve + 1} to homicide`)
                }
            } else if (ns.getPlayer().skills.strength < 100) {
                if (task != 'CLASS') {
                    if (ns.sleeve.travel(currentSleeve, 'Sector-12')) {
                        ns.sleeve.setToGymWorkout(currentSleeve, 'Iron-Gym', 'STRENGTH')
                    }
                }
            } else if (ns.getPlayer().skills.agility < 100) {
                if (task != 'CLASS') {
                    if (ns.sleeve.travel(currentSleeve, 'Sector-12')) {
                        ns.sleeve.setToGymWorkout(currentSleeve, 'Iron-Gym', 'AGILITY')
                    }
                }
            } else if (ns.getPlayer().skills.defense < 100) {
                if (task != 'CLASS') {
                    if (ns.sleeve.travel(currentSleeve, 'Sector-12')) {
                        ns.sleeve.setToGymWorkout(currentSleeve, 'Iron-Gym', 'DEFENSE')
                    }
                }
            } else if (ns.getPlayer().skills.dexterity < 100) {
                if (task != 'CLASS') {
                    if (ns.sleeve.travel(currentSleeve, 'Sector-12')) {
                        ns.sleeve.setToGymWorkout(currentSleeve, 'Iron-Gym', 'DEXTERITY')
                    }
                }
            } else {
                if (task != 'CRIME') {
                    ns.sleeve.setToCommitCrime(currentSleeve, 'Homicide')
                    ns.tprint(`set sleeve ${currentSleeve + 1} to homicide`)
                }
            }
        }
        await ns.sleep(200)
    }
}