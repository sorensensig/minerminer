const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/:number', function(req, res){
    let number = req.params.number;
    res.render('home.ejs', {variable: number});
});

app.listen(3000, () => console.log('Server listens to port 3000'));