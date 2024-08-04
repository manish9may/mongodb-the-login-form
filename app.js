const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const session = require("express-session");
const MongodbStore = require("connect-mongodb-session")(session);

const csurf = require("csurf");

const flash = require("connect-flash");

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

const csurfProtection = csurf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const connect = require("mongodb");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mongoose_node";

const store = new MongodbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: "a1b2c3d4f5g6",
    resave: false,
    saveUninitialized: false,
    key: "learning_node",
    store,
  })
);

app.use(csurfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (req.session.user) {
    User.findById(req.session.user._id)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => console.log(err));
  } else {
    next();
  }
});

app.use((req, res, next) => {
  res.locals = {
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken(),
  };
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
