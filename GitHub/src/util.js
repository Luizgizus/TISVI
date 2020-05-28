const _ = require("lodash");
const moment = require("moment");

class Util {
  constructor() { }

  getCsvStringHeadder(languagesJob) {
    const headers = {
      "login do usuario avaliado": null,
      "Quantidade de reações nas issues": null,
      "Escala da quantidade de reações nas issues": null,
      "Popularidade do repositório": null,
      "Escala da popularidade do repositório": null,
      "Média de watchers": null,
      "Escala da média de watchers": null,
    };

    for (let i = 0; i < languagesJob.length; i++) {
      headers["Percentual de issues fechadas da linguagem " + languagesJob[i]] = null
      headers["Escala do percentual de issues fechadas da linguagem " + languagesJob[i]] = null
      headers["Percentual de segudores da linguagem " + languagesJob[i]] = null
      headers["Escala do percentual de segudores da linguagem " + languagesJob[i]] = null
      headers["Percentual de repositórios na linguagem " + languagesJob[i]] = null
      headers["Escala do percentual de repositórios na linguagem " + languagesJob[i]] = null
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
