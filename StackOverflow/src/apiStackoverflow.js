const _ = require('lodash')
const moment = require('moment')
const fs = require('fs')

const Request = require('./request')
const Util = require('./util')

class ApiStackoverflow {
    constructor() {
        this.request = new Request()
        this.util = new Util()
        this.lasPage = process.env.MAX_PAGE
        this.dataToFile = {
            idUser: null,
            reputaion: null,
            scaledReputation: null,
            scoreAnswersAvg: 0,
            scaledScoreAnswersAvg: null,
            qtdAnswers: 0,
            scaledQtdAnswers: null,
            qtdAnswersByTag: {},
            scaledQtdAnswersByTag: null,
            scoreQuestionsAvg: 0,
            scaledScoreQuestionsAvg: null,
            qtdQuestions: 0,
            scaledQtdQuestions: null,
            qtdQuestionsByTag: {},
            scaledQtdQuestionsByTag: null
        }
    }

    async startFile() {
        const hasRepoFile = await fs.existsSync("stackoverflow.csv")
        if (hasRepoFile) {
            await fs.truncateSync("stackoverflow.csv")
        }
        await fs.appendFileSync("stackoverflow.csv", this.util.getCsvStringHeadder(this.defaultRepoData))
    }

    buildStackoverflowData(usersData, answersData, questionsData) {
        const dataToFile = _.clone(this.dataToFile)

        dataToFile.idUser = usersData.idUser
        dataToFile.reputaion = usersData.reputaion
        dataToFile.scaledReputation = usersData.scaledReputation
        dataToFile.scoreAnswersAvg = answersData.scoreAvg.toFixed(2).toString().replace(".", ",")
        dataToFile.scaledScoreAnswersAvg = answersData.scaledScoreAvg
        dataToFile.qtdAnswers = answersData.qtdAnswers
        dataToFile.scaledQtdAnswers = answersData.scaledQtdAnswers
        dataToFile.scaledQtdAnswersByTag = answersData.scaledQtdAnswersByTag
        dataToFile.scoreQuestionsAvg = questionsData.scoreAvg.toFixed(2).toString().replace(".", ",")
        dataToFile.scaledScoreQuestionsAvg = questionsData.scaledScoreAvg
        dataToFile.qtdQuestions = questionsData.qtdQuestions
        dataToFile.scaledQtdQuestions = questionsData.scaledQtdQuestions
        dataToFile.scaledQtdQuestionsByTag = questionsData.scaledQtdQuestionsByTag


        dataToFile.qtdAnswersByTag = JSON.stringify(answersData.qtdAnswersByTag)
        dataToFile.qtdQuestionsByTag = JSON.stringify(questionsData.qtdQuestionsByTag)

        fs.appendFileSync("stackoverflow.csv", this.util.getCsvString(dataToFile))
    }

    async getUsermetrics(idsUser){
        const defaultUserData = {
            idUser: idsUser,
            reputaion: null,
            scaledReputation: null
        }

        const url = `https://api.stackexchange.com/2.2/users/${idsUser}?&pagesize=100&site=stackoverflow`
        const response = await this.request.get(url)

        const data = response.body.items.pop()

        defaultUserData.reputaion = data.reputation

        // do scaling reputation

        return defaultUserData
    }

    async getAnswersMetrics(idsUser){
        const defaultAnswerData = {
            idUser: idsUser,
            scoreAvg: 0,
            scaledScoreAvg: null,
            qtdAnswers: 0,
            scaledQtdAnswers: null,
            qtdAnswersByTag: {},
            scaledQtdAnswersByTag: null
        }
        let hasNext = null
        let page = 0

        do{
            page++
            const url = `https://api.stackexchange.com/2.2/users/${idsUser}/answers?page=${page}&pagesize=100&site=stackoverflow`
            const response = await this.request.get(url)

            const data = response.body
            hasNext = data.has_more
            defaultAnswerData.qtdAnswers += data.items.length

            for (let i = 0; i < data.items.length; i++) {
                if(defaultAnswerData.scoreAvg === null){
                    defaultAnswerData.scoreAvg = data.items[i].score
                } else {
                    defaultAnswerData.scoreAvg = (data.items[i].score + defaultAnswerData.scoreAvg) / 2
                }

                const urlQuestion = `https://api.stackexchange.com/2.2/questions/${data.items[i].question_id}?site=stackoverflow`
                const responseQuestion = await this.request.get(urlQuestion)
                
                const question = responseQuestion.body.items.pop()

                for (let j = 0; j < question.tags.length; j++) {
                    if(_.isEmpty(defaultAnswerData.qtdAnswersByTag) || !defaultAnswerData.qtdAnswersByTag[question.tags[j]]){
                        defaultAnswerData.qtdAnswersByTag[question.tags[j]] = 1
                    } else {
                        defaultAnswerData.qtdAnswersByTag[question.tags[j]]++
                    }
                }
            }
        } while (hasNext)

        return defaultAnswerData
    }

    async getQuestionsMetrics(idsUser){
        const defaultQuestionsData = {
            idUser: idsUser,
            scoreAvg: 0,
            scaledScoreAvg: null,
            qtdQuestions: 0,
            scaledQtdQuestions: null,
            qtdQuestionsByTag: {},
            scaledQtdQuestionsByTag: null
        }
        let hasNext = null
        let page = 0

        do{
            page++
            const url = `https://api.stackexchange.com/2.2/users/${idsUser}/questions?page=${page}&pagesize=100&site=stackoverflow`
            const response = await this.request.get(url)

            const data = response.body
            hasNext = data.has_more
            defaultQuestionsData.qtdQuestions += data.items.length

            for (let i = 0; i < data.items.length; i++) {
                if(defaultQuestionsData.scoreAvg === null){
                    defaultQuestionsData.scoreAvg = data.items[i].score
                } else {
                    defaultQuestionsData.scoreAvg = (data.items[i].score + defaultQuestionsData.scoreAvg) / 2
                }

                for (let j = 0; j < data.items[i].tags.length; j++) {
                    if(_.isEmpty(defaultQuestionsData.qtdQuestionsByTag) || !defaultQuestionsData.qtdQuestionsByTag[data.items[i].tags[j]]){
                        defaultQuestionsData.qtdQuestionsByTag[data.items[i].tags[j]] = 1
                    } else {
                        defaultQuestionsData.qtdQuestionsByTag[data.items[i].tags[j]]++
                    }
                }
            }
        } while (hasNext)

        return defaultQuestionsData
    }

    async getFeatures(userId) {
        try {
            const usersData = await this.getUsermetrics(userId)
            const answersData = await this.getAnswersMetrics(userId)
            const questionsData = await this.getQuestionsMetrics(userId)

            this.buildStackoverflowData(usersData, answersData, questionsData)
        }
        catch (err) {
            console.log(err)
        }
    }
}


module.exports = ApiStackoverflow