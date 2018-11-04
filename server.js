const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const passport = require('passport');

const app = express();

app.use(bodyParser.urlencoded({ extended : false}));
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, {useNewUrlParser:true, uri_decode_auth: true})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

//passport middleware
app.use(passport.initialize());

//Passport config

require('./config/passport')(passport);

// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));
