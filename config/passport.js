const passport = require("passport");

const FacebookStrategy = require("passport-facebook").Strategy;

const secret = require("./secret");

const async = require("async");

const request = require("request");

const User = require("../models/user");

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  new FacebookStrategy(
    secret.facebook,
    (req, token, refreshToken, profile, done) => {
      User.findOne({ facebook: profile.id }, (err, user) => {
        if (err) {
          return done(err);
        } else if (user) {
          req.flash("loginMessage", "Successfully login with facebook");
          return done(null, user);
        } else {
          async.waterfall([
            (callback) => {
              var newUser = new User();
              newUser.email = profile._json.email;
              newUser.facebook = profile.id;
              newUser.tokens.push({ kind: "facebook", token: token });
              newUser.profile.name = profile.displayName;
              newUser.profile.picture =
                "https://graph.facebook.com/" +
                profile.id +
                "/picture?type=large";
              newUser.save((err) => {
                if (err) {
                  throw err;
                }
                req.flash("loginMessage", "Successfully login with facebook");
                callback(err, newUser);
              });
            },
            (newUser, callback) => {
              request(
                {
                  url:
                    "https://us13.api.mailchimp.com/3.0/lists/bd160a874e/members",
                  method: "POST",
                  headers: {
                    Authorization:
                      "randomUser 7462ddf8a8ce62a2e566478f313085fc-us13",
                    "Content-Type": "application/json",
                  },
                  json: {
                    email_address: newUser.email,
                    status: "subscribed",
                  },
                },
                (err, response, body) => {
                  if (err) {
                    done(err, newUser);
                  } else {
                    console.log("Success");
                    return done(null, newUser);
                  }
                }
              );
            },
          ]);
        }
      });
    }
  )
);
