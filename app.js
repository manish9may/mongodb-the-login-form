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

const multer = require("multer");

const app = express();

const csurfProtection = csurf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const connect = require("mongodb");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

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

app.use((err, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Page Not Found",
    path: "/404",
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
