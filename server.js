const express = require('express')
const session = require('express-session')
const app = express()

app.use(express.static('.'))
app.use(express.json())
app.use(session({
  secret: 'test123',
  resave: false,
  saveUninitialized: false
}))

// 账号密码
const USER = {
  username: 'user',
  password: '123456',
  name: '传承人',
  avatar: './avatar.png'
}

// 登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  if (username === USER.username && password === USER.password) {
    req.session.user = USER
    return res.json({ code: 0 })
  }
  res.json({ code: 1 })
})

// 获取用户信息（给主页导航栏用）
app.get('/api/user', (req, res) => {
  res.json(req.session.user || null)
})

app.listen(3000, () => console.log('已启动：http://localhost:3000'))