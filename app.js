const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');

const api = require('./api');
const user = require('./user');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({secret: 'secret-token'}));

let allWorkers = [];
let currentWorkers = [];
let users = [];



app.get('/', async function(req, res){
    allWorkers = await api.getAllWorkers();
    currentWorkers = await api.getCurrentWorkers();

    if(!req.session.userId) {
        users.push(new user());
        req.session.userId = users.length-1;
        res.render('home');
    } else {
        res.render('home');
    }
});

app.get('/tutorial', (req, res) => res.render('tutorial'));

app.get('/game', function(req, res){
    // Insert user progress to game for each time, as the user gets redirected to game many times.
    res.render('game');
});

app.get('/employee-folder', function(req, res){
    currentWorkers = api.getCurrentWorkers();

   res.render('employeeFolder', {workers: currentWorkers});
});

app.get('/whs-policies', async function(req, res){
    // if (users[req.session.userId].activePolicies > 0) {
        let data = await users[req.session.userId].getRandPolicy();
        req.session.currentPolicy = data;
        console.log(req.session.currentPolicy);
        res.render('whsPolicies', {data: data.policyText});
    //} else {
        // render empty whs policy page with back button.
        // res.render('whsPolicies');

    //}
});

app.post('/whs-policies/option', function(req, res) {

    let option;
    if (req.body.approveOption) {
        option = req.body.approveOption;
    } else {
        option = req.body.denyOption;
    }

    let outputArray = [];

    if (option === 'Deny') {
        outputArray.push({
            policyTitle : req.session.currentPolicy.policyTitle,
            policyText : req.session.currentPolicy.policyText,
            policyDenyOption : req.session.currentPolicy.policyDenyOption,
            policyDenyOptionFunction : req.session.currentPolicy.policyDenyOptionFunction
        });
    } else {
        outputArray.push({
            policyTitle : req.session.currentPolicy.policyTitle,
            policyText : req.session.currentPolicy.policyText,
            policyApproveOption : req.session.currentPolicy.policyApproveOption,
            policyApproveOptionFunction : req.session.currentPolicy.policyApproveOptionFunction
        });
    }

    req.session.toMonthlySummary = outputArray;
    req.session.currentPolicy = undefined;

    res.redirect('/game'); // send info on whether option was approved or not to display to user on game.
});

app.get('/monthly-rapport', function(req, res){
   res.render('monthlyRapport');
});

app.post('player-reset', function(req, res) {
    // delete player object.
    // NB we need to create a player object file first.
    res.redirect('/');
});

// This here code is just a sample code to be used as reference when coding similar functions.
// This code should not be a part of the final delivery.
let friends = ['Al', 'Aslam', 'Thomas', 'Sigurd'];

app.get('/friends', function(req, res){
    res.render('friends', {friends: friends});
});

app.post('/addfriend', function(req, res){
    friends.push(req.body.newfriend);
    res.redirect('/friends');
});

app.get('/:number', function(req, res){
    let number = req.params.number;
    res.render('something', {variable: number});
});
// End sample code.


app.listen(3000, () => console.log('Server listens to port 3000'));