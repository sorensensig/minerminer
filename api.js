// https://www.sitepoint.com/understanding-module-exports-exports-node-js/
// http://www.tutorialsteacher.com/nodejs/nodejs-local-modules
// https://www.youtube.com/watch?v=dgdcXGxh93s

let request = require("request");
let allWorkers = [];
let currentWorkers = [];


function makeAllWorkers(){
    return new Promise(function(resolve, reject){
        URL = "https://data.gov.au/api/3/action/datastore_search?resource_id=63fd8050-0bab-4c04-b837-b2ce664077bf&limit=8903"
        request(URL, function(error, response, body){
            let parsed = JSON.parse(body);

            let amountOfPeople = 100;
            let injured = 50;
            let fatal = 50;
            let counter = 0;

            while(amountOfPeople > 0){
                let goodType = true;
                let comment = "";
                let name = parsed["result"]["records"][counter]["Name"];
                let year = parsed["result"]["records"][counter]["Year"];
                let type = parsed["result"]["records"][counter]["Remarks"];

                try {
                    type = type.split('.  ');
                    comment = "" + type[1];
                    type = "" + type[0];
                    goodType = type === "Injured" || type === "Killed" || type === "Fatal";
                    year = year.slice(0, 4);
                }catch(err){
                    goodType = false;
                }

                if (goodType && name.length > 0 && year.length > 0 && comment.length > 0){
                    if(type === "Injured" && injured > 0){
                        amountOfPeople --;
                        injured --;
                        allWorkers.push({name: name, year: year, type: type, comment: comment, employed: false, injured: false, alive: true});
                    }else if((type === "Killed" || type === "Fatal") && fatal > 0){
                        amountOfPeople --;
                        fatal --;
                        allWorkers.push({name: name, year: year, type: type, comment: comment, employed: false, injured: false, alive: true});
                    }

                }

                counter ++;
            }
            resolve(allWorkers);
        });

    });
}

function makeAvailableWorkers(){
    let amountOfHires = 10;
    let fatal = 5;
    let injured = 5;
    let counter = 0;

    return new Promise(function(resolve, reject){
        while (amountOfHires > 0 && counter < allWorkers.length){
            if (fatal > 0 && (allWorkers[counter].type === "Killed" || allWorkers[counter].type === "Fatal")){
                fatal --;
                allWorkers[counter].employed = true;
                currentWorkers.push(allWorkers[counter]);
            }
            else if (injured >= 0 && allWorkers[counter].type) {
                injured --;
                currentWorkers.push(allWorkers[counter]);
                allWorkers[counter].employed = true;
            }

            counter ++;
        }
        resolve(currentWorkers);
    });
}



let makeExport = {
    createAllWorkers:async function(){
        return await makeAllWorkers();

    },
    createAvailableWorkers:async function() {
        return await makeAvailableWorkers();
    },
    getCurrentWorkers: function() {
        return currentWorkers;
    },
    getAllWorkers: function(){
        return allWorkers;
    },
    updateCurrentWorkers: function(newAvailableWorkers){
        currentWorkers = newAvailableWorkers;
    }
};

module.exports = makeExport;