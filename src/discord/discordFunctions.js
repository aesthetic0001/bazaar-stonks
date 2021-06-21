const Discord = require('discord.js')
const {getVisualizationOverview} = require("../data_stuff/visualizeData");
const {strToStonk} = require("../stonkFunctions/stonkify");

async function sendStonkEmbed(stonk) {
    return new Promise((resolve) => {
        resolve(new Discord.MessageEmbed()
            .setTitle(`${stonk.pn} (${strToStonk(stonk.pn)})`)
            .addField("Performance", stonk.dq, true)
            .addField("Buy Price:", stonk.bp, true)
            .addField("Sell Price:", stonk.sp, true)
            .addField("Margin:", stonk.mg, true)
            .addField("Volume (Buy):", stonk.bv.toString(), true)
            .addField("Volume (Sell):", stonk.sv.toString(), true)
            .setColor("#00ffea")
            .setTimestamp())
    })

}

function sendHelpEmbed() {
    return new Discord.MessageEmbed()
        .setTitle(`Commands:`)
        .addField("Fetch: Fetch data from BZ Stonks DB", "Usage" +
            " `fetch [CATEGORY: all | combat | mining | farming | woods_fish | oddities]" +
            " [Get Highest Value ? true | false] [Mode: performance | margin | sellvol | buyvol | sellprice | buyprice]" +
            " [Search mode: $ or % (Only applies for performance and margin mode)]`", true)
        .addField("Stonk: Get a quick overview of a stonk", "Usage" +
            " `stonk [item name]`", true)
        .addField("Overview: Get a visual overview of a stonk", "Usage" +
            " `overview [item name] [Mode: performance | margin | volume | price] [Search mode: $ or % (Only applies for performance and margin mode)]`", true)
        .setColor("#00ffea")
        .setTimestamp()
}

async function stonkVisual(stonk, mode, way) {
    return new Promise((resolve) => {
        getVisualizationOverview(stonk.pn, mode, way).then(async function (data) {
            resolve(new Discord.MessageEmbed()
                .setTitle(`${stonk.pn} (${strToStonk(stonk.pn)}) visual embed`)
                .setColor("#c539ff")
                .setImage(data)
                .setTimestamp())
        })
    })

}

module.exports = {
    sendStonkEmbed,
    stonkVisual,
    sendHelpEmbed
}

