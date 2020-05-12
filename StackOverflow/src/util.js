const _ = require("lodash");
const moment = require("moment");

class Util {
  constructor() {}

  getCsvStringHeadder() {
    const headers = {
      "Id do usuario": null,
      "Percentual de perguntas da linguagem da vaga": null,
      "Escala do percentual de perguntas da linguagem da vaga": null,
      "Score médio das perguntas": null,
      "escala do score médio das perguntas": null,
      "Percentual de respostas da linguagem da vaga": null,
      "Escala do percentual de respostas da linguagem da vaga": null,
      "Score médio das respostas": null,
      "escala do score médio das respostas": null,
      "Reputação ": null,
      "Escala da reputação": null,
    };
    const keys = _.keysIn(headers);
    return keys.join(";") + "\n";
  }

  getCsvString(clonedDefaultRepoData) {
    const values = _.valuesIn(clonedDefaultRepoData);
    return values.join(";") + "\n";
  }
}

module.exports = Util;
