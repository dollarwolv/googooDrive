const { Router } = require("express");
const loginRouter = Router();
const passport = require("../config/passport");

loginRouter.get("/", (req, res) => {
  res.render("login", { title: "Log In" });
});

loginRouter.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
    failureMessage: true,
  })
);

module.exports = loginRouter;
