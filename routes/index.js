const express = require('express')
const authorizationRoutes = require('./authorizationRoutes')
const scoreboardRoutes = require('./scoreboardRoutes')
const mainRoutes = require('./mainRoutes')

const router = express.Router()

router.use('/', mainRoutes)
router.use('/', authorizationRoutes)
router.use('/', scoreboardRoutes)

module.exports = router