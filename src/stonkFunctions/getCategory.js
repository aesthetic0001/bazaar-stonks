const {bzInfo} = require("./bzConstants");

function getCat(name) {
    let matchKey = null
    let keys = Object.keys(bzInfo)
    keys.forEach((key) => {
        const keyArray = bzInfo[key]
        for (const itemName of keyArray) {
            const match = itemName.startsWith("strict") ? name.startsWith(itemName.replace("strict", "").replace(" ", "")) : name.includes(itemName)
            if (match) {
                matchKey = key
                break
            }
        }
    })
    return matchKey ? matchKey : "oddities"
}

module.exports = {
    getCat
}