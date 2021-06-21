function strToStonk(str) {
    let arr = str.split(" ")
    let stonkName = []
    arr.forEach((string) => {
        stonkName.push(string[0].toUpperCase())
    })
    return `$${stonkName.join("")}`
}

module.exports = {
    strToStonk
}