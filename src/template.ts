import { NS } from '@ns';

export async function main(ns: NS) {
  ns.tprint(ns.gang.getGangInformation().wantedPenalty * 10000)
}