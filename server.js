//use path module
const path = require('path');
//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
const dotenv = require("dotenv");
dotenv.config();
//use bodyParser middleware
const bodyParser = require('body-parser');
//var db = require('./db');
const flash = require('connect-flash');
//use mysql database
const mysql = require('mysql');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt');
const app = express();

//Create connection
const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DB
});

//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});



passport.use('local',new Strategy(
    // by default, local strategy uses username and password, we will override with email
  function(username, password, done) { // callback with email and password from our form
    conn.query("SELECT * FROM tbl_users WHERE username = ?",username, function(err, rows){
      
      if (err)
        return done(err);
      if (!rows.length) { return done(null, false); }
      // req.flash is the way to set flashdata using connect-flash
      // if the user is found but the password is wrong
      if (!bcrypt.compareSync(password, rows[0].password))
        return done(null, false); 
      // create the loginMessage and save it to session as flashdata
      // all is well, return successful user
      return done(null, rows[0]);
    });
  })
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.user_id);
});

passport.deserializeUser(function(id, cb) {
  conn.query("select * from tbl_users where user_id = "+id,function(err,rows){
    cb(err, rows[0]);
  });
});

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//set views file
app.set('views',path.join(__dirname,'views'));
//set view engine
app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/partials');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set public folder as static folder for static file
app.use(express.static(__dirname + '/public'));


//route for homepage
app.get('/',(req, res) => {
  res.render('index',{user: req.user});
});

//route for allBooks
app.get('/allBooks',(req, res) => {
  let sql2 = "SELECT * FROM tbl_categories;"
  
  let query2 = conn.query(sql2, (err, results2) => {
    if(err) throw err;
    if(req.query.category){
      var sql = "SELECT book_id,book_title,book_description,book_cover FROM tbl_books WHERE book_category="+req.query.category+";"
      var sql4 = "SELECT * FROM tbl_book_authors;";
    }
    else if(req.query.author){
      var sql = "SELECT book_id,book_title,book_description,book_cover FROM tbl_books WHERE book_author_id="+req.query.author+";";
      var sql4 = "SELECT * FROM tbl_book_authors WHERE book_author_id="+req.query.author+";";
    }
    else{
      var sql = "SELECT book_id,book_title,book_description,book_cover FROM tbl_books;"
      var sql4 = "SELECT * FROM tbl_book_authors;";
    }

    let query = conn.query(sql4, (err, results4) => {
      if(err) throw err;
      let query = conn.query(sql, (err, results) => {
        if(err) throw err;
        results3 = req.params;
        if(req.query.category){
        results3.category_name=results2[req.query.category].category_name;
        results3.category=req.query.category;
        }else if(req.query.author){ 
          results3.author_name = results4[0].author_name;
          results3.book_author_id = req.query.author; 
          
        }
        
        totalPages = Math.floor(results.length/6);
        if (results.length%6 > 0 ){
          totalPages = totalPages + 1 ;
        }
        results3.totalPages = totalPages;
        page = req.query.page;
        if (req.query.page){
          page = req.query.page;
        }else{
          page = 1;
        }

        res.render('allBooks',{
          page : page,
          results2 : results2,
          results3 : results3,
          results: results.slice((page-1)*6,(page-1)*6+6), 
          user: req.user });
        
      });
    })
    
  });
});


//route for categories
app.get('/viewCategories',(req, res) => {
  let sql = "SELECT * FROM tbl_categories";
  let sql2 = "SELECT book_category FROM tbl_books ORDER BY book_category ASC";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    let query = conn.query(sql2, (err, results2) => {
      if(err) throw err;
      sum = 0;
      pointer = 0;
      for (i = 0; i < results2.length; i++) {
        if (pointer == results2[i].book_category){
          sum = sum + 1;

        }
        else{
          results[pointer].sum=sum;
          pointer = results2[i].book_category;
          sum = 1;
        }
      }
      results[pointer].sum=sum;

      
      res.render('viewCategories',{
      results: results,
      user: req.user });
    });
    
  });
});

//route for insert category
app.post('/saveCat',require('connect-ensure-login').ensureLoggedIn(),(req, res) => {
  let data = {category_name: req.body.category_name};
  let sql = "INSERT INTO tbl_categories SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/viewCategories');
  });
});

//route for update category
app.post('/updateCat',require('connect-ensure-login').ensureLoggedIn(),(req, res) => {
  let sql = "UPDATE tbl_categories SET category_name='"+req.body.category_name+"' WHERE id="+req.body.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/viewCategories');
  });
});
 
//route for delete category
app.post('/deleteCat',require('connect-ensure-login').ensureLoggedIn(),(req, res) => {
  let sql = "DELETE FROM tbl_categories WHERE id="+req.body.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/viewCategories');
  });
});


//route for authors
app.get('/authorsView',(req, res) => {
  let sql = "SELECT * FROM tbl_book_authors";
  let sql2 = "SELECT book_author_id FROM tbl_books ORDER BY book_author_id ASC";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    let query = conn.query(sql2, (err, results2) => {
      if(err) throw err;
      let sum = 0;
      pointer = 1;
      for (i = 0; i < results2.length; i++) {
        if (pointer == results2[i].book_author_id){
          sum = sum + 1;

        }
        else{
          results[pointer-1].sum=sum;
          pointer = results2[i].book_author_id;
          sum = 1;
        }
      }
      results[pointer].sum=sum;

      
      res.render('viewAuthors',{
      results: results,
      user: req.user });
    });
    
  });
});

//route for insert author
app.post('/saveAuthor',(req, res) => {
  let data = {author_name: req.body.author_name, author_description: req.body.author_description, author_photo: req.body.author_photo};
  let sql = "INSERT INTO tbl_book_authors SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/authorsView');
  });
});

//route for update author
app.post('/updateAuthor',(req, res) => {
  let sql = "UPDATE tbl_book_authors SET author_name='"+req.body.author_name+"', author_description='"+req.body.author_description+"',  author_photo='"+req.body.author_photo+"' WHERE book_author_id="+req.body.book_author_id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/authorsView');
  });
});
 
//route for delete author
app.post('/deleteAuthor',(req, res) => {
  let sql = "DELETE FROM tbl_book_authors WHERE book_author_id="+req.body.book_author_id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/authorsView');
  });
});



//route for bookview
app.get('/bookview',
  
  function(req, res){
    let sql ="SELECT book_id, book_title, tbl_categories.category_name, book_category, book_description, book_cover, tbl_book_authors.author_name, tbl_books.book_author_id, book_reviewer_id, book_is_written, book_is_reviewed, book_is_published FROM `tbl_books` INNER JOIN tbl_categories ON tbl_books.book_category = tbl_categories.id INNER JOIN tbl_book_authors ON tbl_books.book_author_id = tbl_book_authors.book_author_id ";
    let sql2 = "SELECT * FROM tbl_categories";
    let sql3 = "SELECT * FROM tbl_book_authors";
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
      let query = conn.query(sql2, (err, results2) => {
        if(err) throw err;
        let query = conn.query(sql3, (err, results3) => {
          if(err) throw err;
          res.render('book_view',{
            results: results,
            results2: results2,
            results3: results3,
            user: req.user });
          });
      });
    });
  }
);

//route for insert data
app.post('/save',(req, res) => {
  let data = {book_title: req.body.book_title, book_description: req.body.book_description, book_cover: req.body.book_cover, book_author_id: req.body.book_author_id, book_reviewer_id: req.body.book_reviewer_id, book_is_written: req.body.book_is_written , book_is_reviewed: req.body.book_is_reviewed , book_is_published: req.body.book_is_published, book_category: req.body.book_category};
  let sql = "INSERT INTO tbl_books SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/bookview');
  });
});

//route for update data
app.post('/update',(req, res) => {
  let sql = "UPDATE tbl_books SET book_title='"+req.body.book_title+"', book_description='"+req.body.book_description+"', book_cover='"+req.body.book_cover+"', book_author_id='"+req.body.book_author_id+"', book_reviewer_id='"+req.body.book_reviewer_id+"', book_is_written='"+req.body.book_is_written+"', book_is_reviewed='"+req.body.book_is_reviewed+"', book_is_published='"+req.body.book_is_published+"', book_category='"+req.body.book_category+"' WHERE book_id="+req.body.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/bookview');
  });
});
 
//route for delete data
app.post('/delete',(req, res) => {
  let sql = "DELETE FROM tbl_books WHERE book_id="+req.body.book_id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/bookview');
  });
});

//route for book 
app.get('/book/:input',(req, res) => {
  let sql = "SELECT book_id,book_title, book_description, book_cover, tbl_book_authors.author_name, book_reviewer_id, book_is_written, book_is_reviewed, book_is_published, tbl_categories.category_name FROM tbl_books INNER JOIN tbl_book_authors ON tbl_books.book_author_id = tbl_book_authors.book_author_id INNER JOIN tbl_categories ON tbl_books.book_category = tbl_categories.id WHERE tbl_books.book_id="+req.params.input+"";
  let sql2 ="SELECT book_id,anonymous,comment,id_comment,rating,date,tbl_users.user_id,tbl_users.firstName FROM tbl_comments INNER JOIN tbl_users ON tbl_comments.user_id = tbl_users.user_id WHERE book_id="+req.params.input+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    let query2 = conn.query(sql2,(err, results2)=>
    {res.render('book',
    { results: results,
      results2: results2, 
      user: req.user });
    })
  });
});

app.post('/newReview',(req, res) => {
  let data = {book_id: req.body.book_id, user_id: req.body.user_id, anonymous: req.body.anonymous, comment: req.body.commentText, rating: parseInt(req.body.rating), date: req.body.date};
  let sql = "INSERT INTO tbl_comments SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/book/'+req.body.book_id);
  });
});

app.post('/removeComment',(req, res) => {
  let sql = "DELETE FROM tbl_comments WHERE id_comment="+req.body.removeCommentId+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect(req.get('referer'));
  });
});

app.get('/stores',
  function(req, res) {
    res.render('stores', { user: req.user });
  }
);
app.get('/emailSent',
  function(req, res) {
    res.render('emailSent', { user: req.user });
  }
);

app.get('/emailFailed',
  function(req, res) {
    res.render('emailFailed', { user: req.user });
  }
);

app.get('/registerForm',
  function(req, res) {
    res.render('registerForm', { user: req.user });
  }
);

app.get('/contactForm',
  function(req, res) {
    res.render('contactForm', { user: req.user });
  }
);

app.post('/registerUser', function(req,res){
  bcrypt.hash(req.body.password,10,(err,hash)=>{
    if (err){throw(err);};
    let data = {username: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName, password: hash, email: req.body.email, role: 'User'};
    let sql = "INSERT INTO tbl_users SET ?";
    let query = conn.query(sql, data, (err, results) => {
      if(err) throw err;
      res.redirect('registerForm');
    });
  });
})

// Define routes for passport.
app.get('/fakehome',
  function(req, res) {
    res.render('fakehome', { user: req.user });
  }
);

app.get('/login',
  function(req, res){
    res.render('login');
  }
);
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(req.get('referer'));
  }
);

//when log-in attempt from login.hbs
app.post('/login2', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  }
);
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect(req.get('referer'));
  }
);

app.get('/account',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('account', { user: req.user });
  }
);

// POST route from contact form
app.post('/contact', (req, res) => {

  // Instantiate the SMTP server
  const smtpTrans = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  })

  // Specify what the email will look like
  const mailOpts = {
    from: 'Your sender info here', // This is ignored by Gmail
    to: process.env.GMAIL_USER,
    subject: 'New message from contact form at ekdotikosOikos',
    text: `${req.body.firstname} ${req.body.surname} (${req.body.email}) says: ${req.body.subject}`
  }

  // Attempt to send the email
  smtpTrans.sendMail(mailOpts, (error, response) => {
    if (error) {
      res.render('emailFailed') // Show a page indicating failure
    }
    else {
      res.render('emailsent') // Show a page indicating success
    }
  })
})
var portNumber = process.env.port || process.env.PORT || 3000;
//server listening
app.listen(portNumber, () => {
  console.log('Server is running at port '+portNumber);
});