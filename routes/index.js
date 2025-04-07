const express = require('express')
const mainRoutes = require('./mainRoutes')
const authorizationRoutes = require('./authorizationRoutes')
const scoreboardRoutes = require('./scoreboardRoutes')
const gameRoutes = require('./gameRoutes')

const router = express.Router()

router.use('/', mainRoutes)
router.use('/', authorizationRoutes)
router.use('/', scoreboardRoutes)
router.use('/', gameRoutes)

module.exports = router