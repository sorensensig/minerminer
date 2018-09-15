const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');

const policies = require('./policies');
const api = require('./api');
const user = require('./user');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({secret: 'secret-token'}));

let users = [];



app.get('/', async function(req, res){
        if(!req.session.userId) {
        users.push(new user());
        req.session.userId = users.length-1;
        res.render('home');
    } else {
        res.render('home');
    }

    await users[req.session.userId].setAllWorkers();
    await users[req.session.userId].setCurrentWorkers();
    console.log("Loaded");
    //move to user
});


app.get('/tutorial', (req, res) => res.render('tutorial'));

app.get('/game', function(req, res){
    res.render('game');
    console.log("Loady mc Loadface");
    // Start timer in user for time limit for cycle
    users[req.session.userId].startCycleTimer();
    // Start timer in user for WHS Policy spawn
});

app.get('/employee-folder', async function(req, res){
   res.render('employeeFolder', {workers: users[req.session.userId].getCurrentWorkers()});
});

app.get('/whs-policies', async function(req, res){
    // swap out with users[index].getRandomPolicy(); or if this doesn't work, something else.
    let data = await users[req.session.userId].getRandPolicy();
    req.session.currentData = data;
    console.log(req.session.currentData);
    res.render('whsPolicies', {data: data.policyText});
});

app.get('/whs-policies/:option', function(req, res) {
    // send to req ->>>
    // whs Title
    // option from front-end
    // whs text
    // whs consequence
    // function for monthly-rapport to run

    // let option = req.params.option;
    /* if (option === 'approveOption') {
            let approve = req.session.currentData.policyApproveOption;
            req.session.
       } else {
            let deny = req.session.currentData.policyDenyOption;
       }
    //
     */
    res.redirect('/game');
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