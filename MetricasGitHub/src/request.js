const rp = require('request-promise')

class Request {
    constructor() {
        this.RPAP = rp.defaults({
            resolveWithFullResponse: true,
            headers : {
                'Authorization' : `Bearer ${process.env.AUTH_TOKEN}`,
                'User-Agent': 'Awesome-Octocat-App'
            }
        })
    }

    async post(url, body) {
        const options = {
            method: 'POST',
            uri: url,
            body: body,
            json: true
        }

        try {
            return await this.RPAP(options)
        } catch(err) {
            console.log(err)
            throw err
        }
    }
}

module.exports = Request