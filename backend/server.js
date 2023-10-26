'use strict';

const
	express = require('express'),
	cors = require('cors');

const app = express();

// app.use(express.static('../build'));
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
	setTimeout(next, Math.random() * 2000);
});


// register error handling middleware
app.use(function (err, req, res, next) {
	if (err.status === undefined) {
		return res.status(500).send(err.message);
	} else {
		return res.status(err.status).send(err.message);
	}
});

// declare routes
app.get("/testBackend", (req, res, next) => {
	res.json("bakend stinks")
})

// launch server
const server = app.listen(4200, function () {
	const host = server.address().address;
	const port = server.address().port;
	console.log('App listening at http://%s:%s', host, port);
});
