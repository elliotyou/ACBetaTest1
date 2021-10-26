const express = require('express')
const router = express.Router()
const { generalErrorHandler } = require('../middleware/error-handler')
const admin = require('./modules/admin')

const restController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')

router.use('/admin', admin)
router.get('/restaurants', restController.getRestaurant)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/', (req, res) => res.redirect('/restaurants'))
router.use('/', generalErrorHandler)

module.exports = router
