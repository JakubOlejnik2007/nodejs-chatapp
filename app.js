const express = require("express");
const session = require("express-session");
const mysql = require("mysql");
const path = require("path");
const config = require("./config");
const bcrypt = require("bcrypt");
const app = express();
const hbs = require("express-handlebars");
const { isSet } = require("util/types");
const GoogleRecaptcha = require("google-recaptcha");

let log_er = "none";
let remembered_login = "";

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "hbs");

app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials",
  })
);

app.use(express.static("static"));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

app.get("/chat/login", function (req, response) {
  console.log(log_er);
  //for (i = 0; i < 10; i++){
  //    bcrypt.compare("QWERTY", bcrypt.hash("QWERTY", 10), (error, response) => {
  //        console.log(i, true);
  //    });
  // }
  response.render("login", {
    title: "Zaloguj się",
    error: log_er,
    login: remembered_login,
  });

  log_er = "none";
  remembered_login = "";
});
app.get("/chat/signup", (req, res) => {
  res.render("signup", {
    title: "Zaloguj się",
    error: log_er,
    login: remembered_login,
  });

  log_er = "none";
  remembered_login = "";
});

app.post("/chat/login/process", (req, res) => {
  const googleRecaptcha = new GoogleRecaptcha({
    secret: config.private,
  });

  // Some pseudo server code:

  const recaptchaResponse = req.body["g-recaptcha-response"];

  googleRecaptcha.verify({ response: recaptchaResponse }, (error) => {
    if (error) {
      return console.log({ isHuman: false });
    }

    return console.log({ isHuman: true });
  });
  if (req.body.operation == "login") {
    if (
      isSet(req.body.username) &&
      isSet(req.body.password) &&
      !isSet(req.body.cpassword) &&
      !isSet(req.body.email) &&
      !isSet(req.body.captcha) &&
      !isSet(req.body.rules)
    ) {
      log_er = "block";
      remembered_login = req.body.username;
      req.redirect("/chat/login");
      return 1;
    }
  }

  let username = req.body.username;
  let password = req.body.password;

  //	console.log(username, password);
  if (!username || !password) {
    log_er = "block";
    remembered_login = username;
    res.redirect("/chat/login");
    return 1;
  } else {
    log_er = "none";
  }

  if (1 == 1) {
    req.session.isLogged = true;
  }
  console.log(req.session.isLogged);
  return 0;
  const connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.name,
  });
  if (username && password) {
    connection.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          response.redirect("/home");
        } else {
          response.send("Incorrect Username and/or Password!");
        }
        response.end();
      }
    );
  } else {
    response.send("Please enter Username and Password!");
    response.end();
  }
  connection.end();
});
app.get("/home", function (req, res) {
  if (req.session.loggedin) {
    res.send("Welcome back, " + req.session.username + "!");
  } else {
    res.send("Please login to view this page!");
  }
  res.end();
});

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
