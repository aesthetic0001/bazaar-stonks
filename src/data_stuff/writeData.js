const firebase = require("firebase")
const fs = require("fs");
const {getCat} = require("../stonkFunctions/getCategory");

let db = firebase.firestore()

async function writeData(currentDataApi) {
    return new Promise(async (resolve) => {
        let today = new Date()
        let yesterdayDateEpoch = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).getTime()
        let latestPossible = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes() - 10).getTime()
        let dateToUse = new Date().getTime()
        db.collection("dbDir").limit(1)
            .where("documentID", ">=", yesterdayDateEpoch)
            .where("documentID", "<=", latestPossible)
            .orderBy("documentID", "desc")
            .onSnapshot((querySnapshot) => {
                let key
                let currentDataFromDB = {}
                querySnapshot.forEach((doc) => {
                    currentDataFromDB[doc.id] = doc.data()
                    key = doc.id
                })

                let lastQueryData = currentDataFromDB[key]

                currentDataFromDB = {
                    documentID: dateToUse,
                    data: {
                        farming: {},
                        mining: {},
                        combat: {},
                        woods_fish: {},
                        oddities: {}
                    }
                }

                let dataToWriteDB = {
                    documentID: dateToUse,
                    data: {
                        farming: {},
                        mining: {},
                        combat: {},
                        woods_fish: {},
                        oddities: {}
                    }
                }


                Object.keys(currentDataApi).forEach((key) => {
                    const keyData = currentDataApi[key].quick_status
                    let productId = keyData.productId.toString().toLowerCase().replace(/_/g, " ")
                    let category = getCat(productId.trim())
                    let lastQueryCareAbout = lastQueryData ? lastQueryData.data[category][keyData.productId] : undefined
                    let roundedBuy = Math.round(keyData.buyPrice * 10) / 10
                    let roundedSell = Math.round(keyData.sellPrice * 10) / 10

                    let newMinOld = lastQueryCareAbout ? roundedSell - lastQueryCareAbout.sp : 0

                    if (productId.includes("bazaar") || productId.includes("stonk")) {
                        return
                    }

                    dataToWriteDB.data[category][keyData.productId] = {
                        pn: productId,
                        sp: roundedSell,
                        bp: roundedBuy,
                        mg: roundedBuy - roundedSell ? `${Math.round(((roundedBuy - roundedSell) / roundedBuy) * 10) * 10}% (${Math.round((roundedBuy - roundedSell) * 10) / 10} coins)` : 0,
                        sv: keyData.sellVolume,
                        bv: keyData.buyVolume,
                        no: newMinOld,
                        dq: lastQueryCareAbout ? `${Math.round(newMinOld / lastQueryCareAbout.sp * 10) * 10}% (${Math.round(newMinOld * 10) / 10} coins)` : "N/A",
                        id: lastQueryCareAbout ? Math.floor(newMinOld / lastQueryCareAbout.sp * 10) / 10 : 0
                    }
                })

                fs.writeFileSync("stonksDB.json", JSON.stringify(dataToWriteDB))

                firebase.firestore().collection("dbDir").doc(dateToUse.toString()).set(dataToWriteDB)
                    .then(() => {
                        resolve()
                    })
                    .catch((error) => {
                        resolve()
                    });
            })

    })
}

module.exports = {
    writeData
}