/*
The code snippet (3. Express) below has been sourced from:
https://www.npmjs.com/package/express
The code snippet appears in its original form.
*/
const express = require('express');
const app = express();
/*
End code snippet (3. express)
*/
/*
The code snippet (4. Body Parser) below has been sourced from:
https://www.npmjs.com/package/body-parser
The code snippet appears in its original form.
*/
const bodyParser = require('body-parser');
/*
End code snippet (4. Body Parser)
*/
/*
The code snippet (5. Express Session) below has been sourced from:
https://www.npmjs.com/package/express-session
The code snippet appears in its original form.
*/
const session = require('express-session');
/*
End code snippet (5. Express Session)
*/

const user = require('./user');
const api = require('./api');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({secret: 'secret-token'}));

let users = [];

app.get('/', async function(req, res){
    /* Landing page where unique session ID is created
    A list of people from API is retrieved and a list of current employees are created
    */
    if(!req.session.userId) {
        users.push(new user());
        req.session.userId = users.length-1;
        users[req.session.userId].setCurrentCycleTime();
        req.session.toMonthlySummary = [];
        res.render('home');
    } else {
        res.render('home');
    }

    console.log("Getting Workers");
    await users[req.session.userId].setAllWorkers();
    console.log("Setting Current Workers");
    await users[req.session.userId].setCurrentWorkers();
    console.log("All Done");
    users[req.session.userId].setCurrentEmployeeProduction();

});

app.get('/tutorial', (req, res) => res.render('tutorial'));
/* Renders tutorial page
*/

app.get('/game', async function(req, res){
    /* Starts the game and renders game page
    When this page loads and global timer has run out, the player is redirected to monthly report.
    */

    if(users[req.session.userId].getCurrentCycleTime() >= users[req.session.userId].getTotalCycleTime()){
            res.redirect('/monthly-report');
    }else{
        let timer = users[req.session.userId].getCurrentCycleTime();
        res.render('game', {timer: timer, income: await users[req.session.userId].getVariableIncome(), equity: await users[req.session.userId].getEquity(), policyNumber: await users[req.session.userId].getActivePolicies(), affectedEmployee: users[req.session.userId].getAffectedEmployee()});

    }
    /* Start timer in user for time limit for cycle
    This timers also controls when WHS policies are available
    */
    users[req.session.userId].setAffectedEmployee(null);
    users[req.session.userId].startCycleTimer();
});

app.get('/employee-folder', async function(req, res){
    /* Renders employee folder based on the list of current employees of the player
    When this page loads and the global timer has run out, the player is redirected to monthly report.
    */

    if(users[req.session.userId].getCurrentCycleTime() >= users[req.session.userId].getTotalCycleTime()){
        res.redirect('/monthly-report');
    }else {
        let timer = users[req.session.userId].getCurrentCycleTime();
        let possibleHires = await api.getPossibleHires(users[req.session.userId].getAllWorkers());
        users[req.session.userId].setPossibleHires(possibleHires);
        res.render('employeeFolder', {workers: users[req.session.userId].getCurrentWorkers(),
            income: await users[req.session.userId].getVariableIncome(),
            equity: await users[req.session.userId].getEquity(),
            workersInjured: users[req.session.userId].getCurrentInjuredWorkers(),
            workersKilled: users[req.session.userId].getCurrentKilledWorkers(),
            possibleHires: possibleHires,
            timer: timer});
    }
});

app.get('/whs-policies', async function(req, res){
    /* Renders WHS policy page with a random policy. If there is a policy already chosen it instead renders that one again.
    When this page loads and the global timer has run out, the player is redirected to monthly report.
    */
    if(users[req.session.userId].getCurrentCycleTime() >= users[req.session.userId].getTotalCycleTime()){
        res.redirect('/monthly-report');
    } else {

        let check = await users[req.session.userId].getActivePolicies();
        /* checks if there are any policies for the player
        */
        if (check > 0) {
            let check2 = await users[req.session.userId].getPolicyDisplayed();
            /* Checks if there already has been created a random policy for the player
            */
            if (check2) {
                let data = req.session.currentPolicy;
                let timer = users[req.session.userId].getCurrentCycleTime();
                res.render('whsPolicies', {data: data, status: true, timer: timer, income: await users[req.session.userId].getVariableIncome(), equity: await users[req.session.userId].getEquity()});
             /* if there is no policy it creates one
             */
            } else {
                let canBeKilled = false,
                    canBeInjured = false,
                    currentWorkers = users[req.session.userId].getCurrentWorkers();

                for(let worker of currentWorkers) {
                    if(worker.type === 'Injured') {
                        canBeInjured = true;
                    } else if(worker.type === 'Killed' || worker.type === 'Fatal') {
                        canBeKilled = true;
                    }
                }

                let data = await users[req.session.userId].getRandPolicy(canBeKilled, canBeInjured);
                let timer = users[req.session.userId].getCurrentCycleTime();
                req.session.currentPolicy = data;
                res.render('whsPolicies', {data: data, status: true, timer: timer, income: await users[req.session.userId].getVariableIncome(), equity: await users[req.session.userId].getEquity()});
                await users[req.session.userId].setPolicyDisplayed(true);
            }
        /* if there are no policies available it renders the following
        */
        } else {
            let timer = users[req.session.userId].getCurrentCycleTime();
            res.render('whsPolicies', {data: 'There are currently no new policies.', status: false, timer: timer, income: await users[req.session.userId].getVariableIncome(), equity: await users[req.session.userId].getEquity()});
        }
    }
});

app.get('/whs-policies/:option', async function(req, res) {
    /* this function takes the players choice from the policy page, stores it and then redirects the player to game screen
    */

    let option = req.params.option;

    let outputArray = [];

    let affectedEmployee;

    if (option === 'Deny') {
        let shortTerm = req.session.currentPolicy.shortTermDenyEffect,
            longTerm = req.session.currentPolicy.longTermDenyEffect;

        users[req.session.userId].setWHSEffects(shortTerm, longTerm);

        outputArray.push({
            policyTitle : req.session.currentPolicy.policyTitle,
            policyText : req.session.currentPolicy.policyText,
            policyOption : req.session.currentPolicy.policyDenyOption,
            policyOptionFunction : req.session.currentPolicy.policyDenyOptionFunction,
            policyChoice: "Denied",
            policyShortTermEffect: shortTerm,
            policyLongTermEffect: longTerm
        });
    } else {
        let shortTerm = req.session.currentPolicy.shortTermApproveEffect,
            longTerm = req.session.currentPolicy.longTermApproveEffect;

        users[req.session.userId].setWHSEffects(shortTerm, longTerm);

        outputArray.push({
            policyTitle : req.session.currentPolicy.policyTitle,
            policyText : req.session.currentPolicy.policyText,
            policyOption : req.session.currentPolicy.policyApproveOption,
            policyOptionFunction : req.session.currentPolicy.policyApproveOptionFunction,
            policyChoice: "Approved",
            policyShortTermEffect: shortTerm,
            policyLongTermEffect: longTerm
        });
    }
    console.log('Worker is: ' + outputArray[0].policyOptionFunction);

    switch (outputArray[0].policyOptionFunction){
        case "Kill":
            users[req.session.userId].setAffectedEmployee(await api.killWorker(users[req.session.userId].getAllWorkers(), users[req.session.userId].getCurrentWorkers(), users[req.session.userId].getCurrentKilledWorkers()));
            users[req.session.userId].workerProductionReduction(2);
            console.log("Kill");
            break;
        case "Injure":
            users[req.session.userId].setAffectedEmployee(await api.injureWorker(users[req.session.userId].getAllWorkers(), users[req.session.userId].getCurrentWorkers(), users[req.session.userId].getCurrentInjuredWorkers()));
            users[req.session.userId].workerProductionReduction(1);
            console.log("Injure");
            break;
        case "Nothing":
            users[req.session.userId].setAffectedEmployee(null);
            console.log("Nothing");
            break;
        default:
            users[req.session.userId].setAffectedEmployee(null);
            console.log("Default");
            break;
    }

    req.session.toMonthlySummary.push(outputArray[0]);

    users[req.session.userId].setPolicyDisplayed(false);
    users[req.session.userId].deleteFromAvailablePolicies();
    req.session.currentPolicy = undefined;

    res.redirect('/game');
});

app.get('/monthly-report', async function(req, res){
    /* Iterates though all decisions made by player, starts appropriate functions
    then is sends all decisions and the affected employees to result page
    */
    let equity = await users[req.session.userId].getAndUpdateEquity();

    let affectedEmployees = [];
    if(users[req.session.userId].getCurrentInjuredWorkers().length > 0){
        for(let worker of users[req.session.userId].getCurrentInjuredWorkers()){
            affectedEmployees.push(worker);
        }

    }
    if(users[req.session.userId].getCurrentKilledWorkers().length > 0){
        for(let worker of users[req.session.userId].getCurrentKilledWorkers()){
            affectedEmployees.push(worker);
        }
    }

    console.log(affectedEmployees);

    res.render('monthlyReport', {toMonthlyReport: req.session.toMonthlySummary, affectedEmployees: affectedEmployees, income: await users[req.session.userId].getVariableIncome(), equity: equity, staticIncome: await users[req.session.userId].getStaticIncome()});
});

app.get('/player-reset', function(req, res) {
    /* Resets the game for the player.
    */
    users[req.session.userId].setAvailablePolicies();
    users[req.session.userId].setActivePolicies();
    users[req.session.userId] = undefined;
    req.session.currentPolicy = undefined;
    req.session.toMonthlySummary = [];
    req.session.userId = undefined;
    res.redirect('/');
});

app.get('/continue', function(req, res) {
    /* Resets the game for the player.
    */
    users[req.session.userId].setActivePolicies();
    users[req.session.userId].setCurrentCycleTime();
    users[req.session.userId].setCurrentEmployeeProduction();
    users[req.session.userId].setAffectedEmployee(null);
    req.session.toMonthlySummary = [];
    req.session.currentPolicy = undefined;
    users[req.session.userId].setPolicyDisplayed(false);
    res.redirect('/game');
});

app.get('/fireWorker/:index', async function(req, res) {
    /* Resets the game for the player.
    */
    let fired = await api.fireWorker(users[req.session.userId].getAllWorkers(),
        users[req.session.userId].getCurrentWorkers(),
        req.params.index);

    users[req.session.userId].workerProductionReduction(fired.production);

    res.redirect('/employee-folder');
});

app.get('/hireWorker/:index', async function(req, res) {
    /* Resets the game for the player.
    */
    if (await users[req.session.userId].getEquity() >= 6){
        console.log("Hire");
        api.hireWorker(users[req.session.userId].getAllWorkers(),
            users[req.session.userId].getCurrentWorkers(),
            users[req.session.userId].getPossibleHires(),
            req.params.index);

        users[req.session.userId].applyHireCost(6, 2);
    }else{
        console.log("No moneyz");
    }

    res.redirect('/employee-folder');
});

app.listen(process.env.PORT ||3000, () => console.log('Server listens to port 3000'));