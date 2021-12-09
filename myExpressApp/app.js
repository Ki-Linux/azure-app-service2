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

app.all('/exAPI', (req, res) => {
  connection.query(
    'SELECT totalNumber FROM total WHERE name = ?',
    [req.body.sendName],
    (error, results) => {
      res.send(results);
      console.log(results);
    }
  )
})

app.all('/imgAPI', (req, res) => {
  connection.query(
    'SELECT totalNumber FROM img WHERE name = ?',
    [req.body.sendImgName],
    (error, results) => {
      res.send(results);
      console.log(results);
    }
  )
})

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
    'INSERT INTO total (name, totalNumber) VALUES (?, ?)',
    [[req.body.postUserName],[req.body.postNumber]],
    (error, results) => {
      console.log(results);
      res.redirect('/');
    }
  ); 
});

app.post('/post/img', (req, res) => {
  connection.query(
    'INSERT INTO img (name, totalNumber) VALUES (?, ?)',
    [[req.body.postUserName],[req.body.postNumber]],
    (error, results) => {
      console.log(results);
      res.redirect('/');
    }
  ); 
});

//新規登録

let ableSend = false;
let showName = "";

//データベースへ
let sayCannot = false;

app.post('/post/namePost', 
(req, res, next) => {
  connection.query(
    'SELECT * FROM login WHERE name = ?',
    [req.body.postName],
    (error, results) => {
      if(results.length > 0) {

        console.log('judge to say "No its same"');
        sayCannot = true;
      } else {

        console.log('judge its to next');
        next();
      }
    }
  )
},
async (req, res, next) => {
  
  const name = req.body.postName;
  const password = req.body.postPassword;
  const hashedPassword = await bcrypt.hash(password, 10);

    connection.query(
      'INSERT INTO login (name, password) VALUES (?, ?)',
      [name, hashedPassword],
      (error, results) => {
        console.log(results);
        ableSend = true;
        showName = name;
      }
    );

});

//エキストラと画像の平均点の初期設定
app.post('/post/pointPost', (req, res) => {

  const name = req.body.postUserName;
  connection.query(
    'INSERT INTO total (name, totalNumber) VALUES (?, ?)',
    [name, 0],
    (error, results) => {
      console.log('u' + results);
    }
  )
})

app.post('/post/pointImgPost', (req, res) => {

  const name = req.body.postUserNameByImg;
  connection.query(
    'INSERT INTO img (name, totalNumber) VALUES (?, ?)',
    [name, 0],
    (error, results) => {
      console.log('u' + results);
    }
  )

})

//ブラウザへ送る

//  すでに登録の通知
app.get('/sendTrue', (req, res) => {
  if(sayCannot) {
    console.log('yes can send');
    res.send("このユーザーネームはすでに登録してあります。");
    sayCannot = false;
    res.end();
  }
})


//ログイン

//ログイン審査
//let ableSend = false;

app.post('/loginTwo', (req, res) => {
  connection.query(
    'SELECT * FROM login WHERE name = ?',
    [req.body.loginName],
    (error, results) => {
      if(results.length > 0) {

        const password = req.body.loginPassword;
        const hash = results[0].password;

        bcrypt.compare(password, hash, (error, isEqual) => {
          if(isEqual) {
            console.log('succcess yes!');
            ableSend = true;
            showName = req.body.loginName;
          } else {
            console.log('not success login');

          }
        })
        
      }
    }

  )

  console.log(req.body.loginName);
})


app.get('/ableSendYes', (req, res) => {
  if(ableSend) {
    console.log('canSendAble');
    res.send(true);
    ableSend = false;
    res.end();
  }
})


//ログイン成功したら、ユーザーニックネームの表示
app.get('/getUserNameWithiykrnmltpoebrlmknebwr34t35reefwefWEFYUMm4te', (req, res) => {
  res.send(showName);
})

 
//sendgrid 
app.post('/post/send', (req, res) => {

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
