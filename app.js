const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const path = require('path');
const config = require('./config');
const bcrypt = require('bcrypt')
const app = express();
const hbs = require('express-handlebars');

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials'
}))

app.use(express.static('static'));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function(request, response) {
    //for (i = 0; i < 10; i++){
    //    bcrypt.compare("QWERTY", bcrypt.hash("QWERTY", 10), function(error, response) {
    //        console.log(i, true);
    //    });
   // }
	response.render('home', {
		title:"Strona główna"
	});
    //response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/style.css', (request, response) => {
	response.sendFile(path.join(__dirname + '/style.css'));
	console.log(`Załadowano: ${css} \n`);
});

app.post('/auth', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	
		
	const connection = mysql.createConnection({
		host     : config.mysql.host,
		user     : config.mysql.user,
		password : config.mysql.password,
		database : config.mysql.name
	});
	if (username && password) {
		connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
	connection.end();
})
app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.listen(config.port, () => {
	console.log(`Server is running on http://localhost:${config.port}`)
});