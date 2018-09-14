const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const api = require('./api')
const session = require('express-sessions');

const policies = require('./policies');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');
//app.use(session({secret: 'secret-token'}));

let allWorkers = [];
let currentWorkers = [];
let done;
let users = [];



app.get('/', async function(req, res){
    allWorkers = await api.createAllWorkers();
    currentWorkers = await api.createAvailableWorkers();
    currentWorkers = api.getCurrentWorkers();

    //let sessionData = req.session;
    //users.push(new User());
    //sessionData.userId = user.length()-1;
    res.render('home');
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
    let data = await policies.getRandomPolicy();
    res.render('whsPolicies', {data: data});
});

app.get('/whs-policies/:option', function(req, res) {
    let option = req.params.option;
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