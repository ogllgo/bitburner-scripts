import { NS } from '@ns';

export async function main(ns: NS) {
    var things = [];
    const thingsToAdd = randomInteger(1, 15)
    ns.tprint(thingsToAdd)
    for (let i = 0; i < thingsToAdd; i++) {
        things.push(randomInteger(1, 100))
    }
    ns.tprint(things)
    ns.tprint(findAverage(things))
}

function randomInteger(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function findAverage(arr:number[]) {
    var average = 0;
    arr.forEach(element => {average += element})
    average /= arr.length
    return average
}