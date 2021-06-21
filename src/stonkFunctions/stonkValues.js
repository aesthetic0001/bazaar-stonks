const stringSimilarity = require("string-similarity");
const {getLastQuery} = require("../data_stuff/queryFuncs");
const firebase = require("firebase")
const db = firebase.firestore()

async function getValues(category = "all", getBestValue = true, mode = "perf", searchvalue = "%") {
    return new Promise((resolve) => {
        let wayToSearch
        let bestSuitedValue
        let trueCategory = stringSimilarity.findBestMatch(category.toLowerCase(), ['mining', 'combat', 'oddities', "woods_fish", "all", "farming"]).bestMatch.target
        let trueMode = stringSimilarity.findBestMatch(mode.toLowerCase(), ["performance", "margin", "sellvol", "buyvol", "sellprice", "buyprice"]).bestMatch.target

        if (mode === "margin" || mode === "performance") {
            wayToSearch = searchvalue === "$" || searchvalue === "%" ? searchvalue : "%"
        }

        db.collection("dbDir").limit(1)
            .where("documentID", "<=", new Date().getTime())
            .orderBy("documentID", "desc")
            .onSnapshot((querySnapshot) => {
                let data = {}
                querySnapshot.forEach((doc) => {
                    console.log(doc.id)
                    data[doc.id] = doc.data()
                })

                const lastQueryData = getLastQuery(data)

                if (lastQueryData) {
                    if (trueCategory !== "all") {
                        let values = Object.keys(lastQueryData.data[trueCategory])
                        values.forEach(function (value) {
                            if (!bestSuitedValue) {
                                bestSuitedValue = lastQueryData.data[trueCategory][value]
                            } else {
                                let valueInfo = getValueInfo(trueMode, bestSuitedValue, lastQueryData.data[trueCategory][value], wayToSearch)
                                if (isBetterSuited(getBestValue, valueInfo[0], valueInfo[1])) {
                                    bestSuitedValue = lastQueryData.data[trueCategory][value]
                                }
                            }
                        })
                    } else {
                        let values = Object.keys(lastQueryData.data)
                        values.forEach(function (key) {
                            Object.values(lastQueryData.data[key]).forEach((stonk) => {
                                if (!bestSuitedValue) {
                                    bestSuitedValue = stonk
                                } else {
                                    let valueInfo = getValueInfo(trueMode, bestSuitedValue, stonk, wayToSearch)
                                    if (isBetterSuited(getBestValue, valueInfo[0], valueInfo[1])) {
                                        bestSuitedValue = stonk
                                    }
                                }
                            })
                        })
                    }

                    return resolve(bestSuitedValue)
                }
            })
    })
}

function getValueInfo(mode, best, checking, searchvalue) {
    if (mode === "performance") {
        return searchvalue === "$" ? [best.no, checking.no] : [best.id, checking.id]
    } else if (mode === "margin") {
        return searchvalue === "$" ? [best.bp - best.sp, checking.bp - checking.sp] : [Math.round(((best.bp - best.sp) / best.bp) * 10) * 10, Math.round(((checking.bp - checking.sp) / checking.bp) * 10) * 10]
    } else if (mode === "sellvol") {
        return [best.sv, checking.sv]
    } else if (mode === "buyvol") {
        return [best.bv, checking.bv]
    } else if (mode === "sellprice") {
        return [best.sp, checking.sp]
    } else {
        return [best.bp, checking.bp]
    }
}

function isBetterSuited(getBest, oldBest, newValue) {
    return getBest ? oldBest < newValue : oldBest > newValue
}

module.exports = {
    getBestValue: getValues
}