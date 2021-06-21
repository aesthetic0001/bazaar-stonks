const axios = require("axios");
const stringSimilarity = require("string-similarity");
const firebase = require("firebase")
const {getCat} = require("../stonkFunctions/getCategory");
const {getAllData} = require("./queryFuncs");
const {stonkInfo} = require("../stonkFunctions/stonkInfo");

let db = firebase.firestore()

async function getVisualizationOverview(stonkName, mode = "performance", way = "%") {
    return new Promise(async (resolve) => {
        db.collection("dbDir").limit(100)
            .where("documentID", "<=", new Date().getTime())
            .orderBy("documentID", "desc")

            .onSnapshot(async (querySnapshot) => {
                let data = {}
                querySnapshot.forEach((doc) => {
                    data[doc.id] = doc.data()
                })

                if (way !== "%" && way !== "$") way = "%"

                let trueMode = stringSimilarity.findBestMatch(mode.toLowerCase(), ["performance", "margin", "sellvol", "buyvol", "sellprice", "buyprice"]).bestMatch.target

                let trueName = await stonkInfo(stonkName)

                let allDates = getAllData(data, 10)

                let arrayOfTime = []

                let arrayOfData = []
                let arrayOfData2 = []

                allDates.forEach((key) => {
                    let date = new Date(parseInt(key))
                    arrayOfTime.push(date.getHours())
                })

                let category = getCat(trueName.pn.trim())

                const chartConfig = {
                    'chart': {
                        'version': 3,
                        'type': 'line', 'data': {
                            'labels': arrayOfTime.toString().replace(/,/g, " "),
                            'datasets': []
                        },
                        "options": {
                            "title": {
                                "display": true,
                                "text": `${trueName.pn}'s performance overview`
                            }
                        }
                    }
                }

                if (trueMode === "performance") {
                    if (way === "%") {
                        allDates.forEach((key) => {
                            let reconvertedName = trueName.pn.toString().toUpperCase().replace(/ /g, "_")
                            let keyData = data[key].data[category][reconvertedName]
                            arrayOfData.push(keyData.id * 100)
                        })
                        chartConfig.chart.data.datasets.push({
                            'label': `${trueName.pn}'s ${trueMode} in ${way}`,
                            'data': arrayOfData
                        })
                    } else {
                        allDates.forEach((key) => {
                            let reconvertedName = trueName.pn.toString().toUpperCase().replace(/ /g, "_")
                            let keyData = data[key].data[category][reconvertedName]
                            arrayOfData.push(keyData.no)
                        })
                        chartConfig.chart.data.datasets.push({
                            'label': `${trueName.pn}'s ${trueMode} in ${way}`,
                            'data': arrayOfData
                        })
                    }
                } else if (trueMode === "margin") {
                    if (way === "%") {
                        allDates.forEach((key) => {
                            let reconvertedName = trueName.pn.toString().toUpperCase().replace(/ /g, "_")
                            let keyData = data[key].data[category][reconvertedName]
                            arrayOfData.push(Math.round(((keyData.bp - keyData.sp) / keyData.bp) * 10) * 10)
                        })
                        chartConfig.chart.data.datasets.push({
                            'label': `${trueName.pn}'s ${trueMode} in ${way}`,
                            'data': arrayOfData
                        })
                    } else {
                        allDates.forEach((key) => {
                            let reconvertedName = trueName.pn.toString().toUpperCase().replace(/ /g, "_")
                            let keyData = data[key].data[category][reconvertedName]
                            arrayOfData.push(keyData.bp - keyData.sp)
                        })
                        chartConfig.chart.data.datasets.push({
                            'label': `${trueName.pn}'s ${trueMode} in ${way}`,
                            'data': arrayOfData
                        })
                    }
                } else if (mode === "volume") {
                    allDates.forEach((key) => {
                        let reconvertedName = trueName.pn.toString().toUpperCase().replace(/ /g, "_")
                        let keyData = data[key].data[category][reconvertedName]
                        arrayOfData.push(keyData.sv)
                        arrayOfData2.push(keyData.bv)
                    })
                    chartConfig.chart.data.datasets.push({
                        'label': `${trueName.pn}'s sellvolume`,
                        'data': arrayOfData
                    })
                    chartConfig.chart.data.datasets.push({
                        'label': `${trueName.pn}'s buyvolume`,
                        'data': arrayOfData2
                    })
                } else {
                    allDates.forEach((key) => {
                        let reconvertedName = trueName.pn.toString().toUpperCase().replace(/ /g, "_")
                        let keyData = data[key].data[category][reconvertedName]
                        arrayOfData.push(keyData.sp)
                        arrayOfData2.push(keyData.bp)
                    })
                    chartConfig.chart.data.datasets.push({
                        'label': `${trueName.pn}'s sellprice`,
                        'data': arrayOfData
                    })
                    chartConfig.chart.data.datasets.push({
                        'label': `${trueName.pn}'s buyprice`,
                        'data': arrayOfData2
                    })
                }

                axios.post('https://quickchart.io/chart/create', chartConfig)
                    .then(function (response) {
                        resolve(response.data.url)
                    })
            })
    })
}

module.exports = {
    getVisualizationOverview
}