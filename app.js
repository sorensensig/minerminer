const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');

const user = require('./user');
const api = require('./api');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({secret: 'secret-token'}));

let users = [];



app.get('/', async function(req, res){
        if(!req.session.userId) {
        users.push(new user());
        req.session.userId = users.length-1;
        req.session.toMonthlySummary = [];
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

    if(users[req.session.userId].getCurrentCycleTime() >= users[req.session.userId].getTotalCycleTime()){
        res.redirect('/monthly-rapport');
    }else{
        res.render('game');
    }
    // Start timer in user for time limit for cycle
    users[req.session.userId].startCycleTimer();
    // Start timer in user for WHS Policy spawn
});

app.get('/employee-folder', async function(req, res){
    if(users[req.session.userId].getCurrentCycleTime() >= users[req.session.userId].getTotalCycleTime()){
        res.redirect('/monthly-rapport');
    }else {
        res.render('employeeFolder', {workers: users[req.session.userId].getCurrentWorkers()});
    }
});

app.get('/whs-policies', async function(req, res){
    if(users[req.session.userId].getCurrentCycleTime() >= users[req.session.userId].getTotalCycleTime()){
        res.redirect('/monthly-rapport');
    } else {

        let check = await users[req.session.userId].getActivePolicies();
        if (check > 0) {
            let check2 = await users[req.session.userId].getPolicyDisplayed();
            if (check2) {
                let data = req.session.currentPolicy;
                res.render('whsPolicies', {data: data.policyText});
            } else {
                let data = await users[req.session.userId].getRandPolicy();
                req.session.currentPolicy = data;
                res.render('whsPolicies', {data: data.policyText});
                await users[req.session.userId].setPolicyDisplayed(true);
            }

        } else {
            res.render('whsPolicies', {data: 'There are currently no new policies.'});
        }
    }
});

app.get('/whs-policies/:option', function(req, res) {

    let option = req.params.option;

    let outputArray = [];

    if (option === 'Deny') {
        outputArray.push({
            policyTitle : req.session.currentPolicy.policyTitle,
            policyText : req.session.currentPolicy.policyText,
            policyOption : req.session.currentPolicy.policyDenyOption,
            policyOptionFunction : req.session.currentPolicy.policyDenyOptionFunction,
            policyChoice: "Denied"
        });
    } else {
        outputArray.push({
            policyTitle : req.session.currentPolicy.policyTitle,
            policyText : req.session.currentPolicy.policyText,
            policyOption : req.session.currentPolicy.policyApproveOption,
            policyOptionFunction : req.session.currentPolicy.policyApproveOptionFunction,
            policyChoice: "Approved"
        });
    }

    req.session.toMonthlySummary.push(outputArray[0]);
    users[req.session.userId].setPolicyDisplayed(false);
    users[req.session.userId].deleteFromAvailablePolicies();
    req.session.currentPolicy = undefined;

    res.redirect('/game'); // send info on whether option was approved or not to display to user on game.
});

app.get('/monthly-rapport', function(req, res){
    for(let i = 0; i < req.session.toMonthlySummary.length; i++){
        switch (req.session.toMonthlySummary[i].policyOptionFunction){
            case "Kill":
                api.killWorker(users[req.session.userId].getAllWorkers(), users[req.session.userId].getCurrentWorkers());
                console.log("Kill");
                break;
            case "Injure:":
                api.injureWorker(users[req.session.userId].getAllWorkers(), users[req.session.userId].getCurrentWorkers());
                console.log("Injure");
                break;
            case "Nothing":
                console.log("Nothing");
                break;
            default:
                console.log("Nothing");
                break;
        }
    }

    let affectedEmployees = api.getCurrentInjuredAndKilled(users[req.session.userId].getCurrentWorkers());

    res.render('monthlyRapport', {toMonthlyReport: req.session.toMonthlySummary, affectedEmployees: affectedEmployees});
});

app.get('player-reset', function(req, res) {
    users[req.session.userId] = undefined;
    req.session.currentPolicy = undefined;
    req.session.toMonthlySummary = undefined;
    req.session.userId = undefined;
    res.redirect('/');
});

app.listen(3000, () => console.log('Server listens to port 3000'));