const express = require("express");

const morgan = require("morgan");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const ejs = require("ejs");

const engine = require("ejs-mate");

const passport = require("passport");

const session = require("express-session");

const cookieParser = require("cookie-parser");

const MongoStore = require("connect-mongo");

const flash = require("express-flash");

var app = express();

var secret = require("./config/secret");

mongoose.connect(secret.database, (err) => {
  if (err) {
    return err;
  } else {
    console.log("Connected to the database");
  }
});

app.use(express.static(__dirname + "/public"));

app.engine("ejs", engine);

app.set("view engine", "ejs");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use(cookieParser());

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: secret.secretKey,
    store: MongoStore.create({
      mongoUrl: secret.database,
      autoReconnect: true,
    }),
  })
);

app.use(passport.initialize());

app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.user;

  next();
});

require("./routes/main")(app);

require("./routes/user")(app);

require("./routes/teacher")(app);

require("./routes/payment")(app);

app.listen(secret.port, (err) => {
  if (err) {
    console.log("Error: ", err);
  } else {
    console.log(`Running on port ${secret.port}`);
  }
});
