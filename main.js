const config = require("config.json")
const Discord = require('discord.js')
const client = new Discord.Client();
const prefix = config.prefix
const axios = require("axios")
const fs = require("fs");
const firebase = require("firebase")

let currentDataApi

const firebaseConfig = {
    // your firebase config
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let firebaseAppDefined = false

setInterval(() => {
    if (!firebaseAppDefined) {
        if (firebase.app()) {
            firebaseAppDefined = true
            const {getUptime} = require("./src/discord/uptimeQuery");
            const {stonkVisual} = require("./src/discord/discordFunctions");
            const {sendHelpEmbed} = require("./src/discord/discordFunctions");
            const {sendStonkEmbed} = require("./src/discord/discordFunctions");
            const {writeData} = require("./src/data_stuff/writeData");
            const {getBestValue} = require("./src/stonkFunctions/stonkValues");
            const {stonkInfo} = require("./src/stonkFunctions/stonkInfo");


            async function fetchApiData() {
                let querriedData = await axios.get("https://api.hypixel.net/skyblock/bazaar")
                currentDataApi = querriedData.data.products
            }

            async function readWrite() {
                await fetchApiData()
                await writeData(currentDataApi)
            }

            setInterval(() => {
                readWrite()
            }, config.requestIntervalMins * 60000)
            client.once('ready', async () => {
                await client.user.setPresence({
                    status: "dnd",  // You can show online, idle... Do not disturb is dnd
                    activity: {
                        type: "WATCHING",
                        name: "the Bazaar",
                    }
                })
            });

            fs.writeFile("uptime.txt", `${Date()}`, function (err) {
                if (err) console.log("Error writing uptime")
            })

            client.on("message", async (msg) => {
                const args = msg.content.slice(prefix.length).trim().split(' ');
                const cmd = args.shift().toLowerCase();
                if (!msg.content.startsWith(prefix)) return

                if (cmd.startsWith(`stonk`)) {
                    let stonkName = args.join(" ")
                    await stonkInfo(stonkName).then(async function (data) {
                        await msg.channel.send(await sendStonkEmbed(data))
                    })
                }
                if (cmd.startsWith("fetch")) {
                    let stonk = await getBestValue(args[0] ? args[0] : "all", args[1] ? args[1] === "true" : true, args[2] ? args[2] : "perf", args[3] ? args[3] : "%")
                    await msg.channel.send(await sendStonkEmbed(stonk))
                }
                if (cmd.startsWith("help")) {
                    await msg.channel.send(sendHelpEmbed())
                }
                if (cmd.startsWith("overview")) {
                    // very ugly code incoming 🤮
                    let stonkName = args.join(" ")
                        .replace("margin", "")
                        .replace("performance", "")
                        .replace("volume", "")
                        .replace("price", "")
                        .replace("%", "")
                        .replace("$", "").trim()
                    let mode = args.join(" ").replace(stonkName, "").replace("%", "").replace("$", "").trim()
                    let searchMode = args.join(" ").replace(stonkName, "").replace(mode, "").trim()

                    stonkInfo(stonkName).then(async function (stonk) {
                        await stonkVisual(stonk, mode, searchMode).then((data) => {
                            msg.channel.send(data)
                        })
                    })
                }
                if (cmd.startsWith("stats")) {
                    let statsMsg = await getUptime(msg, client)
                    msg.channel.send(statsMsg)
                }
            })

            client.login(config.token);

            readWrite()
        }
    }
}, 100)
