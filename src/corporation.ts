// this isn't mine! i will use this to make my own, but still - I DON'T CLAIM TO HAVE MADE THIS!
export async function main(ns) {
	/*
	* Easy-Mode Bitburner Corporation Script for BN3.
	* Based off of the BN3 Quick-Start Guide by DarkTechnomancer.
	* Bitnode Corp Valuation modifiers are not taken into consideration.
	* Usage outside of BN1 or BN3 not guaranteed.
	* Script developed with a stage-by-stage approach to allow users to:
	* - understand the corporation development process from creation to printing money
	*	- see where your corporation is being stalled at (if modified or outside of BN1 or BN3)
	* Functions are designed to return true once their conditions are met or exceeded. This 
	* ensures we can restart the script as many times as needed with no issues.
	* Comments added to many portions of the script to try to explain my thought process.
	* Run script with "true" as arg0 to enable milestone logging to terminal.
	* todo: purchase the other unlocks when affordable
	* todo: refactor everything to make it look nicer
	*/
	ns.tail();
	ns.disableLog('ALL');
	ns.clearLog();
	const corp = _getCorp();
	const investAmounts = {
		1: 31e10, // 310b
		2: 31e11, // 3.1t
		3: 12e12, // 12t
		4: 5e14	 // 500t
	}
	// budget constraints for lategame upgrades. set to 1 to always use max money
	const upgradeBudget = 0.20;
	const storageBudget = 0.05;
	const officeBudgetAgri = 0.1;
	const officeBudgetChem = 0.1;
	const officeBudgetTbb = 0.50;
	let terminalLogging = false;
	if (ns.args[0] == true) terminalLogging = true;
	let corpName = "CorpName";
	let divAgr = "Agriculture";
	let divChem = "Chemical";
	let divTbb = "Tobacco";
	let bn = ns.getResetInfo().currentNode;
	let state = 0;
	let bestOffer = 0;
	let milestone = 1;
	const cityNames = {
		Aevum: "Aevum",
		Chongqing: "Chongqing",
		Sector12: "Sector-12",
		NewTokyo: "New Tokyo",
		Ishima: "Ishima",
		Volhaven: "Volhaven"
	}
	const prodCity = cityNames.Sector12;
	const industryNames = {
		WaterUtil: "Water Utilities",
		SpringWater: "Spring Water",
		Agriculture: "Agriculture",
		Fishing: "Fishing",
		Mining: "Mining",
		Refining: "Refinery",
		Restaurant: "Restaurant",
		Tobacco: "Tobacco",
		Chemical: "Chemical",
		Pharmaceutical: "Pharmaceutical",
		ComputerHardware: "Computer Hardware",
		Robotics: "Robotics",
		Software: "Software",
		Healthcare: "Healthcare",
		RealEstate: "Real Estate"
	}
	const materialNames = {
		Water: "Water",
		Ore: "Ore",
		Minerals: "Minerals",
		Food: "Food",
		Plants: "Plants",
		Metal: "Metal",
		Hardware: "Hardware",
		Chemicals: "Chemicals",
		Drugs: "Drugs",
		Robots: "Robots",
		AiCores: "AI Cores",
		RealEstate: "Real Estate"
	}
	const jobNames = {
		Operations: "Operations",
		Engineer: "Engineer",
		Business: "Business",
		Management: "Management",
		RandD: "Research & Development",
		Intern: "Intern",
		Unassigned: "Unassigned"
	}
	const researchNames = {
		Lab: "Hi-Tech R&D Laboratory",
		AutoBrew: "AutoBrew",
		AutoParty: "AutoPartyManager",
		AutoDrug: "Automatic Drug Administration",
		CPH4Inject: "CPH4 Injections",
		Drones: "Drones",
		DronesAssembly: "Drones - Assembly",
		DronesTransport: "Drones - Transport",
		GoJuice: "Go-Juice",
		RecruitHR: "HRBuddy-Recruitment",
		TrainingHR: "HRBuddy-Training",
		MarketTa1: "Market-TA.I",
		MarketTa2: "Market-TA.II",
		Overclock: "Overclock",
		SelfCorrectAssemblers: "Self-Correcting Assemblers",
		Stimu: "Sti.mu",
		Capacity1: "uPgrade: Capacity.I",
		Capacity2: "uPgrade: Capacity.II",
		Dashboard: "uPgrade: Dashboard",
		Fulcrum: "uPgrade: Fulcrum"
	}
	const upgradeNames = {
		SmartFactories: "Smart Factories",
		SmartStorage: "Smart Storage",
		DreamSense: "DreamSense",
		WilsonAnalytics: "Wilson Analytics",
		NuoptimalNootropicInjectorImplants: "Nuoptimal Nootropic Injector Implants",
		SpeechProcessorImplants: "Speech Processor Implants",
		NeuralAccelerators: "Neural Accelerators",
		FocusWires: "FocusWires",
		ABCSalesBots: "ABC SalesBots",
		ProjectInsight: "Project Insight"
	}
	const unlockNames = {
		Export: "Export",
		SmartSupply: "Smart Supply",
		MarketResearchDemand: "Market Research - Demand",
		MarketDataCompetition: "Market Data - Competition",
		VeChain: "VeChain",
		ShadyAccounting: "Shady Accounting",
		GovernmentPartnership: "Government Partnership",
		WarehouseAPI: "Warehouse API",
		OfficeAPI: "Office API"
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	// script startup. we run this before we enter the main while() loop
	if (!corp.hasCorporation()) {
		let created = false;
		while (created == false) {
			if (bn == 3) {
				created = corp.createCorporation(corpName, false);
			} else {
				if (ns.getPlayer().money > 15e10) {
					created = corp.createCorporation(corpName, true);
				} else {
					ns.print("Not enough funds to create a corp yet.");
					await ns.sleep(10000);
				}
			}
		}
		state = 1;
	} else {
		state = 1;
		// update our name variables in case the player already has a corp
		corpName = corp.getCorporation().name;
		let divs = corp.getCorporation().divisions;
		for (let i = 0; i < divs.length; i++) {
			let cdiv = corp.getDivision(divs[i]);
			if (cdiv.type == industryNames.Agriculture) { divAgr = cdiv.name; continue; };
			if (cdiv.type == industryNames.Chemical) { divChem = cdiv.name; continue; };
			if (cdiv.type == industryNames.Tobacco) { divTbb = cdiv.name; continue; };
		}
	}
	// purchase and enable smart supply, not using any fancy formulas
	if (!corp.hasUnlock(unlockNames.SmartSupply) && (corp.getCorporation().funds > corp.getUnlockCost(unlockNames.SmartSupply))) {
		corp.purchaseUnlock(unlockNames.SmartSupply);
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	while (true) {
		//ns.resizeTail(600, 250);	//resizeTail() is used to refresh the tail window faster than normal
		ns.clearLog();
		ns.printf("Script state: %i", state);
		ns.printf("Runtime: %s", ns.tFormat(ns.getRunningScript().onlineRunningTime * 1000));
		ns.printf("Revenue: $%s/sec", ns.formatNumber(corp.getCorporation().revenue));
		tendToWorkers();
		printMilestones(milestone);
		let juiced = 0;
		switch (state) {
			case 1: // expand into our first division, agriculture
				if (expandNewDivision(industryNames.Agriculture, divAgr)) state++;
				break;
			case 2: // expand the warehouses in each city
				if (expandWarehouse(divAgr, 5)) setSellPrices(); state++;
				break;
			case 3: // buy our first advert and get the first levels of storage upgrade
				if (corp.getHireAdVertCount(divAgr) == 0) corp.hireAdVert(divAgr);
				if (purchaseUpgrade(upgradeNames.SmartStorage, false, 3)) state++;
				break;
			case 4: // expand our offices
				if (expandOffice(divAgr, 3, false)) state++;
				break;
			case 5: // hire and distribute employees for a few initial research points
				// We check against current number of employees to determine if we've already passed
				// this stage in the script (i.e if it has already been ran previously). This way we
				// don't accidently end up with unassigned employees.
				if (corp.getOffice(divAgr, cityNames.Volhaven).numEmployees == 3) {
					assignJobs(divAgr, 0, 0, 0, 0, 0, false);
					if (assignJobs(divAgr, 1, 1, 0, 0, 1, false)) state++;
				} else state++;
				break;
			case 6: // wait for employee stats
				for (let city of Object.values(cityNames)) {
					if (corp.getOffice(divAgr, city).avgEnergy > 98 && corp.getOffice(divAgr, city).avgMorale > 98) juiced++;
				}
				if (juiced == 6) state++;
				break;
			case 7: // purchase our materials. brute forces it, no need to wait on corp states.
				if (purchaseMats(divAgr, { "Hardware": 1060, "AI Cores": 1234, "Real Estate": 74392 })) state++;
				break;
			case 8: // redistribute our employees for money gain
				if (corp.getOffice(divAgr, cityNames.Volhaven).numEmployees == 3) {
					assignJobs(divAgr, 0, 0, 0, 0, 0, false);
					if (assignJobs(divAgr, 1, 1, 1, 0, 0, false)) state++;
				} else state++;
				break;
			case 9: // wait for our first investment
				if (waitForInvestment(1)) state++;
				break;
			case 10: // expand warehouses again
				if (expandWarehouse(divAgr, 10)) setSellPrices(); state++;
				break;
			case 11: // hire more employees
				if (expandOffice(divAgr, 15, false)) state++;
				break;
			case 12: // assign them
				if (corp.getOffice(divAgr, cityNames.Volhaven).numEmployees == 15) {
					assignJobs(divAgr, 0, 0, 0, 0, 0, false);
					if (assignJobs(divAgr, 5, 3, 5, 1, 1, false)) state++;
				} else state++;
				break;
			case 13: // purchase more levels of smart storage and smart factories
				purchaseUpgrade(upgradeNames.SmartStorage, false, 10);
				purchaseUpgrade(upgradeNames.SmartFactories, false, 10);
				for (let city of Object.values(cityNames)) {
					if (corp.getOffice(divAgr, city).avgEnergy > 95 && corp.getOffice(divAgr, city).avgMorale > 95) juiced++;
				}
				if (juiced == 6) state++;
				break;
			case 14: // second round of agri mats
				if (purchaseMats(divAgr, { "Hardware": 2800, "Robots": 96, "AI Cores": 2520, "Real Estate": 146400 })) state++;
				break;
			case 15: // buy 4 levels of the employee upgrades and wait for 2nd round investment
				// script will sometimes hang here depending on starting employee stats.
				// it will eventually move on. todo: improve up to this point
				bideTimeForInvestment(1);
				if (waitForInvestment(2)) state++;
				break;
			case 16: // final agri warehouse upgrades
				if (expandWarehouse(divAgr, 25)) setSellPrices(); state++;
				break;
			case 17: // more smart storage & factory upgrades
				if (purchaseUpgrade(upgradeNames.SmartStorage, false, 20) && purchaseUpgrade(upgradeNames.SmartFactories, false, 20)) state++;
				break;
			case 18: // fill our agri warehouses, 501 prod mult
				if (purchaseMats(divAgr, { "Hardware": 9300, "Robots": 726, "AI Cores": 6270, "Real Estate": 230400 })) state++;
				break;
			/*	
			* Most stages beyond this point aren't included in the guide and are very likely unoptimized.
			* Poke around and post your results/improvements in the official Bitburner discord!
			*/
			case 19: // hire the rest of our agri employees
				if (expandOffice(divAgr, 30, false)) state++;
				break;
			case 20: // assign them
				if (corp.getOffice(divAgr, cityNames.Volhaven).numEmployees == 30) {
					assignJobs(divAgr, 0, 0, 0, 0, 0, false);
					if (assignJobs(divAgr, 10, 6, 10, 2, 2, false)) state++;
				} else state++;
				break;
			case 21: // purchase exporting
				if (!corp.hasUnlock(unlockNames.Export)) {
					corp.purchaseUnlock(unlockNames.Export);
				}
				if (expandNewDivision(industryNames.Chemical, divChem)) state++;
				break;
			case 22: // expand into chem
				if (expandWarehouse(divChem, 1)) setSellPrices(); state++;
				break;
			case 23: // expand chem office
				if (expandOffice(divChem, 40, false)) state++;
				break;
			case 24: // hire chem employees
				if (corp.getOffice(divChem, cityNames.Volhaven).numEmployees == 40) {
					assignJobs(divChem, 0, 0, 0, 0, 0, false);
					if (assignJobs(divChem, 23, 15, 0, 1, 1, false)) state++;
				} else state++;
				break;
			case 25: // expand into tobacco
				if (expandNewDivision(industryNames.Tobacco, divTbb)) state++;
				break;
			case 26: // tobacco warehouses
				if (expandWarehouse(divTbb, 1)) state++;
				break;
			case 27: // expand tobacco offices in our non-product cities
				if (expandOffice(divTbb, 40, false)) state++;
				break;
			case 28: //  expand tobacco offices in our product development city
				if (expandOffice(divTbb, 80, true)) state++;
				break;
			case 29: // assign employees in research slave cities
				if (corp.getOffice(divTbb, cityNames.Volhaven).numEmployees == 40) {
					assignJobs(divTbb, 0, 0, 0, 0, 0, false);
					if (assignJobs(divTbb, 1, 1, 1, 1, 36, false)) state++;
				} else state++;
				break;
			case 30: // assign employees in product development city
				if (corp.getOffice(divTbb, prodCity).numEmployees == 80) {
					assignJobs(divTbb, 0, 0, 0, 0, 0, true);
					if (assignJobs(divTbb, 25, 25, 10, 20, 0, true)) state++;
				} else state++;
				break;
			case 31: // create our initial products and set up exports
				maintainProducts();
				exportMaterials(divAgr, materialNames.Plants, divTbb, "-IPROD");
				exportMaterials(divAgr, materialNames.Plants, divChem, "-IPROD");
				exportMaterials(divChem, materialNames.Chemicals, divAgr, "-IPROD");
				state++;
				break;
			case 32: // more employee upgrades
				maintainProducts();
				if (purchaseUpgrade(upgradeNames.SmartStorage, false, 25)) {
					if (purchaseUpgrade(upgradeNames.SmartFactories, false, 25)) {
						if (purchaseUpgrade(upgradeNames.ABCSalesBots, false, 25)) {
							if (purchaseUpgrade(upgradeNames.FocusWires, false, 25)) {
								if (purchaseUpgrade(upgradeNames.NeuralAccelerators, false, 25)) {
									if (purchaseUpgrade(upgradeNames.NuoptimalNootropicInjectorImplants, false, 25)) {
										if (purchaseUpgrade(upgradeNames.SpeechProcessorImplants, false, 25)) {
											state++;
										}
									}
								}
							}
						}
					}
				}
				break;
			case 33: // 3rd investment round
				maintainProducts();
				bideTimeForInvestment(2);
				if (waitForInvestment(3)) state++;
				break;
			case 34: // upgrade tobacco offices
				maintainProducts();
				if (expandOffice(divTbb, 100, false)) state++;
				break;
			case 35: // hire and redistribute workers
				maintainProducts();
				if (corp.getOffice(divTbb, cityNames.Volhaven).numEmployees == 100) {
					assignJobs(divTbb, 0, 0, 0, 0, 0, false);
					if (assignJobs(divTbb, 1, 1, 1, 1, 96, false)) {
						assignJobs(divTbb, 0, 0, 0, 0, 0, true);
						if (assignJobs(divTbb, 28, 28, 16, 28, 0, true)) {
							state++;
						}
					}
				} else state++;
				break;
			case 36: // pump project insight for research points bonus then emp upgrades
				maintainProducts();
				if (waitForResearch(divTbb, 1)) {
					state++;
					if (terminalLogging === true) {
						ns.tprintf("10k research obtained at %s", ns.tFormat(ns.getRunningScript().onlineRunningTime * 1000));
					}
				}
				maintainUpgrades(true);
				break;
			case 37: // dump all our remaining cash into employee upgrades
				maintainProducts();
				maintainUpgrades(true);
				if (waitForResearch(divTbb, 2)) {
					state++;
					if (terminalLogging === true) {
						ns.tprintf("140k research obtained at %s", ns.tFormat(ns.getRunningScript().onlineRunningTime * 1000));
					}
				}
				break;
			case 38: // we now have marketTA2, time for 4th investment
				maintainProducts();
				maintainUpgrades();
				if (waitForInvestment(4)) state++;
				break;
			case 39: // go public and start leeching cash
				maintainProducts();
				maintainUpgrades();
				if (!corp.getCorporation().public) {
					corp.goPublic(0);
					corp.issueDividends(0.01);
					state++;
				} else state++;
				break;
			case 40: // dump our cash into wilson/adverts and begin upgrading offices
				maintainProducts();
				maintainUpgrades();
				maintainOffices(divTbb, 10);
				maintainOffices(divAgr, 10);
				maintainOffices(divChem, 10);
				if (wilsonTime(divTbb)) state++;
				break;
			case 41: // corp done, entering maintenance mode
				maintainProducts();
				maintainUpgrades();
				maintainOffices(divTbb, 10);
				maintainOffices(divAgr, 10);
				maintainOffices(divChem, 10);
				break;
			default:
				ns.tprint("hit the default case in corp script, something went wrong.");
				return;
		}
		await ns.sleep(200);
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	// helper functions
	function _getCorp() { // makes typing stuff easier
		return ns.corporation;
	}
	function tendToWorkers() { // keep our employees happy
		if (corp.getCorporation().divisions.length == 0) return;
		for (let div of corp.getCorporation().divisions) {
			for (let city of corp.getDivision(div).cities) {
				let morale = corp.getOffice(div, city).avgMorale;
				let partyFund = 500000 * (-morale + Math.sqrt((morale - 20) * morale + 4100) - 10);	//thanks DT
				if (corp.getOffice(div, city).avgEnergy < 99) corp.buyTea(div, city);
				if (corp.getOffice(div, city).avgMorale < 99) corp.throwParty(div, city, partyFund);
			}
		}
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	// designed to accept expansion into any industry
	function expandNewDivision(type = "", name = "") {
		let created = false;
		let presence = 0;
		let divs = corp.getCorporation().divisions;
		if (!divs.includes(name)) {
			let cost = corp.getIndustryData(type).startingCost;
			if (corp.getCorporation().funds > cost) {
				corp.expandIndustry(type, name);
				created = true;
			} else return false;
		} else created = true;
		for (let city of Object.values(cityNames)) {
			if (!corp.getDivision(name).cities.includes(city)) {
				if (corp.getCorporation().funds > 4e9) {
					corp.expandCity(name, city);
					presence++;
				}
			} else presence++;
		}
		if (created && presence == 6) return true;
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	function expandWarehouse(div = "", level = 1) {
		let upgraded = 0;
		let warehouses = 0;
		for (let city of Object.values(cityNames)) {
			if (!corp.hasWarehouse(div, city)) {
				if (corp.getCorporation().funds > 5e9) {
					corp.purchaseWarehouse(div, city);
					warehouses++;
				} else continue;
			} else warehouses++;
			// we make sure warehouses were purchased in each city
			let currentLevel = corp.getWarehouse(div, city).level;
			let levelsNeeded = level - currentLevel;
			if (levelsNeeded <= 0) {
				upgraded++;
				continue;
			}
			// and keep count of how many still need to be upgraded
			let cost = corp.getUpgradeWarehouseCost(div, city, levelsNeeded);
			if (corp.getCorporation().funds > cost) {
				corp.upgradeWarehouse(div, city, levelsNeeded);
				upgraded++;
			} // redundant smart supply check for safety
			if (!corp.getWarehouse(div, city).smartSupplyEnabled) { corp.setSmartSupply(div, city, true); }
		} // if we have all 6 warehouses and they're all at least at the level we want, return true
		if (upgraded == 6 && warehouses == 6) return true;
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	// Office expansion
	function expandOffice(div = "", toSize = 0, justProdCity = false) {
		let finished = 0;
		for (let city of Object.values(cityNames)) {
			if (justProdCity == true && city != prodCity) continue;
			let needed = toSize - corp.getOffice(div, city).size;
			if (needed > 0) {
				let cost = corp.getOfficeSizeUpgradeCost(div, city, needed);
				if (corp.getCorporation().funds > cost) {
					corp.upgradeOfficeSize(div, city, needed);
				} else {
					continue;
				}
			}
			while (corp.getOffice(div, city).numEmployees < corp.getOffice(div, city).size) {
				corp.hireEmployee(div, city);
			}
			if (corp.getOffice(div, city).numEmployees >= toSize) { finished++; }
		}
		if (finished == 6 || (finished == 1 && justProdCity)) return true;
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	// auto office expansion for late game, 10 for default step increase
	// todo: switch division type checks to account for all industry types
	// todo: detect and assign employees hired outside of the script
	function maintainOffices(div = "", stepSize = 10) {
		let highestN = 0;
		let atMax = 0;
		// first loop determines our highest office sizes in case it was somehow changed
		for (let city of Object.values(cityNames)) {
			let currentSize = corp.getOffice(div, city).size;
			if (highestN < currentSize || currentSize == 0) highestN = currentSize;
		}
		if (highestN % 10 > 0) { highestN += (10 - (highestN % 10)) };
		// second loop expands office to next step size + any overflow if we're at an odd number somehow
		for (let city of Object.values(cityNames)) {
			let currentSize = corp.getOffice(div, city).size;
			if (currentSize < highestN) {
				if (expandOffice(div, highestN, false)) atMax++;
			} else if (currentSize == highestN) atMax++;
		}
		if (atMax == 6) {
			let mult = 0;
			let cost = corp.getOfficeSizeUpgradeCost(div, prodCity, stepSize) * 6;
			let type = corp.getDivision(div).type;
			if (type == industryNames.Agriculture) { mult = officeBudgetAgri; }
			if (type == industryNames.Chemical) { mult = officeBudgetChem; }
			if (type == industryNames.Tobacco) { mult = officeBudgetTbb; }
			if (corp.getCorporation().funds * mult > cost) {
				if (expandOffice(div, highestN + stepSize, false)) {
					const divType = corp.getDivision(div).type;
					let size = corp.getOffice(div, prodCity).size;
					let remainder = 0;
					switch (divType) {
						case industryNames.Agriculture:
							remainder = size % 3;
							size -= remainder;
							assignJobs(div, 0, 0, 0, 0, 0, false);
							assignJobs(div, 0, (size / 3), 0, (size / 3), (size / 3) + remainder, false);
							break;
						case industryNames.Chemical:
							remainder = size % 3;
							size -= remainder;
							assignJobs(div, 0, 0, 0, 0, 0, false);
							assignJobs(div, 0, (size / 3), 0, (size / 3), (size / 3) + remainder, false);
							break;
						case industryNames.Tobacco:
							assignJobs(div, 0, 0, 0, 0, 0, false);
							assignJobs(div, 1, 1, 1, 1, size - 4, false);
							remainder = size % 4;
							size -= remainder;
							assignJobs(div, 0, 0, 0, 0, 0, true);
							assignJobs(div, (size / 4), (size / 4), (size / 4), (size / 4), remainder, true);
							break;
					}
				}
			}
		}
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	// job assigner
	function assignJobs(div = "", operations = 0, engineers = 0, buisness = 0, managers = 0, researchers = 0, justProdCity = false) {
		let assigned = 0; // used to ensure we've assigned all employees successfully
		for (let city of Object.values(cityNames)) {
			if (justProdCity == true && city != prodCity) continue;
			if (corp.setAutoJobAssignment(div, city, jobNames.Operations, operations)) assigned++;
			if (corp.setAutoJobAssignment(div, city, jobNames.Engineer, engineers)) assigned++;
			if (corp.setAutoJobAssignment(div, city, jobNames.Business, buisness)) assigned++;
			if (corp.setAutoJobAssignment(div, city, jobNames.Management, managers)) assigned++;
			if (corp.setAutoJobAssignment(div, city, jobNames.RandD, researchers)) assigned++;
		} // 6 cities * 5 jobs = 30, or just 5 if we're only assigning to our prod city
		if (assigned == 30 || (assigned == 5 && justProdCity)) return true;
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	// todo: swap the args for an object similar to buying materials??
	function purchaseUpgrade(name = "", single = false, toLevel = 1) {
		let curlevel = corp.getUpgradeLevel(name);
		if (single) {
			if (corp.getCorporation().funds > corp.getUpgradeLevelCost(name)) {
				corp.levelUpgrade(name);
				return true;
			}
		} else if (curlevel < toLevel) {
			if (corp.getCorporation().funds > corp.getUpgradeLevelCost(name)) {
				corp.levelUpgrade(name);
			}
		}
		if (corp.getUpgradeLevel(name) >= toLevel) return true;
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	// designed to pass in the amount you want to end up with and will calculate how much
	// it needs to buy. takes into consideration any amount you currently have.
	// materials{} format: { "MaterialName": Amount}
	function purchaseMats(div = "", materials = {}) {
		let finished = 0;
		for (let city of Object.values(cityNames)) {
			for (let [mat, amt] of Object.entries(materials)) {
				let n = corp.getMaterial(div, city, mat).stored;
				if (n < amt) {
					corp.buyMaterial(div, city, mat, (amt - n) / 10);
				}
				else if (n >= amt) {
					corp.buyMaterial(div, city, mat, 0);
					finished++;
				}
			}
		}
		if (finished == (Object.entries(materials).length * 6)) return true;
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	function waitForInvestment(round = 0) {
		if (corp.getInvestmentOffer().round != round) return true;
		let offer = corp.getInvestmentOffer().funds;
		if (offer > bestOffer) bestOffer = offer;
		ns.printf("Waiting for investment offer of $%s", ns.formatNumber(investAmounts[round]));
		ns.printf("Last offer: $%s", ns.formatNumber(offer));
		ns.printf("Best offer: $%s", ns.formatNumber(bestOffer));
		if (offer >= investAmounts[round]) {
			corp.acceptInvestmentOffer();
			if (terminalLogging == true) {
				ns.tprintf("Round %i offer accepted after %s", round, ns.tFormat(ns.getRunningScript().onlineRunningTime * 1000));
			}
			return true;
		}
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	// simple MAX/MP sell price if we don't have TA2. no fancy formulas here.
	// designed to handle all of a player's material-producing divisions
	function setSellPrices() {
		for (let div of corp.getCorporation().divisions) {
			if (corp.getDivision(div).makesProducts) continue;
			for (let city of Object.values(cityNames)) {
				if (!corp.hasWarehouse(div, city)) continue;
				let created = corp.getIndustryData(corp.getDivision(div).type).producedMaterials;
				for (let i = 0; i < created.length; i++) {
					if (corp.hasResearched(div, researchNames.MarketTa2)) {
						corp.setMaterialMarketTA2(div, city, created[i], true);
					} else {
						corp.sellMaterial(div, city, created[i], "MAX", "MP");
					}
				}
			}
		}
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	// this is ugly but it's only needed once so I'm just going to leave it as-is
	function bideTimeForInvestment(stage = 0) {
		switch (stage) {
			case 1:
				purchaseUpgrade(upgradeNames.DreamSense, false, 1);
				purchaseUpgrade(upgradeNames.ProjectInsight, false, 1);
				purchaseUpgrade(upgradeNames.ABCSalesBots, false, 5);
				purchaseUpgrade(upgradeNames.FocusWires, false, 5);
				purchaseUpgrade(upgradeNames.NeuralAccelerators, false, 5);
				purchaseUpgrade(upgradeNames.NuoptimalNootropicInjectorImplants, false, 5);
				purchaseUpgrade(upgradeNames.SpeechProcessorImplants, false, 5);
				break;
			case 2:
				purchaseUpgrade(upgradeNames.ProjectInsight, false, 10);
				purchaseUpgrade(upgradeNames.ABCSalesBots, false, 35);
				purchaseUpgrade(upgradeNames.FocusWires, false, 35);
				purchaseUpgrade(upgradeNames.NeuralAccelerators, false, 35);
				purchaseUpgrade(upgradeNames.NuoptimalNootropicInjectorImplants, false, 35);
				purchaseUpgrade(upgradeNames.SpeechProcessorImplants, false, 35);
				purchaseUpgrade(upgradeNames.SmartFactories, false, 30);
				purchaseUpgrade(upgradeNames.SmartStorage, false, 30);
				break;
		}
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	// designed to handle all of a player's product-producing divisions
	// no fancy price calculations, MAX/MP until we get TA2
	function maintainProducts() {
		let maxProducts = 3;
		let lowestR = 0;
		let lowestN = "";
		let finished = 0;
		for (let div of corp.getCorporation().divisions) {
			if (!corp.getDivision(div).makesProducts) continue;
			// capacity upgrade checks incase the player purchases them
			if (corp.hasResearched(div, researchNames.Capacity2)) { maxProducts = 5; }
			else if (corp.hasResearched(div, researchNames.Capacity1)) { maxProducts = 4; };
			let currentProducts = corp.getDivision(div).products;
			if (currentProducts.length < maxProducts) {
				if (corp.getCorporation().funds > 2e9) {
					// no fancy naming scheme, just grab a timestamp and slap it on the label
					corp.makeProduct(div, prodCity, performance.now().toFixed(0), 1e9, 1e9);
				}
			}
			for (let n of currentProducts) {
				// loop our products to find the one with lowest rating
				let product = corp.getProduct(div, prodCity, n);
				if (product.developmentProgress == 100) finished++;
				if (corp.hasResearched(div, researchNames.MarketTa2)) {
					corp.setProductMarketTA2(div, product.name, true);
				} else corp.sellProduct(div, prodCity, product.name, "MAX", "MP", true);
				if (product.rating < lowestR || lowestR == 0) {
					lowestR = product.rating;
					lowestN = product.name;
				}
			}
			if (finished == maxProducts && corp.getCorporation().funds > 2e9) {
				// delete worst product if we can create a new one
				corp.discontinueProduct(div, lowestN);
			}
		}
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	function exportMaterials(fromDivision = "", materialName = "", toDivision = "", amount = 0) {
		for (let city of Object.values(cityNames)) {
			// cancel all current exports so we don't end up with duplicates or errors
			corp.cancelExportMaterial(fromDivision, city, toDivision, city, materialName);
			// reassign them after
			corp.exportMaterial(fromDivision, city, toDivision, city, materialName, amount);
		}
		return true;
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	function waitForResearch(div = "", stage = 0) {
		while (corp.getCorporation().funds > corp.getUpgradeLevelCost(upgradeNames.ProjectInsight)) {
			corp.levelUpgrade(upgradeNames.ProjectInsight);
		}
		switch (stage) {
			case 1:
				if (corp.hasResearched(div, researchNames.Lab)) return true;
				ns.printf("Research: %s / 10000", corp.getDivision(div).researchPoints.toFixed(0));
				if (corp.getDivision(div).researchPoints > 10000 && !corp.hasResearched(div, researchNames.Lab)) {
					corp.research(div, researchNames.Lab);
					return true;
				}
				break;
			case 2:
				if (corp.hasResearched(div, researchNames.MarketTa2)) return true;
				ns.printf("Research: %s / 140000", corp.getDivision(div).researchPoints.toFixed(0));
				if (corp.getDivision(div).researchPoints > 140000) {
					corp.research(div, researchNames.MarketTa1);
					corp.research(div, researchNames.MarketTa2);
					return true;
				}
				break;
		}
		return false;
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	function wilsonTime(div = "") {
		// return if awareness or popularity are already capped
		if (corp.getDivision(div).awareness >= 1.798e+307 && corp.getDivision(div).popularity >= 1.798e+307) return true;
		if (corp.getCorporation().funds > corp.getUpgradeLevelCost(upgradeNames.WilsonAnalytics)) {
			corp.levelUpgrade(upgradeNames.WilsonAnalytics);
		}
		if (corp.getCorporation().funds > corp.getHireAdVertCost(div)) {
			corp.hireAdVert(div);
		}
		return false;
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	// todo: make this try/catch block look better
	function maintainUpgrades(allMoney = false) {
		try {
			if (!corp.hasResearched(divAgr, researchNames.Lab)) corp.research(divAgr, researchNames.Lab);
			if (!corp.hasResearched(divAgr, researchNames.AutoBrew)) corp.research(divAgr, researchNames.AutoBrew);
			if (!corp.hasResearched(divAgr, researchNames.AutoParty)) corp.research(divAgr, researchNames.AutoParty);
			if (!corp.hasResearched(divChem, researchNames.Lab)) corp.research(divChem, researchNames.Lab);
			if (!corp.hasResearched(divChem, researchNames.AutoBrew)) corp.research(divChem, researchNames.AutoBrew);
			if (!corp.hasResearched(divChem, researchNames.AutoParty)) corp.research(divChem, researchNames.AutoParty);
			if (corp.hasResearched(divTbb, researchNames.MarketTa2) && corp.getDivision(divTbb).researchPoints > 150000) {
				if (!corp.hasResearched(divTbb, researchNames.AutoBrew)) corp.research(divTbb, researchNames.AutoBrew);
				if (!corp.hasResearched(divTbb, researchNames.AutoParty)) corp.research(divTbb, researchNames.AutoParty);
				if (!corp.hasResearched(divTbb, researchNames.Fulcrum)) corp.research(divTbb, researchNames.Fulcrum);
				if (!corp.hasResearched(divTbb, researchNames.Capacity1)) corp.research(divTbb, researchNames.Capacity1);
				if (!corp.hasResearched(divTbb, researchNames.Capacity2)) corp.research(divTbb, researchNames.Capacity2);
				if (!corp.hasResearched(divTbb, researchNames.Dashboard)) corp.research(divTbb, researchNames.Dashboard);
			}
		} catch { }
		for (let upgrade of Object.values(upgradeNames)) {
			if (upgrade === upgradeNames.DreamSense || upgrade === upgradeNames.WilsonAnalytics || upgrade === upgradeNames.ProjectInsight) {
				continue; // skip these upgrades
			}
			if (upgrade === upgradeNames.SmartStorage) {
				if ((corp.getCorporation().funds * storageBudget) > corp.getUpgradeLevelCost(upgrade)) {
					corp.levelUpgrade(upgrade); // use a configurable amount of our cash on smart storage
				}
			} else if ((corp.getCorporation().funds * (allMoney ? 1 : upgradeBudget)) > corp.getUpgradeLevelCost(upgrade)) {
				corp.levelUpgrade(upgrade); // use a configurable amount of our cash on employee upgrades
			}
		}
		for (let city of Object.values(cityNames)) {
			if (corp.getWarehouse(divTbb, city).sizeUsed / corp.getWarehouse(divTbb, city).size > 0.70) {
				if (corp.getCorporation().funds > corp.getUpgradeWarehouseCost(divTbb, city)) {
					corp.upgradeWarehouse(divTbb, city);
				}
			}
		}
	}
	///////////////////////////////////////////////////////////////////////////////////////////
	function printMilestones(num = 0) {
		if (terminalLogging === false) return;
		const revenue = corp.getCorporation().revenue;
		const goal = parseFloat("1e" + num + "0");
		ns.printf("Next revenue milestone: $%s/sec", ns.formatNumber(goal));
		if (revenue > goal) {
			ns.tprintf("Revenue of $%s/sec obtained after %s", ns.formatNumber(revenue), ns.tFormat(ns.getRunningScript().onlineRunningTime * 1000));
			milestone++;
		}
	}
}
