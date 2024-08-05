const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

const { check, body } = require("express-validator");

const User = require("../models/user");

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", authController.postLogin);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter Valid Email")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email exists already.");
          }
        });
        // if (value === "test@test.com") {
        //   throw new Error("This email is forbidden");
        // }
        // return true;
      }),
    body("password", "Please Enter valid Password").isLength({ min: 5 }).trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password has to match!");
      }
      return true;
    }),
  ],

  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
