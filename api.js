// https://www.sitepoint.com/understanding-module-exports-exports-node-js/
// http://www.tutorialsteacher.com/nodejs/nodejs-local-modules
// https://www.youtube.com/watch?v=dgdcXGxh93s

let request = require("request");
let allWorkers = [];
let currentWorkers = [];


function makeAllWorkers(){
    return new Promise(function(resolve, reject){
        URL = "https://data.gov.au/api/3/action/datastore_search?resource_id=63fd8050-0bab-4c04-b837-b2ce664077bf&limit=5000"
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


function getWorkers(){
    return new Promise(async function(resolve, reject){
        if(allWorkers.length === 0){
            allWorkers = await makeAllWorkers();
        }
        resolve(allWorkers);
    });
}



function makeCurrentWorkers(){
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


function getCurrent(){
    return new Promise(async function(resolve, reject){
        if(allWorkers.length > 0){
            allWorkers = await makeCurrentWorkers();
        }
        resolve(allWorkers);
    });
}


function printTheseWorkers(workers){
    for(let i = 0; i < workers.length; i++){
        console.log(workers[i].name);
        console.log(workers[i].type);
        console.log(workers[i].employed);
    }

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
}


function findAllWorkerIndex(all, workers, index){
    for(let i = 0; i < workers.length; i++){
        if(workers[index].comment === all[i].comment){
            return i;
        }
    }
    return 0;
}

function findType(workers, type, type2){
    let index = 0;

    for(index; index < workers.length; index++){
        if(workers[index].type === type || workers[index].type === type2){
            return  index;
        }
    }
    return 0;
}


let makeExport = {
    getCurrentWorkers: async function() {
        return await getCurrent();
    },
    getAllWorkers: async function(){
        return await getWorkers();
    },
    fireWorker: function(all, workers, index){
        let allIndex = findAllWorkerIndex(all, workers, index);
        all[allIndex].employed = false;
        workers.splice(index, 1);
    },
    injureWorker: function(all, workers){
        let index = findType(workers, "Injured", "Injured");
        let allIndex = findAllWorkerIndex(all, workers, index);
        all[allIndex].injured = true;
        workers[index].injured = true;
        return workers[index];
    },
    killWorker: function(all, workers){
        let index  = findType(workers, "Killed", "Fatal");
        let allIndex = findAllWorkerIndex(all, workers, index);
        all[allIndex].alive = false;
        workers[index].alive = false;
        return workers[index];
    },
    printWorkers: function(workers){
        printTheseWorkers(workers);
    }

};

module.exports = makeExport;