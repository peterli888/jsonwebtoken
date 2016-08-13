/**
 * @file Token authentication.
 * @see https://github.com/auth0/node-jsonwebtoken
 * @author EHGO Analytics LLC
 */

'use strict';

var express = require('express'),
    app = express(),
    secure = express.Router(),
    open = express.Router(),
    bodyParser = require('body-parser'),
    jwt = require('jsonwebtoken'),
    config = require('./config'),
    users = require('./db'),
    port = process.env.PORT || 8080;

// Set value to sign Web tokens.
app.set(config.secretKey, config.secretValue);

// Configure body-parser.
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Use this to force HTTPS on Heroku.
app.use(function (req, res, next) {
    next();
    // req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? next(): res.redirect('https://' + req.headers.host + req.url);
});

// POST /authenticate
open.post('/authenticate', function (req, res) {
    var name = req.body.name,
        password = req.body.password,
        user, token;

    // Fake database query.
    users.some(function (obj, i, array) {
        if (obj.name === name) {
            user = obj;
            return true;
        }
        return false;
    });
    
    if (!user) {
        res.json({success: false,
                  message: 'Bad user name.' });
    } else {
        if (user.password !== password) {
            res.json({success: false,
                      message: 'Authentication failed.' });
        } else {
            token = jwt.sign(user, app.get(config.secretKey), {
                // Expires in seconds.
                expiresIn: 60
            });
            res.set('x-access-token', token);
            res.send('Welcome!');
        }

    }
});

// Configure open routes.
open.get('/open', function (req, res) {
    res.json({message: 'Open access information.'});
});

// Configure public routes.
open.use(express.static(__dirname + '/public/'));

// Verify authentication from GET and POST
secure.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    console.log(req.headers);

    if (token) {
        jwt.verify(token, app.get(config.secretKey), function (err, decoded) {
            if (err) {
                return res.status(403).json({success: false,
                                             message: 'Go to login page.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({ success: false,
                                      message: 'No token. Go to login page.'
                                    });
    }

});

// GET /users
secure.get('/users', function (req, res) {
    res.json(users);
});

// Use secure routes with /secure
app.use('/secure', secure);           

// Otherwise, use /
app.use(open);

// Use this for everything we cannot handle.
app.use(function (req, res, next) {
    var err = new Error('Not Found: ' + req.path);
    err.status = 404;
    next(err);
});

// Production error handler.
app.use(function (err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.send({ status: err.status,
               message: err.message,
               error: {}
             });
});

// Start the server.
app.listen(port);
console.log('Listening at http://localhost:' + port);
