// главный роутер к которому присоединяются все остальные

const express = require('express')
const router = express.Router()

router.use('/', require('./mainRoutes'))
router.use('/', require('./authorizationRoutes'))
router.use('/', require('./scoreboardRoutes'))
router.use('/', require('./gameRoutes'))

module.exports = router