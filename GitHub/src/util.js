const _ = require('lodash')
const moment = require('moment')

class Util {
    constructor(){}

    getCsvStringHeadder() {
        const headers = {
            'Data de Criacao': null
        }
        const keys = _.keysIn(headers)
        return keys.join(";") + "\n"
    }

    getCsvString(clonedDefaultRepoData){
        const values = _.valuesIn(clonedDefaultRepoData)
        return values.join(";") + "\n"
    }
}

module.exports = Util