const _ = require('lodash')
const moment = require('moment')

class Util {
    constructor(){}

    getCsvStringHeadder() {
        const headers = {
            'Id do usuario': null,
            'Reputação' : null,
            'Escala da reputação': null,
            'Pontuação média das respostas': null,
            'Escala da pontuação média das respostas': null,
            'Quantidade de respostas': null,
            'Escala da quantidade de respostas': null,
            'Quantidade de respostas por tag': null,
            'Escala da quantidade de respostas por tag': null,
            'Pontuação média das perguntas': null,
            'Escala da pontuação média das perguntas': null,
            'Quantidade de perguntas': null,
            'Escala da quantidade de perguntas': null,
            'Quantidade de perguntas por tag': null,
            'Escala da quantidade de perguntas por tag': null,
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