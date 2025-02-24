const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const routes = require('./routes')

const app = express()

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false
}))

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')

app.use('/', routes)

const PORT = process.env.PORT || 2006

app.listen(PORT, () => {
    console.log(`SERVER HAS BEEN STARTED: http://localhost:${PORT}`)
})