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
const formidable = require('formidable');
const fs = require('fs'); 
const app = express();
var greekUtils = require('greek-utils');
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
  var sql = "SELECT  * FROM tbl_slideshow INNER JOIN tbl_books ON tbl_slideshow.book_id=tbl_books.book_id;";
  let query = conn.query(sql, (err, results)=>{
    if(err) throw err;
    res.render('index',
    { results: results,
      user: req.user });
    });
});
  
app.get('/slideshowPanel',(req,res) => {
  var sql = "SELECT  * FROM tbl_slideshow INNER JOIN tbl_books ON tbl_slideshow.book_id=tbl_books.book_id;";
  var sql2 = "SELECT  * FROM tbl_books INNER JOIN tbl_book_authors ON tbl_books.book_author_id=tbl_book_authors.book_author_id;"
  let query = conn.query(sql, (err, results)=>{
    if(err) throw err;
    let query2 = conn.query(sql2, (err, results2)=>{
      if(err) throw err;
      res.render('slideshowPanel',{ results2: results2, results: results, user: req.user});
    });
  });
});

app.post('/addSlideshowBook',(req,res) => {
  console.log(req.body);
  let data = { book_id: req.body.book_id};
  let sql = "INSERT INTO tbl_slideshow SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('slideshowPanel');
  });
});

app.post('/removeSlideshowBook',(req,res) => {
  console.log(req.body);
  let sql = "DELETE FROM tbl_slideshow WHERE book_id="+req.body.book_id+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('slideshowPanel');
  });
});

app.post('/upload', (req, res, next) => { 
  const form = new formidable.IncomingForm(); 
  form.parse(req, function(err, fields, files){
      var oldPath = files.file.path;
      if (fields.type == "book_cover"){
        var newPath = path.join(__dirname, 'public')+ '/img/covers/'+fields.name+".jpg"
        var rawData = fs.readFileSync(oldPath); 
        fs.writeFile(newPath, rawData, function(err){ 
          if(err) console.log(err) 
          res.render('account',{
            user: req.user });
          return ;
      });
      }
      else if(fields.type == "user_upload"){

        let fileName = greekUtils.toGreeklish(files.file.name);
        let randomNumber = Math.floor(Math.random() * 101);
        fileName = randomNumber+fileName;
        var newPath = path.join(__dirname, 'public')+ '/uploadedbyusers/'+fileName;
        console.log(newPath);
        var rawData = fs.readFileSync(oldPath); 
        let sql="INSERT INTO tbl_uploads (name,user_id,type_of_upload,path) VALUES('"+files.file.name+"',"+fields.user_id+",'"+fields.documentType+"','"+fileName+"')";
        let query = conn.query(sql, (err, results) => {
          if(err) throw err;
        fs.writeFile(newPath, rawData, function(err){ 
          if(err) console.log(err) 
          res.redirect('account');})
          })
      
      }
  }); 
}); 
//delete upload from pc and from db
app.post('/deleteUpload',require('connect-ensure-login').ensureLoggedIn(),(req, res) => {
  let sql0 = "SELECT * FROM tbl_uploads WHERE id='"+req.body.upload_id+"'";
  let query0 = conn.query(sql0, (err, results0) => {
    let sql = "DELETE FROM tbl_uploads WHERE id='"+req.body.upload_id+"'";
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
      var Pathara = path.join(__dirname, 'public')+ '/uploadedbyusers/'+results0[0].path;
      fs.unlink(Pathara, (err) => {
        if (err) throw err;
        res.redirect(req.body.redirect);
      });
    });
  });
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
      for (i = 0 ; i<results.length; i++){
        results[i].sum = 0;
      }
      for (i = 0 ; i<results.length; i++){
        for (j=0 ; j<results2.length; j++){
          if(results2[j].book_category == results[i].id ){
            results[i].sum = results[i].sum + 1 ;
          }
        }
      }

      
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

//route for insert in Wishlist
app.post('/saveWishlist',require('connect-ensure-login').ensureLoggedIn(),(req, res) => {
  let data = {book_id: req.body.book_id,user_id: req.body.user_id};
  let sql = "INSERT INTO tbl_wishlist SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/book/'+req.body.book_id);
  });
});

//route for delete entry in Wishlist
app.post('/deleteWishlist',require('connect-ensure-login').ensureLoggedIn(),(req, res) => {
  let sql = "DELETE FROM tbl_wishlist WHERE book_id='"+req.body.book_id+"' AND user_id='"+req.body.user_id+"'";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect(req.body.redirect);
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
      for (j = 0 ; j<results.length; j++){
        results[j].sum = 0;
      }
      
      for (i = 0 ; i<results2.length; i++){
        for (j=0 ; j<results.length; j++){
          if(results2[i].book_author_id == results[j].book_author_id ){
            results[j].sum = results[j].sum + 1 ;
          }
        }
      }
      res.render('viewAuthors',{
      results: results,
      user: req.user });
    });
    
  });
});

//route for insert author
app.post('/saveAuthor',(req, res) => {
  let data = {author_name: req.body.author_name, author_description: req.body.author_description};
  let sql = "INSERT INTO tbl_book_authors SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/authorsView');
  });
});

//route for update author
app.post('/updateAuthor',(req, res) => {
  let sql = "UPDATE tbl_book_authors SET author_name='"+req.body.author_name+"', author_description='"+req.body.author_description+"' WHERE book_author_id="+req.body.book_author_id;
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
    let sql ="SELECT book_id, book_title, tbl_categories.category_name, book_category, book_description, book_cover, tbl_book_authors.author_name, tbl_books.book_author_id FROM `tbl_books` INNER JOIN tbl_categories ON tbl_books.book_category = tbl_categories.id INNER JOIN tbl_book_authors ON tbl_books.book_author_id = tbl_book_authors.book_author_id ";
    let sql2 = "SELECT * FROM tbl_categories";
    let sql3 = "SELECT * FROM tbl_book_authors";

    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
      let query = conn.query(sql2, (err, results2) => {
        if(err) throw err;
        let query = conn.query(sql3, (err, results3) => {
          if(err) throw err;
          // Το pather πρέπει να διαλεχθεί ανάλογα με το pc σου και που έχεις τα αρχεία αρα πρέπει να αλλάξεις το .env αρχείο
          var pather = process.env.PATHER+"/img/covers/";
          fs.readdir(pather, (err, files) => { 
            if (err) 
              console.log(err); 
            else { 
              res.render('book_view',{
                results: results,
                results2: results2,
                results3: results3,
                files: files,
                user: req.user });
            } 
          }) 
          

        });
      });
    });
  }
);
app.post('/save', (req, res, next) => { 
  const form = new formidable.IncomingForm(); 
  form.parse(req, function(err, fields, files){


    if (fields.book_cover == "NewImage"){
      let fileName = greekUtils.toGreeklish(fields.book_title);
      fileName = fileName.replace(/ /g,"_");
      var str = files.fileForCoverType.name;
      var indices = [];
      for(var i=0; i<str.length;i++) {
        if (str[i] === ".") indices.push(i);
      }

      var pointOfLastDot = indices[indices.length-1];
      var typeOfFile = files.fileForCoverType.name.slice(pointOfLastDot);
      fileName = fileName.concat(typeOfFile);
      var oldPath = files.fileForCoverType.path;
      var newPath = path.join(__dirname, 'public')+ '/img/covers/'+fileName;
      var rawData = fs.readFileSync(oldPath);
      fs.writeFile(newPath, rawData, function(err){ 
        if(err) console.log(err);
    });
    var book_cover = "../img/covers/"+fileName;
    let data = {book_title: fields.book_title, book_description: fields.book_description, book_cover: book_cover, book_author_id: fields.book_author_id, book_category: fields.book_category};
      let sql = "INSERT INTO tbl_books SET ?";
      let query = conn.query(sql, data,(err, results) => {
        if(err) throw err;
          res.redirect('/bookview');
      });

    }
    else{
      let data = {book_title: fields.book_title, book_description: fields.book_description, book_cover: fields.book_cover, book_author_id: fields.book_author_id, book_category: fields.book_category};
      let sql = "INSERT INTO tbl_books SET ?";
      let query = conn.query(sql, data,(err, results) => {
        if(err) throw err;
          res.redirect('/bookview');
      });
    }

      });
});

app.post('/update', (req, res, next) => { 
  const form = new formidable.IncomingForm(); 
  form.parse(req, function(err, fields, files){
  if (fields.book_cover == "NewImage"){
    let fileName = greekUtils.toGreeklish(fields.book_title);
    fileName = fileName.replace(/ /g,"_");
    var str = files.fileForCoverTypeFromUpdate.name;
    var indices = [];
    for(var i=0; i<str.length;i++) {
      if (str[i] === ".") indices.push(i);
    }

    var pointOfLastDot = indices[indices.length-1];
    var typeOfFile = files.fileForCoverTypeFromUpdate.name.slice(pointOfLastDot);
    fileName = fileName.concat(typeOfFile);
    var oldPath = files.fileForCoverTypeFromUpdate.path;
    var newPath = path.join(__dirname, 'public')+ '/img/covers/'+fileName;
    var rawData = fs.readFileSync(oldPath);
    fs.writeFile(newPath, rawData, function(err){ 
      if(err) console.log(err);
  });
  var book_cover = "../img/covers/"+fileName;
  let sql = "UPDATE tbl_books SET book_title='"+fields.book_title+"', book_description='"+fields.book_description+"', book_cover='"+book_cover+"', book_author_id='"+fields.book_author_id+"', book_category='"+fields.book_category+"' WHERE book_id="+fields.id;
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
        res.redirect('/bookview');
    });

  }
  else{
    let sql = "UPDATE tbl_books SET book_title='"+fields.book_title+"', book_description='"+fields.book_description+"', book_cover='"+fields.book_cover+"', book_author_id='"+fields.book_author_id+"', book_category='"+fields.book_category+"' WHERE book_id="+fields.id;
    let query = conn.query(sql, (err, results) => {
     if(err) throw err;
      res.redirect('/bookview');
  });
  }

  });
});

// //route for update data
// app.post('/update',(req, res, body) => {
//   let sql = "UPDATE tbl_books SET book_title='"+req.body.book_title+"', book_description='"+req.body.book_description+"', book_cover='"+req.body.book_cover+"', book_author_id='"+req.body.book_author_id+"', book_category='"+req.body.book_category+"' WHERE book_id="+req.body.id;
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//     res.redirect('/bookview');
//   });
// });
 
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
  let sql = "SELECT book_id,book_title, book_description, book_cover, tbl_book_authors.author_name, tbl_books.book_author_id, book_reviewer_id, book_is_written, book_is_reviewed, book_is_published, tbl_categories.category_name, tbl_books.book_category FROM tbl_books INNER JOIN tbl_book_authors ON tbl_books.book_author_id = tbl_book_authors.book_author_id INNER JOIN tbl_categories ON tbl_books.book_category = tbl_categories.id WHERE tbl_books.book_id="+req.params.input+"";
  let sql2 ="SELECT book_id,anonymous,comment,id_comment,rating,date,tbl_users.user_id,tbl_users.firstName FROM tbl_comments INNER JOIN tbl_users ON tbl_comments.user_id = tbl_users.user_id WHERE book_id="+req.params.input+"";
  if (req.user) {
    var sql3 = "SELECT * FROM tbl_wishlist WHERE book_id="+req.params.input+" AND user_id="+req.user.user_id+"";
  }
  else {
    var sql3 ="SELECT * FROM tbl_wishlist WHERE book_id=0 AND user_id=0";
  }
  let query3 = conn.query(sql3, (err, results3) => {
    if(err) throw err;
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
      let query2 = conn.query(sql2,(err, results2)=>
      {res.render('book',
      { results: results,
        results2: results2, 
        results3:results3,
        user: req.user });
      })
    });
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
app.get('/emailsent',
  function(req, res) {
    res.render('emailsent', { user: req.user });
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
      res.redirect('registered');
    });
  });
})

app.get('/registered',
  function(req, res) {
    res.render('registered');
  }
);


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
    let sql ="SELECT * FROM tbl_comments WHERE user_id="+req.user.user_id+";";
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
      let sql2 = "SELECT tbl_wishlist.book_id , tbl_wishlist.user_id, tbl_books.book_title, tbl_book_authors.author_name FROM `tbl_wishlist` INNER JOIN tbl_books ON tbl_wishlist.book_id = tbl_books.book_id INNER JOIN tbl_book_authors ON tbl_books.book_author_id = tbl_book_authors.book_author_id WHERE tbl_wishlist.user_id ="+req.user.user_id+";";
      let query2 = conn.query(sql2, (err, results2) => {
        if(err) throw err;
        let sql3 ="SELECT * FROM tbl_uploads WHERE user_id="+req.user.user_id+";";
        let query3 = conn.query(sql3,(err, results3) =>{
          if(err) throw err;
          if (results.length != 0){
            results[0].length = results.length;
          }
    
          if (results2.length != 0){
            for (i = 0; i<results2.length ; i++){
              results2[i].user_id = req.user.user_id;
            }
          }
          res.render('account',{
          results :results,
          results2 : results2,
          results3 : results3,
          user: req.user });
        })
        
    });
  });   
});

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

app.get('/emailToUser',
  function(req, res){
    let sql = "SELECT * FROM tbl_users";
    let query = conn.query(sql,(err, results) => {
      if(err) throw err;
      res.render('emailToUser',{
        results: results,
        user: req.user });
    });
  }
);




// POST route from contact form
app.post('/sendToUser', (req, res) => {
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
    to: req.body.email,
    subject: req.body.subject,
    text: `${req.body.text}`
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