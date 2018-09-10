const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('home'));

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