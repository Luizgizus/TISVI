const _ = require("lodash");
const moment = require("moment");

class Util {
  constructor() { }

  getCsvStringHeadder(languagesJob) {
    const headers = {
      "Id do usuario": null,
      "Score médio das perguntas": null,
      "escala do score médio das perguntas": null,
      "Score médio das respostas": null,
      "escala do score médio das respostas": null,
      "Reputação ": null,
      "Escala da reputação": null,
    };

    for (let i = 0; i < languagesJob.length; i++) {
      headers["Percentual de perguntas da linguagem " + languagesJob[i]] = null
      headers["Escala do percentual de perguntas da linguagem " + languagesJob[i]] = null
      headers["Percentual de respostas da linguagem " + languagesJob[i]] = null
      headers["Escala do percentual de respostas da linguagem " + languagesJob[i]] = null
    }
    const keys = _.keysIn(headers);
    return keys.join(";") + "\n";
  }

  getCsvString(clonedDefaultRepoData) {
    const values = _.valuesIn(clonedDefaultRepoData);
    return values.join(";") + "\n";
  }
}

module.exports = Util;
