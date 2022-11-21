const Course = require("../models/course");
const User = require("../models/user");

const async = require("async");

module.exports = (app) => {
  app.get("/", (req, res, next) => {
    res.render("main/home");
  });

  app.get("/courses", () => {
    Course.findOne({}, (err, courses) => {
      res.render("courses/courses", { courses: courses });
    });
  });

  app.get("/courses/:id", (req, res, next) => {
    async.parallel(
      [
        function (callback) {
          Course.findOne({ _id: req.params.id })
            .populate("ownsByStudent.user")
            .exec(function (err, foundCourse) {
              callback(err, foundCourse);
            });
        },
        (callback) => {
          User.findOne({
            _id: req.user._id,
            "coursesTaken.course": req.params.id,
          })
            .populate("coursesTaken.course")
            .exec((err, foundUserCourse) => {
              callback(err, foundUserCourse);
            });
        },
        (callback) => {
          User.findOne({
            _id: req.user._id,
            "coursesTeach.course": req.params.id,
          })
            .populate("coursesTeach.course")
            .exec((err, foundUserCourse) => {
              callback(err, foundUserCourse);
            });
        },
      ],
      (err, results) => {
        var course = result[0];
        var userCourse = result[1];
        var teacherCourse = result[2];
        if (userCourse === null && teacherCourse === null) {
          res.render("courses/courseDesc", { course });
        } else if (userCourse === null && teacherCourse != null) {
          res.render("courses/course", { course });
        } else {
          res.render("courses/course", { course });
        }
      }
    );
  });
};
