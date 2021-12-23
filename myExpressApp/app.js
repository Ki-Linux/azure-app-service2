const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

//本文ここから
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

//mysql
const connection = mysql.createConnection({
  host: 'servicenewquiz.mysql.database.azure.com',
  user: 'seima@servicenewquiz',
  password: 'Seikou34616',
  database: 'quiz',
  port: 3306,
  ssl: true
});

//connection  
connection.connect((err) => {
  if (err) {
    console.log('error  connecting: ' + err.stack);
    return;
  }
  console.log('success');
});

//ブラウザへ送る
app.get('/', (req, res) => {
  connection.query(
    'SELECT totalNumber FROM beginner',
    (error, results, fields) => {
      res.send(results); 
    });
});

app.get('/iAPI', (req, res) => {
  connection.query(
    'SELECT totalNumber FROM intermediate',
    (error, results, fields) => {
      res.send(results); 
    });
});

app.get('/adAPI', (req, res) => {
  connection.query(
    'SELECT totalNumber FROM advanced',
    (error, results, fields) => {
      res.send(results); 
    });
});


//データベースへ
app.post('/post/b', (req, res) => {
  connection.query(
    'INSERT INTO beginner (totalNumber) VALUES (?)',
    [req.body.postNumber],
    (error, results) => {
      console.log(results + "yes and");
      res.redirect('/');
    }
  ); 
});

app.post('/post/i', (req, res) => {
  connection.query(
    'INSERT INTO intermediate (totalNumber) VALUES (?)',
    [req.body.postNumber],
    (error, results) => {
      console.log(results);
      res.redirect('/');
    }
  ); 
});

app.post('/post/ad', (req, res) => {
  connection.query(
    'INSERT INTO advanced (totalNumber) VALUES (?)',
    [req.body.postNumber],
    (error, results) => {
      console.log(results);
      res.redirect('/');
    }
  ); 
});

app.post('/post/ex', (req, res) => {
  connection.query(
    'INSERT INTO extra (name, extra_quiz) VALUES (?, ?)',
    [[req.body.postUserName], [req.body.postNumber]],
    (error, results) => {
      console.log(results);
      res.redirect('/');
    }
  ); 
});

app.post('/post/img', (req, res) => {
  connection.query(
    'INSERT INTO extra (name, img_quiz) VALUES (?, ?)',
    [[req.body.postUserName], [req.body.postNumber]],
    (error, results) => {
      console.log(results);
      res.redirect('/');
    }
  ); 
});


//新規登録

//データベースへ

//username password
app.all('/post/sendUserData2.3', (req, res, next) => {
  connection.query(
    'SELECT * FROM login WHERE name = ?',
    [req.body.user_name],
    (error, results) => {
      if(results.length > 0) {
        console.log("not")
        res.send("このユーザーニックネームはすでにあります。");
      } else {
        console.log("not same");
        next();
      }
    }
  )
},
(req, res, next) => {
  bcrypt.hash(req.body.user_password, 10, (error, hash) => {
    connection.query(
      'INSERT INTO login (name, password) VALUES (?, ?)',
      [[req.body.user_name], hash],
      (error, results) => {
        console.log(results);
        next();
      }
    )
  })
},
(req, res) => {
  connection.query(
    'INSERT INTO extra (name, extra_quiz, img_quiz) VALUES (?, ?, ?)',
    [[req.body.user_name], 5, 2],
    (error, results) => {
      console.log(results);
      res.send("ログイン成功です。");
    }
  )
});

//loginからのデータで名前とパスワードが一致するかを確かめる
app.all('/post/login', (req, res) => {
  connection.query(
    'SELECT * FROM login WHERE name = ?',
    [req.body.post_login_name],
    (error, results) => {
      if(results.length > 0) {//name judge
        bcrypt.compare(req.body.post_login_password, results[0].password, (error, isEqual) => {
          if(isEqual) {// password judge
            console.log(results[0].password);
            res.send(true);
          } else {
            console.log('no');
            res.send(false);
          }
        })
      }
      else {
        console.log('no');
        res.send(false);
      }
      
    }
  )
});


//データベースと一致する名前の表示
app.all('/post/isdeihofhwioefwlvasknd', (req, res) => {
  connection.query(
    'SELECT * FROM extra WHERE name = ?',
    [req.body.select_user_name],
    (error, results) => {
      console.log(results);
      res.send(results);
    }
  )
});
 

//sendgrid 
app.all('/post/send', (req, res) => {

  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey('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');
  
  const msg = {
    to: 'hou007@hkoruy.sakura.ne.jp',
    from: 'aboutQuiz@ezweb.ne.jp',
    subject: 'クイズのお問い合わせ',
    text: req.body.postText + " " + req.body.postAddress,
    html: req.body.postText + " " + req.body.postAddress
  }   
  sgMail.send(msg);
});
//本文ここまで



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.listen(3000);
