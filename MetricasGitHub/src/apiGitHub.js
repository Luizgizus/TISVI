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

    this.defaultRepoData = {
      userName: null,
      qtdReactionsOnIssues: 0,
      repoPopAVG: null,
      watchersAVG: null,
    };
  }

  async startFile() {
    const hasRepoFile = await fs.existsSync("github.csv");
    if (hasRepoFile) {
      await fs.truncateSync("github.csv");
    }
    await fs.appendFileSync(
      "github.csv",
      this.util.getCsvStringHeadder()
    );
  }

  saveOnCsv(issuesData, repositoriesData, userName) {
    let totalWatchers = 0;
    let totalPop = 0;
    const urlRepos = [];

    this.defaultRepoData = _.clone(this.defaultRepoData)

    this.defaultRepoData.userName = userName;

    for (let i = 0; i < issuesData.issues.length; i++) {
      const issue = issuesData.issues[i];
      for (let j = 0; j < issue.reactions.nodes.length; j++) {
        if (issue.reactions.nodes[j].content === "THUMBS_UP") {
          this.defaultRepoData.qtdReactionsOnIssues++;
        }
      }
    }


    for (let i = 0; i < repositoriesData.respositories.length; i++) {
      const repo = repositoriesData.respositories[i];
      urlRepos.push(repo.url + ".git");

      totalPop += repo.stargazers.totalCount;
      totalWatchers += repo.watchers.totalCount;
    }

    this.defaultRepoData.watchersAVG = (
      totalWatchers / repositoriesData.totalCount
    ).toFixed(2);

    this.defaultRepoData.repoPopAVG = (
      totalPop / repositoriesData.totalCount
    ).toFixed(2);

    fs.appendFileSync(
      "github.csv",
      this.util.getCsvString(this.defaultRepoData)
    );
  }

  async getFeatures(userName, languagesNames) {
    const issuesData = await this.getFeaturesOfIssues();
    const repositoiesData = await this.getFeaturesOfRepositories();

    this.saveOnCsv(
      issuesData,
      repositoiesData,
      userName
    );
  }

  async getUserNamesAleatory() {
    try {
      const url = "https://api.github.com/graphql";

      let stringQuery = this.model.getStringAleatoryUsers();

      let body = {
        query: stringQuery,
        variables: {},
      };

      let users = []

      while (users.length <= 1000) {
        const response = await this.request.post(url, body);
        body.query = this.model.getStringAleatoryUsers();
        if (response.statusCode === 200) {
          const respUsers = response.body.data.search.nodes;
          for (let i = 0; i < respUsers.length; i++) {
            users.push(respUsers[i].owner.login)
          }
        } else {
          console.log(response);
          console.log(response.statusCode);
          console.log("SOME ERROR APPEARED");
        }
      }

      return users;
    } catch (err) {
      console.log(err);
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

      let body = {
        query: stringQuery,
        variables: {},
      };

      const response = await this.request.post(url, body);

      if (response.statusCode === 200) {
        const dataRepos = response.body.data.search.nodes.pop();
        if (dataRepos) {
          if (dataRepos.issues.totalCount > 100) {
            issuesData.totalCount = 100;
          } else {
            issuesData.totalCount = dataRepos.issues.totalCount;
          }

          issuesData.issues = dataRepos.issues.nodes;
        }
      } else {
        console.log(response);
        console.log(response.statusCode);
        console.log("SOME ERROR APPEARED");
      }

      return issuesData;
    } catch (err) {
      console.log(err);
    }
  }

  async getFeaturesOfFollowers(userName) {
    try {
      const url = "https://api.github.com/graphql";

      let stringQuery = this.model.getStringFollowers(userName);
      let hasNext = false;

      const folowersData = {
        totalCount: 0,
        folowers: [],
      };

      let body = {
        query: stringQuery,
        variables: {},
      };

      do {
        const response = await this.request.post(url, body);
        if (response.statusCode === 200) {
          const dataRepos = response.body.data.search.nodes.pop();
          if (dataRepos) {
            hasNext = dataRepos.followers.pageInfo.hasNextPage;
            stringQuery = this.model.getStringFollowers(
              userName,
              dataRepos.followers.pageInfo.endCursor
            );

            if (dataRepos.followers.totalCount > 100) {
              folowersData.totalCount = 100;
            } else {
              folowersData.totalCount = dataRepos.followers.totalCount;
            }

            folowersData.folowers = dataRepos.followers.nodes;
          }
        } else {
          console.log(response);
          console.log(response.statusCode);
          console.log("SOME ERROR APPEARED");
        }
      } while (hasNext);

      return folowersData;
    } catch (err) {
      console.log(err);
    }
  }

  async getFeaturesOfRepositories(userName) {
    try {
      const url = "https://api.github.com/graphql";

      let stringQuery = this.model.getStringRepositories(userName);

      const respositoriesData = {
        totalCount: 0,
        respositories: [],
      };

      let body = {
        query: stringQuery,
        variables: {},
      };

      const response = await this.request.post(url, body);

      if (response.statusCode === 200) {
        const dataRepos = response.body.data.search.nodes.pop();
        if (dataRepos) {
          if (dataRepos.repositories.totalCount > 100) {
            respositoriesData.totalCount = 100;
          } else {
            respositoriesData.totalCount = dataRepos.repositories.totalCount;
          }

          respositoriesData.respositories = dataRepos.repositories.nodes;
        }
      } else {
        console.log(response);
        console.log(response.statusCode);
        console.log("SOME ERROR APPEARED");
      }

      return respositoriesData;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = ApiGitHub;
