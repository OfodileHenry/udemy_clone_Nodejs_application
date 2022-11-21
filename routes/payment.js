const User = require("../models/user");

const Course = require("../models/course");

const stripe = require("stripe")(
  "sk_test_51GXVTqJjXtfq5B90UGQ4zPQpqAobQIGBIDRLrQLkmleCsV7qXRj78vi214zc8hRYdB1kZw1aj3nTuhx8wNbMDyW400yJlvHMiV"
);

const async = require("async");

module.exports = (app) => {
  app.post("/payment", (req, res, next) => {
    let stripeToken = req.body.stripeToken;
    let courseId = req.body.courseId;
    async.waterfall([
      function (callback) {
        Course.findOne({ _id: courseId }, (err, foundCourse) => {
          if (foundCourse) {
            callback(err, foundCourse);
          }
        });
      },
      function (foundCourse, callback) {
        stripe.customers
          .create({
            source: stripeToken,
            email: req.user.email,
          })
          .then((customer) => {
            return stripe.charges
              .create({
                amount: foundCourse.price,
                currency: "usd",
                customer: customer.id,
              })
              .then((charge) => {
                async.parallel(
                  [
                    function (callback) {
                      Course.update(
                        {
                          _id: courseId,
                          "ownsByStudent.user": { $ne: req.user._id },
                        },
                        {
                          $push: {
                            ownsByStudent: { user: req.user._id },
                            function(err, count) {
                              if (err) return next(err);
                              callback(err);
                            },
                          },
                          $inc: { totalStudents: 1 },
                        }
                      );
                    },
                    function (callback) {
                      User.update(
                        {
                          _id: req.user._id,
                          "coursesTaken.course": { $ne: courseId },
                        },
                        {
                          $push: { coursesTaken: { course: courseId } },
                        },
                        function (err, count) {
                          if (err) next(err);
                          callback(err);
                        }
                      );
                    },
                  ],
                  function (err, results) {
                    if (err) next(err);
                    res.redirect("/courses/" + courseId);
                  }
                );
              });
          });
      },
    ]);
  });
};
