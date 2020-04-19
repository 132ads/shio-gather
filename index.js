module.exports = function Gathering(mod) {
	let plantsMarkers = false,
		miningMarkers = false,
		energyMarkers = false,
		plants = false,
		mining = false,
		energy = false,
		egg = true
	
	let mobid = [],
		gatherMarker = []

	function gatheringStatus() {
		sendMessage("\nGathering: "+ (mod.settings.enabled      ? "On"   : "Off") + "\nAlerts: " + (mod.settings.sendToAlert  ? "Enabled" : "Disabled") + "\nPlants: " + (plantsMarkers ? "Visible" : "Hidden") + "\nOres: " + (miningMarkers ? "Visible" : "Hidden") + "\nEssences: " + (energyMarkers ? "Visible" : "Hidden")
		)
	}
	
	mod.command.add("gather", (arg) => {
		if (!arg) {
			mod.settings.enabled = !mod.settings.enabled
			if (!mod.settings.enabled) {
				plantsMarkers = false
				miningMarkers = false
				energyMarkers = false
				plants = false
				mining = false
				energy = false
				egg = true
				for (let itemId of mobid) {
					despawnItem(itemId)
				}
			}
			gatheringStatus()
		} else {
			switch (arg) {
				case "egg":
					egg = !egg
					sendMessage("with the egg " + (egg ? "enabled": "disabled"))
					break
				case "alert":
					mod.settings.sendToAlert = !mod.settings.sendToAlert
					sendMessage("Alerts " + (mod.settings.sendToAlert ? "enabled" : "disabled") + (egg ? " with the egg": ""))
					break
				case "status":
					gatheringStatus()
					break
				
				case "plant":
					plantsMarkers = !plantsMarkers
					sendMessage("Plant alerts " + (plantsMarkers ? "visible" : "hidden") + (egg ? " with the egg": ""))
					break
				case "ore":
					miningMarkers = !miningMarkers
					sendMessage("Ore alerts " + (miningMarkers ? "visible" : "hidden") + (egg ? " with the egg": ""))
					break
				case "essence":
					energyMarkers = !energyMarkers
					sendMessage("Essence alerts " + (energyMarkers ? "visible" : "hidden") + (egg ? " with the egg": ""))
					break
				
				case "harmony":
					plants = !plants
					sendMessage("Harmony grass alerts " + (plants ? "visible" : "hidden") + (egg ? " with the egg": ""))
					break
				case "plain":
					mining = !mining
					sendMessage("Plain stone alerts " + (mining ? "visible" : "hidden") + (egg ? " with the egg": ""))
					break
				case "achromic":
					energy = !energy
					sendMessage("Achromic essence alerts " + (energy ? "visible" : "hidden") + (egg ? " with the egg": ""))
					break
				
				default :
					sendMessage("Invalid parameter!")
					break
			}
		}
	})
	
	mod.game.me.on('change_zone', (zone, quick) => {
		mobid = []
	})
	
	mod.hook('S_SPAWN_COLLECTION', 4, (event) => {
		if (mod.settings.enabled) {
			if (plantsMarkers && (gatherMarker = mod.settings.plants.find(obj => obj.id === event.id))) {
				sendAlert( ("Found " + gatherMarker.msg + (egg ? " with the egg": "")), 44)
			} else if (miningMarkers && (gatherMarker = mod.settings.mining.find(obj => obj.id === event.id))) {
				sendAlert( ("Found " + gatherMarker.msg + (egg ? " with the egg": "")), 44)
			} else if (energyMarkers && (gatherMarker = mod.settings.energy.find(obj => obj.id === event.id))) {
				sendAlert( ("Found " + gatherMarker.msg + (egg ? " with the egg": "")), 44)
			} else if (plants && event.id == 1) {
				sendAlert( ("Found [Harmony Grass] "), 44)
			} else if (mining && event.id == 101) {
				sendAlert( ("Found [Plain Stone] "), 44)
			} else if (energy && event.id == 201) {
				sendAlert( ("Found [Achromic Essence] "), 44)
			} else {
				return true
			}
			
			spawnItem(event.gameId, event.loc)
			mobid.push(event.gameId)
		}
	})
	
	mod.hook('S_DESPAWN_COLLECTION', 2, (event) => {
		if (mobid.includes(event.gameId)) {
			gatherMarker = []
			despawnItem(event.gameId)
			mobid.splice(mobid.indexOf(event.gameId), 1)
		}
	})
	
	function spawnItem(gameId, loc) {
		mod.send('S_SPAWN_DROPITEM', 8, {
			gameId: gameId*10n,
			loc: loc,
			item: mod.settings.markerId,
			amount: 1,
			expiry: 999999,
			owners: [{}]
		})
	}
	
	function despawnItem(gameId) {
		mod.send('S_DESPAWN_DROPITEM', 4, {
			gameId: gameId*10n
		})
	}
	
	function sendMessage(msg) { mod.command.message(msg) }
	
	function sendAlert(msg, type) {
		mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
			type: type,
			chat: false,
			channel: 0,
			message: msg,
		})
	}
}
