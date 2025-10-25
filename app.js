const path = require("node:path");
const express = require("express");
const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const bcrypt = require("bcryptjs");
const db = require("./db/queries");
const passport = require("./config/passport");
const prisma = require("./db/prisma");

// routers
const loginRouter = require("./routes/log-in");
const signupRouter = require("./routes/sign-up");
const logoutRouter = require("./routes/log-out");

const app = express();

// set up ejs
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// set up url decoder and express prisma session store
app.use(express.urlencoded({ extended: false }));
app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "a santa at nasa",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);
app.use(passport.session());

// save user in res.locals.currentuser
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.render("index", {
    title: "Home Page",
    currentUser: res.locals.currentUser,
  });
});

// routes
app.use("/log-in", loginRouter);
app.use("/sign-up", signupRouter);
app.use("/log-out", logoutRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`app listening on port ${PORT} !`);
});
