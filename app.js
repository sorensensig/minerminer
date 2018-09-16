// The link below shows a tutorial on how to use the async and await functions and how to use Promise that have been used in this code
// "Using Async and Await In Node.Js", made by: Aman Kharbanda, Retrieved from: https://www.youtube.com/watch?v=dgdcXGxh93s

// 1. Express
// This project uses functions from express
// Retrieved from: https://www.npmjs.com/package/express
const express = require('express');
const app = express();

// 2. Body Parser
// This project uses functions from body-parser
// Retrieved from: https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');

// 3. Express Session
// This project uses functions from express-session
// Retrieved from: https://www.npmjs.com/package/express-session
const session = require('express-session');


const user = require('./user');
const api = require('./api');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({secret: 'secret-token'}));

let users = [];


// Landing page where unique session ID is created
// A list of poeple from API is retrieved and a list o f current employees created
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

// Renders tutorial page
app.get('/tutorial', (req, res) => res.render('tutorial'));

// Starts the game and renders game page
app.get('/game', function(req, res){

    // When this page loads and global timer as run out, is redirected to monthly report and the end screen for MVP
    if(users[req.session.userId].getCurrentCycleTime() >= users[req.session.userId].getTotalCycleTime()){
        res.redirect('/monthly-rapport');
    }else{
        res.render('game');
    }
    // Start timer in user for time limit for cycle
    // This timers also controls when WHS policies are available
    users[req.session.userId].startCycleTimer();
});

// Renders employee folder based on the list of current employees of the player
app.get('/employee-folder', async function(req, res){

    // When this page loads and global timer as run out, is redirected to monthly report and the end screen for MVP
    if(users[req.session.userId].getCurrentCycleTime() >= users[req.session.userId].getTotalCycleTime()){
        res.redirect('/monthly-rapport');
    }else {
        res.render('employeeFolder', {workers: users[req.session.userId].getCurrentWorkers()});
    }
});

// Renders WHS policy page with a random policy, if there is a policy already chosen it instead renders that
app.get('/whs-policies', async function(req, res){

    // When this page loads and global timer as run out, is redirected to monthly report and the end screen for MVP
    if(users[req.session.userId].getCurrentCycleTime() >= users[req.session.userId].getTotalCycleTime()){
        res.redirect('/monthly-rapport');
    } else {

        let check = await users[req.session.userId].getActivePolicies();
        // checks if there are any policies for the player
        if (check > 0) {
            let check2 = await users[req.session.userId].getPolicyDisplayed();
            // Checks if there already has been created a random policy for the player
            if (check2) {
                let data = req.session.currentPolicy;
                res.render('whsPolicies', {data: data.policyText});
             // if there is no policy it creates one
            } else {
                let data = await users[req.session.userId].getRandPolicy();
                req.session.currentPolicy = data;
                res.render('whsPolicies', {data: data.policyText});
                await users[req.session.userId].setPolicyDisplayed(true);
            }
        // if there are no policies available it renders the following
        } else {
            res.render('whsPolicies', {data: 'There are currently no new policies.'});
        }
    }
});

// this function takes the players choice from the policy page, stores it and then redirects the player to game screen
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

// Itterates though all decisions made by player, starts appropriate functions
// then is sends all decisions and the affected employees to result page
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