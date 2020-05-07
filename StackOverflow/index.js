const ApiStackoverflow = require('./src/apiStackoverflow')
const apiStackoverflow = new ApiStackoverflow()

async function start() {
    await apiStackoverflow.startFile()
    await apiStackoverflow.getFeatures('1090')
}

start()