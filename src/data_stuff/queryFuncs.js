function getLastQuery(currentDataFromDB) {
    let lastQuery = null
    if (Object.keys(currentDataFromDB)) {
        Object.keys(currentDataFromDB).forEach((key) => {
            if (!lastQuery) {
                lastQuery = key
            } else if (parseInt(lastQuery) < parseInt(key)) {
                lastQuery = key
            }
        })
    }

    return lastQuery ? currentDataFromDB[lastQuery] : undefined
}

function getOldestQuery(currentDataFromDB) {
    let lastQuery = null
    if (Object.keys(currentDataFromDB)) {
        Object.keys(currentDataFromDB).forEach((key) => {
            if (!lastQuery) {
                lastQuery = key
            } else if (parseInt(lastQuery) > parseInt(key)) {
                lastQuery = key
            }
        })
    }

    return lastQuery ? currentDataFromDB[lastQuery] : undefined
}

function getAllData(currentDataFromDB, maxAmt) {
    let data = []
    let intervalSize = Math.floor(Object.keys(currentDataFromDB).length / maxAmt)
    if (Object.keys(currentDataFromDB)) {
        for (let i = 0; i < maxAmt - 1; i++) {
            data.push(Object.keys(currentDataFromDB)[i * intervalSize])
        }
        data.push(Object.keys(currentDataFromDB)[Object.keys(currentDataFromDB).length - 1]) 
        return data
    }
}
module.exports = {
    getLastQuery,
    getOldestQuery,
    getAllData
}
