require('dotenv').config()
require('./db')
const express = require('express')
const app = express()
const cors = require('cors')
const { OAuth2Client } = require('google-auth-library')


app.use(cors())
app.use(express.json())

const getUserInfo = async (access_token) => {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token${access_token}`)
    const data = await response.json()
    console.log('user info', data)
}

app.get('/', async (req, res) => {
    const code = req.query.code

    try {
        const redirectUrl = "http://127.0.0.1:3000/oauth"

        const OAuthClient = new OAuth2Client(
            process.env.CLIENT_ID, 
            process.env.CLIENT_SECRET,
            redirectUrl
        )

        const res = await OAuthClient.getToken(code)
        await OAuthClient.setCredentials(res.tokens)
        console.log('tokens acquired')

        const user = OAuthClient.credentials
        console.log('user', user)

        await getUserInfo(user.access_token)
    }catch(error){
        console.log('error signin in with google', error.message)
    }
})

app.post('/', async (req, res) => {
    res.header('Referrer-Policy', 'no-referrer-when-downgrade')

    const redirectUrl = "http://127.0.0.1:3000/oauth"

    const OAuthClient = new OAuth2Client(
        process.env.CLIENT_ID, 
        process.env.CLIENT_SECRET,
        redirectUrl
    )

    const authorizeUrl = OAuthClient.generateAuthUrl({
        access_type: "offline",
        scope: "https://www.googleapis.com/auth/userinfo.profile openid",
        prompt: "consent"
    })

    res.json({url: authorizeUrl})
})

const PORT = process.env.PORT || 3300
app.listen(PORT, () => console.log("typing game server is listening on port ", PORT))