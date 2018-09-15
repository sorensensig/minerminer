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

let allWorkers = [];
let currentWorkers = [];
let done;
let users = [];



app.get('/', async function(req, res){
    allWorkers = await api.createAllWorkers();
    currentWorkers = await api.createAvailableWorkers();
    currentWorkers = api.getCurrentWorkers();

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