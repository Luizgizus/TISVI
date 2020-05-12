const _ = require("lodash");
const moment = require("moment");
const fs = require("fs");

const Request = require("./request");
const Model = require("./model");
const Util = require("./util");

class ApiGitHub {
  constructor() {
    this.request = new Request();
    this.model = new Model();
    this.util = new Util();
    this.lasPage = process.env.MAX_PAGE;

    this.issues = {
      userName: null,
      qtdReactionsOnIssues: 0,
    };

    this.repodata = {
      userName: null,
      repoPopAVG: 0,
      watchersAVG: 0,
    };
  }

  async startFile() {
    const hasRepoFile = await fs.existsSync("repos.csv");
    if (hasRepoFile) {
      await fs.truncateSync("repos.csv");
    }
    await fs.appendFileSync("repos.csv", this.util.getCsvStringHeadderRepo());

    const haIssueFile = await fs.existsSync("issues.csv");
    if (haIssueFile) {
      await fs.truncateSync("issues.csv");
    }
    await fs.appendFileSync("issues.csv", this.util.getCsvStringHeadderIssue());
  }

  saveOnCsv(issuesData, repositoiesData, userName) {
    let totalWatchers = 0;
    let totalPop = 0;

    this.repodata.userName = userName;
    this.issues.userName = userName;

    for (let j = 0; j < issuesData.length; j++) {
      for (let i = 0; i < issuesData[j].issues.length; i++) {
        const issue = issuesData[j].issues[i];
        for (let j = 0; j < issue.reactions.nodes.length; j++) {
          if (issue.reactions.nodes[j].content === "THUMBS_UP") {
            this.issues.qtdReactionsOnIssues++;
          }
        }
      }

      fs.appendFileSync("issues.csv", this.util.getCsvString(this.issues));

      this.issues = {
        userName: null,
        qtdReactionsOnIssues: 0,
      };
    }

    console.log(repositoiesData);

    for (let j = 0; j < repositoiesData.length; j++) {
      for (let i = 0; i < repositoiesData[j].respositories.length; i++) {
        const repo = repositoiesData[j].respositories[i];
        totalPop += repo.stargazers.totalCount;
        totalWatchers += repo.watchers.totalCount;
      }

      if (repositoiesData[j].totalCount && repositoiesData[j].totalCount > 0) {
        this.repodata.repoPopAVG = (
          totalPop / repositoiesData[j].totalCount
        ).toFixed(2);
        this.repodata.watchersAVG = (
          totalWatchers / repositoiesData[j].totalCount
        ).toFixed(2);
      } else {
        this.repodata.repoPopAVG = 0;
        this.repodata.watchersAVG = 0;
      }

      fs.appendFileSync("repos.csv", this.util.getCsvString(this.repodata));

      totalWatchers = 0;
      totalPop = 0;
      this.repodata = {
        userName: null,
        repoPopAVG: 0,
        watchersAVG: 0,
      };
    }
  }

  async getFeatures(userName) {
    try {
      const issuesData = await this.getFeaturesOfIssues(userName);
      const repositoiesData = await this.getFeaturesOfRepositories(userName);
      this.saveOnCsv(issuesData, repositoiesData, userName);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async getFeaturesOfIssues(userName) {
    try {
      const url = "https://api.github.com/graphql";

      let stringQuery = this.model.getStringIssues(userName);
      let hasNext = false;

      const issuesData = {
        totalCount: 0,
        issues: [],
      };

      const usersData = [];

      let body = {
        query: stringQuery,
        variables: {},
      };

      let page = 0;

      do {
        page++;
        const response = await this.request.post(url, body);

        console.log(response.body);

        if (response.statusCode === 200) {
          hasNext = response.body.data.search.pageInfo.hasNextPage;
          stringQuery = this.model.getStringIssues(
            response.body.data.search.pageInfo.endCursor
          );
          for (let i = 0; i < response.body.data.search.nodes.length; i++) {
            const dataRepos = response.body.data.search.nodes[i];

            if (dataRepos.issues.totalCount > 100) {
              issuesData.totalCount = 100;
            } else {
              issuesData.totalCount = dataRepos.issues.totalCount;
            }

            issuesData.issues = dataRepos.issues.nodes;

            usersData.push(issuesData);
          }
        } else {
          console.log(response);
          console.log(response.statusCode);
          console.log("SOME ERROR APPEARED");
        }
      } while ((hasNext, page <= 3));

      return usersData;
    } catch (err) {
      console.log(err);
    }
  }

  async getFeaturesOfRepositories(userName) {
    try {
      const url = "https://api.github.com/graphql";

      let stringQuery = this.model.getStringRepositories(userName);
      let hasNext = false;

      const respositoriesData = {
        totalCount: 0,
        respositories: [],
      };

      const usersData = [];

      let body = {
        query: stringQuery,
        variables: {},
      };

      let page = 0;

      do {
        page++;
        const response = await this.request.post(url, body);
        console.log(response.body);

        if (response.statusCode === 200) {
          hasNext = response.body.data.search.pageInfo.hasNextPage;

          stringQuery = this.model.getStringIssues(
            response.body.data.search.pageInfo.endCursor
          );

          for (let i = 0; i < response.body.data.search.nodes.length; i++) {
            const dataRepos = response.body.data.search.nodes[i];

            if (dataRepos.repositories.totalCount > 100) {
              respositoriesData.totalCount = 100;
            } else {
              respositoriesData.totalCount = dataRepos.repositories.totalCount;
            }

            respositoriesData.respositories = dataRepos.repositories.nodes;

            usersData.push(respositoriesData);
          }
        } else {
          console.log(response);
          console.log(response.statusCode);
          console.log("SOME ERROR APPEARED");
        }
      } while ((hasNext, page <= 3));

      return usersData;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = ApiGitHub;
