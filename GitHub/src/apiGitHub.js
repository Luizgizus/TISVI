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

    this.defaultRepoData = {};
  }

  async startFile() {
    const hasRepoFile = await fs.existsSync("github.csv");
    if (hasRepoFile) {
      await fs.truncateSync("github.csv");
    }
    await fs.appendFileSync(
      "github.csv",
      this.util.getCsvStringHeadder(this.defaultRepoData)
    );
  }

  async getFeatures(userName) {
    const issuesData = await this.getFeaturesOfIssues("timrwood");
    console.log(issuesData);
    const followersData = await this.getFeaturesOfFollowers("timrwood");
    console.log(followersData);
    const repositoiesData = await this.getFeaturesOfRepositories("timrwood");
    console.log(repositoiesData);
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
        hasNext = dataRepos.issues.pageInfo.hasNextPage;

        if (dataRepos.issues.totalCount > 100) {
          issuesData.totalCount = 100;
        } else {
          issuesData.totalCount = dataRepos.issues.totalCount;
        }

        issuesData.issues = dataRepos.issues.nodes;
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
        console.log(response.body.data.search.nodes);
        if (response.statusCode === 200) {
          const dataRepos = response.body.data.search.nodes.pop();
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

        if (dataRepos.repositories.totalCount > 100) {
          respositoriesData.totalCount = 100;
        } else {
          respositoriesData.totalCount = dataRepos.repositories.totalCount;
        }

        respositoriesData.respositories = dataRepos.repositories.nodes;
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
