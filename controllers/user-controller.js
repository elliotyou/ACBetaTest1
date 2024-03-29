const bcrypt = require('bcryptjs')
const { imgurFileHandler } = require('../helpers/file-helpers')
// const { noExtendLeft } = require('sequelize/types/lib/operators')
const db = require('../models')
const { User, Comment, Restaurant } = db
const userController = {
  getUser: (req, res, next) => {
    Promise.all([
      User.findByPk(req.params.id, { raw: true }),
      Comment.findAndCountAll({
        include: [User, Restaurant],
        where: { userId: req.params.id },
        raw: true,
        nest: true
      })
    ])
      .then(([user, comments]) => {
        if (!user) throw new Error("User doesn't exsist")
        return res.render('profile', {
          user,
          comments: comments.rows,
          commentCount: comments.count
        })
      })
    // User.findByPk(req.params.id, { raw: true })
    //   .then(user => {
    //     if (!user) throw new Error("User doesn't exsist")
    //     return res.render('profile', { user })
    //   })
  },
  editUser: (req, res, next) => {
    User.findByPk(req.params.id, { raw: true })
      .then(user => {
        if (!user) throw new Error("User doesn't exist")
        return res.render('profile-form', { user })
      })
  },
  putUser: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('User name is required!')
    const { file } = req
    Promise.all([
      User.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error("User doesn't exist!")
        return user.update({
          name,
          image: filePath || user.image
        })
      })
      .then(() => {
        req.flash('success_messages', 'user profile was successfully updated')
        res.redirect(`/users/${req.params.id}`)
      })
      .catch(err => next(err))
  },
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('email already exists!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(() => {
        req.flash('success_messages', '成功註冊帳號!')
        res.redirect('/signin')
      })
      .catch(err => {
        console.log('in controllers/user-controller, line 27')
        console.log('err', err)
        next(err)
      })
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  }
}
module.exports = userController
