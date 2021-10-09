var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//kokokara
const cors = require('cors');
const mysql = require('mysql');
//kokomade


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//kokokara
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

//mysql
const connection = mysql.createConnection({
  host: 'ser0616.mysql.database.azure.com',
  user: 'myser0616@ser0616',
  password: 'Seikou34616',
  database: 'quiz',
  port: 3306,
  ssl: true
});

//connection
connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});


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

app.post('/post/b', (req, res) => {
  connection.query(
    'INSERT INTO beginner (totalNumber) VALUES (?)',
    [req.body.postNumber],
    (error, results) => {
      console.log(results);
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
 
//sendgrid 
app.post('/post/send', (req, res) => {

  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey('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');
  
  const msg = {
    to: 'hou912@someima.com',
    from: 'aboutQuiz@ezweb.ne.jp',
    subject: 'クイズのお問い合わせ',
    text: req.body.postText + " " + req.body.postAddress,
    html: req.body.postText + " " + req.body.postAddress
  }   
  sgMail.send(msg);
  }); 
  //kokomade

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
