const _ = require("lodash");
const moment = require("moment");
const fs = require("fs");

const Request = require("./request");
const Util = require("./util");

class ApiStackoverflow {
  constructor() {
    this.request = new Request();
    this.util = new Util();
    this.lasPage = process.env.MAX_PAGE;
    this.dataToFile = {
      idUser: null,
      scoreQuestionAVG: null,
      scoreAnswerAVG: null,
      reputation: null,
    };
  }

  async startFile() {
    const hasRepoFile = await fs.existsSync("stackoverflow.csv");
    if (hasRepoFile) {
      await fs.truncateSync("stackoverflow.csv");
    }
    await fs.appendFileSync(
      "stackoverflow.csv",
      this.util.getCsvStringHeadder(this.defaultRepoData)
    );
  }

  buildStackoverflowData(
    usersData,
    answersData,
    questionsData,
    jobLanguage,
    userId
  ) {
    const dataToFile = _.clone(this.dataToFile);

    dataToFile.scoreQuestionAVG = questionsData.scoreAvg
      .toFixed(2)
      .toString()
      .replace(".", ",");

    dataToFile.scoreAnswerAVG = answersData.scoreAvg
      .toFixed(2)
      .toString()
      .replace(".", ",");

    dataToFile.reputation = usersData.reputaion;

    dataToFile.idUser = userId;

    fs.appendFileSync("stackoverflow.csv", this.util.getCsvString(dataToFile));
  }

  async getUsermetrics(idsUser) {
    const defaultUserData = {
      reputaion: null,
    };

    const url = `https://api.stackexchange.com/2.2/users/${idsUser}?&key=U4DMV*8nvpm3EOpvf69Rxw((&pagesize=100&site=stackoverflow`;
    const response = await this.request.get(url);

    const data = response.body.items.pop();

    console.log(response.body);

    if (data && !_.isEmpty(data)) {
      defaultUserData.reputaion = data.reputation;
    }

    return defaultUserData;
  }

  async getAnswersMetrics(idsUser) {
    const defaultAnswerData = {
      scoreAvg: 0,
    };
    let hasNext = null;
    let page = 0;

    do {
      page++;
      const url = `https://api.stackexchange.com/2.2/users/${idsUser}/answers?page=${page}&key=U4DMV*8nvpm3EOpvf69Rxw((&pagesize=100&site=stackoverflow`;
      const response = await this.request.get(url);

      const data = response.body;
      hasNext = data.has_more;

      for (let i = 0; i < data.items.length; i++) {
        if (defaultAnswerData.scoreAvg === null) {
          defaultAnswerData.scoreAvg = data.items[i].score;
        } else {
          defaultAnswerData.scoreAvg =
            (data.items[i].score + defaultAnswerData.scoreAvg) / 2;
        }
      }
    } while (hasNext);

    return defaultAnswerData;
  }

  async getQuestionsMetrics(idsUser) {
    const defaultQuestionsData = {
      scoreAvg: 0,
    };
    let hasNext = null;
    let page = 0;

    do {
      page++;
      const url = `https://api.stackexchange.com/2.2/users/${idsUser}/questions?page=${page}&key=U4DMV*8nvpm3EOpvf69Rxw((&pagesize=100&site=stackoverflow`;
      const response = await this.request.get(url);

      const data = response.body;
      hasNext = data.has_more;

      for (let i = 0; i < data.items.length; i++) {
        if (defaultQuestionsData.scoreAvg === null) {
          defaultQuestionsData.scoreAvg = data.items[i].score;
        } else {
          defaultQuestionsData.scoreAvg =
            (data.items[i].score + defaultQuestionsData.scoreAvg) / 2;
        }
      }
    } while (hasNext);

    return defaultQuestionsData;
  }

  async getFeatures(userId) {
    try {
      const usersData = await this.getUsermetrics(userId);
      if (usersData && usersData.reputaion !== null) {
        const answersData = await this.getAnswersMetrics(userId);
        const questionsData = await this.getQuestionsMetrics(userId);

        this.buildStackoverflowData(
          usersData,
          answersData,
          questionsData,
          "javascript",
          userId
        );
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = ApiStackoverflow;
