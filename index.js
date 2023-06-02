const bodyParser = require("body-parser");
const express = require("express");

const passport = require('passport');
const cookieSession = require('cookie-session');
const Post = require('./configs/mongo');

require('./configs/passport-config');
// app.use(express.static('public'));


const app = express();
app.use(cookieSession({
    name: 'google-auth-session',
    keys: ['key1', 'key2']
  }))

  const isLoggedIn = (req, res, next) => {
    if (req.user) {
    next();
    } else {
    res.render('login');
    }
    }
app.use(passport.initialize());
app.use(passport.session());


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static("public"));



app.get('/google',
    passport.authenticate('google', {
            scope:
                ['email', 'profile']
        }
    ));
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login',
    }),
    function (req, res) {
        res.redirect('/')

    }
);

app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
    })

app.get("/",isLoggedIn, (req, res) => {
  
  Post.find({}, (err, result) => {
    if (err) {
      console.log(err);
      return res.send("Error");
    } else {
      res.render("home", { posts: result, user: req.user });
    }
  });
});

app.get("/write" ,isLoggedIn,(req, res) => {
  res.render("create-post",{user: req.user});
});

app.post("/",isLoggedIn, (req, res) => {
 
  const newPost = new Post({
    title: req.body.title,
    message: req.body.message,
    author: req.user.emails[0].value,
    createdAt: Date.now()

  });
  newPost.save((err, result) => {
    if (err) {
      console.log(err);
      res, send("Error saving post");
    } else {
      
      res.redirect("/");
    }
  });

 
});
app.get('/posts/:id', (req, res) => {
  // console.log(req.params);

  // getting the id from the url
  const postId = req.params.id;

  // getting the post from the database using the id from the url
  Post.findById(postId, (err, result) => {
      if (err) {
          console.log(err);
          res.send('Error loading post');
      }
      else {
          console.log(result);
          let postAuthor = result.author;
          res.render('post', { post: result, user: req.user, author: postAuthor });
      }
  });
})

app.get('/posts/:id/delete',(req,res)=>{
  const postId = req.params.id;
  Post.deleteOne({_id:postId},(err,result)=>{
    if(err){
      console.log(err);
      res.send('Error Deleting the post');
    }
    else{
      res.redirect('/')
    }
  })
})
app.get('/posts/:id/edit',(req,res)=>{
  const postId = req.params.id;
  Post.findById(postId,(err,result)=>{
    if(err){
      console.log(err);
      res.send('Error loading post');
    }
    else{
      res.render('edit-post',{user:req.user,post:result});
    }
  })
 

})
app.post('/posts/:id/edit',(req,res)=>{
  const postId = req.params.id;
  const updatedTitle =req.body.title;
  const updatedMessage =req.body.message;
  Post.updateOne({_id:postId},{title:updatedTitle,message:updatedMessage},(err,result)=>{
    if(err){
      console.log(err);
      res.send('Error Updating the post');
    }
    else{
      console.log('Post Updated Successfully');
      res.redirect('/')
    }
  })


})

app.listen(3000, () => {
  console.log("Server is running on port 3000");
}); 
