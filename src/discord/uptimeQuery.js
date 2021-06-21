const Discord = require("discord.js");
const fs = require("fs");

async function getUptime(message, client) {
    return new Promise((resolve) => {
        // very ugly code that i skidded from my old project
        let servercount = client.guilds.cache.size;
        let usercount = client.users.cache.size;
        let channelscount = client.channels.cache.size;
        const startDate = fs.readFileSync('./uptime.txt', 'utf8')
        const startDateToDate = new Date(startDate)
        let currentTime = new Date()
        let uptime = Math.floor((currentTime - startDateToDate) / 1000)
        let days = 0
        let hours = 0
        let mins = 0
        let uptimeDesc
        if (uptime > 60) {
            mins = Math.floor(uptime / 60)
            uptime = uptime - mins * 60
        }
        if (mins > 60) {
            hours = Math.floor(mins / 60)
            mins = mins - hours * 60
        }

        if (hours > 24) {
            days = Math.floor(hours / 24)
            hours = hours - days * 24
        }
        if (days > 0) {
            uptimeDesc = `${days}d ${hours}h ${mins}m ${uptime}s`
        }
        if (hours > 0 && days === 0) {
            uptimeDesc = `${hours}h ${mins}m ${uptime}s`
        }
        if (mins > 0 && hours === 0) {
            uptimeDesc = `${mins}m ${uptime}s`
        }
        if (uptime > 0 && mins === 0) {
            uptimeDesc = `${uptime}s`
        }
        if (uptime === 0) {
            uptimeDesc = `${uptime}s`
        }


        let stats = new Discord.MessageEmbed()
            .setAuthor('')
            .setTitle(`Statistics of Bazaar Stonks`)
            .setColor('RED')
            .setDescription(`**Server Count**: ${servercount}\n**User Count:** ${usercount}\n**Channel Count:** ${channelscount}\n**Uptime:** ${uptimeDesc}`)
            .setTimestamp()
            .setFooter(`${message.author.tag}`, message.author.displayAvatarURL());

        resolve(stats)
    })

}

module.exports = {
    getUptime
}