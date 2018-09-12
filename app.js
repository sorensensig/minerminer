const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('home'));

app.get('/tutorial', (req, res) => res.render('tutorial'));

app.get('/game', function(req, res){
   res.render('game');
});

app.get('/employee-folder', function(req, res){
   res.render('employeeFolder');
});

app.get('/whs-policies', function(req, res){
    res.render('whsPolicies');
});

app.get('/monthly-rapport', function(req, res){
   res.render('monthlyRapport');
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