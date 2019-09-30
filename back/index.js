const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// const expressJwt = require('express-jwt');
// const jwt = require('jsonwebtoken');

let mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/calendar', {useNewUrlParser: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection.error:'));

let eventSchema = new mongoose.Schema({
	title: String,
	start: Number,
	duration: Number
});

const Event = mongoose.model('Event', eventSchema);


// const config = {
// 	secret = `;lkjhgfds`;
// }

// function jwtWare(){
// 	const {secret} = config;
// 	return expressJwt({secret}).unless({
// 		path: [
// 			'/users/authenticate',
// 			'/calendar'
// 		]
// 	})
// }

app.use(bodyParser.json());

// app.post('/users/authenticate', async (req, res) => {
//     // const user = users.find(u => u.username === username && u.password === password);
//     // if (user) {
//         const token = jwt.sign(/*{ sub: user.id }, */config.secret);
//     // }
// 	res.status(201).end(JSON.stringify(token));
// })

app.post('/calendar', async (req, res) => {
	let events = req.body.map(async e => {
		let event = new Event(e);
		await event.save();
	});
	res.status(201).end(JSON.stringify(events));
})

app.listen(4000, function(){
	console.log("app listening on port 4000");
})