const firebase = require("firebase")
const stringSimilarity = require("string-similarity")

let db = firebase.firestore()

async function stonkInfo(stonkName) {
    return new Promise((resolve) => {
        let possibleCorrectStockNames = []
        let possibleCorrectStocks = []
        db.collection("dbDir").limit(1)
            .where("documentID", "<=", new Date().getTime())
            .orderBy("documentID", "desc")
            .onSnapshot((querySnapshot) => {
                let data = {}
                let key
                querySnapshot.forEach((doc) => {
                    data[doc.id] = doc.data()
                    key = doc.id
                })

                const lastQueryData = data[key]

                if (lastQueryData) {
                    Object.keys(lastQueryData.data).forEach((key) => {
                        Object.values(lastQueryData.data[key]).forEach((stonk) => {
                            if (stonk.pn.includes(stonkName.toLowerCase())) {
                                possibleCorrectStockNames.push(stonk.pn)
                                possibleCorrectStocks.push(stonk)
                            }
                        })
                    })
                }
                const matches = possibleCorrectStockNames[0] ? stringSimilarity.findBestMatch(stonkName, possibleCorrectStockNames).bestMatch.target : "N/A"
                let correctMatch = possibleCorrectStocks.find((stock) =>
                    stock.pn === matches
                )
                return resolve(correctMatch)
            })
    })
}

module.exports = {
    stonkInfo
}