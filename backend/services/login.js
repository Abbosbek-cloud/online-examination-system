let UserModel = require("../models/user");
var passport = require("../services/passportconf");
var jwt = require("jsonwebtoken");
var config = require("config");

let userlogin = (req, res, next) => {
  req.check("emailid", ` Invalid email address`).isEmail().notEmpty();
  req.check("password", "Invalid password").isLength({ min: 5, max: 6 });
  var errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      success: false,
      message: "Invalid inputs",
      errors: errors,
    });
  } else {
    passport.authenticate("login", { session: false }, (err, user, info) => {
      if (err || !user) {
        res.status(200).send(info);
      } else {
        console.log(req);
        req.login({ _id: user._id }, { session: false }, (err) => {
          if (err) {
            res.status(400).send({
              success: false,
              message: "Server Error",
            });
          }

          var token = jwt.sign({ _id: user._id }, config.get("jwt.secret"), {
            expiresIn: 5000000,
          });
          res.status(200).send({
            success: true,
            message: "login successful",
            user: {
              name: user.name,
              type: user.type,
              _id: user._id,
              emailid: user.emailid,
              contact: user.contact,
            },
            token: token,
          });
        });
      }
    })(req, res, next);
  }
};

module.exports = { userlogin };
