const request = require('request');

function makeAllWorkers(allWorkers){
    /* Retrieves information from API, considers if it is valid information (defined by us) and makes it available for later use
    */
    return new Promise(function(resolve, reject){
        /*
        The code snippet (5. State Library of Queensland - Queensland Mining accidents 1882-1945) below has been sourced from:
        https://search.data.gov.au/dataset/ds-qld-2e5b65d7-09d5-403f-a5d5-a552410f2d5d/details?q=slq
        The code snippet is an API and appears in its original form except for the limit.
        */
        URL = "https://data.gov.au/api/3/action/datastore_search?resource_id=63fd8050-0bab-4c04-b837-b2ce664077bf&limit=5000";
        /*
        End code snippet (5. State Library of Queensland - Queensland Mining accidents 1882-1945)
        */
        request(URL, function(error, response, body){
            // Takes a string and makes it into JSON
            let parsed = JSON.parse(body);

            /* These variables control the intake of people
            amount of people is the total amount and injured and fatal are the total amount of each type
            counter is just the counter to go through the entire list of people in API
            */
            let amountOfPeople = 100;
            let injured = 50;
            let fatal = 50;
            let counter = 0;

            while(amountOfPeople > 0){
                /* goodtype becomes false if the type of injury is wrong
                */
                let goodType = true;
                let comment = "";
                let name = parsed["result"]["records"][counter]["Name"];
                let year = parsed["result"]["records"][counter]["Year"];
                let type = parsed["result"]["records"][counter]["Remarks"];

                /* Splits up Remarks column from API and if they are successfully split into type and comment it is considered to good
                */
                try {
                    type = type.split('.  ');
                    comment = "" + type[1];
                    type = "" + type[0];
                    goodType = type === "Injured" || type === "Killed" || type === "Fatal";
                    year = year.slice(0, 4);
                }catch(err){
                    goodType = false;
                }

                /* If this row in the API contains a name, year, comment and the type is either Injured, Killed or Fatal
                it is added to the array allWorkers as and object that hold all the info we need
                */
                if (goodType && name.length > 0 && year.length > 0 && comment.length > 0){
                    /* if the injury type is injured it is considered as a person that can be injured
                    */
                    if(type === "Injured" && injured > 0){
                        amountOfPeople --;
                        injured --;
                        allWorkers.push({name: name, year: year, type: type, comment: comment, employed: false, injured: false, alive: true});

                    /* if the injury type is killed or fatal it is considered as a person that can be killed
                    */
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

function getWorkers(allWorkers){
    /* returns all workers, if there are no workers in array retrieves workers from API
    */
    return new Promise(async function(resolve, reject){
        if(allWorkers.length === 0){
            allWorkers = await makeAllWorkers(allWorkers);
        }
        resolve(allWorkers);
    });
}

function makeCurrentWorkers(allWorkers, currentWorkers){
    /* Makes a list of workers that are currently employed
    Ensures that there are an equal amount of people that can be injured and can die
    */
    let amountOfHires = 10;
    let fatal = 5;
    let injured = 5;
    let counter = 0;

    return new Promise(function(resolve, reject){
        while (amountOfHires > 0 && counter < allWorkers.length){
            /* if the injury type is killed or fatal it is considered as a person that can be killed
            */
            if (fatal > 0 && (allWorkers[counter].type === "Killed" || allWorkers[counter].type === "Fatal")){
                fatal --;
                amountOfHires --;
                allWorkers[counter].employed = true;
                currentWorkers.push(allWorkers[counter]);
            }
            /* if the injury type is injured it is considered as a person that can be injured
            */
            else if (injured >= 0 && allWorkers[counter].type) {
                injured --;
                amountOfHires --;
                currentWorkers.push(allWorkers[counter]);
                allWorkers[counter].employed = true;
            }
            counter ++;
        }
        resolve(currentWorkers);
    });
}

function getCurrent(allWorkers, currentWorkers){
    /* Retrieves current employees, if there are no current emplyees
    it creates workers from the data retrieved from API
    */
    return new Promise(async function(resolve, reject){
        if(currentWorkers.length === 0){
            currentWorkers = await makeCurrentWorkers(allWorkers, currentWorkers);
        }
        resolve(currentWorkers);
    });
}

function printTheseWorkers(workers){
    /* Console.logs entire workers array for testing purposes
    */
    for(let i = 0; i < workers.length; i++){
        console.log(workers[i].name);
        console.log(workers[i].type);
        console.log(workers[i].employed);
    }
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
}

function findAllWorkerIndex(allWorkers, workers, index){
    /* Finds a worker in array based on the most unique part, the comment which is a string with description of incident
    Return the index of that person
    */
    for(let i = 0; i < workers.length; i++){
        if(workers[index].comment === allWorkers[i].comment){
            return i;
        }
    }
    return 0;
}

function findType(workers, type, type2){
    /* Goes through an array of people and finds the index of a person of that type and returns the index
    */
    let index = 0;

    for(index; index < workers.length; index++){
        if(workers[index].type === type || workers[index].type === type2){
            return  index;
        }
    }
    return 0;
}

let makeExport = {
    getAllWorkers: async function(allWorkers){
        /* Retrieves list of all workers
        */
        return await getWorkers(allWorkers);
    },
    getCurrentWorkers: async function(allWorkers, currentWorkers) {
        /* Retrieves list of all current employees
        */
        return await getCurrent(allWorkers, currentWorkers);
    },
    fireWorker: function(allWorkers, workers, index){
        /* Fires a worker (currently not used)
        */
        let allIndex = findAllWorkerIndex(allWorkers, workers, index);
        allWorkers[allIndex].employed = false;
        workers.splice(index, 1);
    },
    hireWorker: function(allWorkers, workers, possibleHires, index){
        /* Fires a worker (currently not used)
        */
        let allIndex = findAllWorkerIndex(allWorkers, possibleHires, index);
        allWorkers[allIndex].employed = true;
        workers.push(possibleHires[index]);
    },
    injureWorker: function(allWorkers, workers, injured){
        /* Injures a worker
        */
        let index = findType(workers, "Injured", "Injured");
        let allIndex = findAllWorkerIndex(allWorkers, workers, index);
        allWorkers[allIndex].injured = true;
        workers[index].injured = true;
        injured.push(injured.splice(index, 1));
        return injured[-1];
    },
    killWorker: function(allWorkers, workers, killed){
        /* Kills a worker
        */
        let index  = findType(workers, "Killed", "Fatal");
        let allIndex = findAllWorkerIndex(allWorkers, workers, index);
        allWorkers[allIndex].alive = false;
        workers[index].alive = false;
        killed.push(workers.splice(index, 1));
        return killed[-1];
    },
    getCurrentInjuredAndKilled: function(workers){
        /* Retrieves all workers that either have been killed or injured
        */
        return new Promise(function (resolve, reject){
            let outArray = [];
            for(let i = 0; i < workers.length; i++){
                if(workers[i].injured || !workers[i].alive){
                    outArray.push(workers[i]);
                }
            }
            resolve(outArray);

        });

    },
    getPossibleHires: async function(allWorkers){
        return new Promise(function(resolve, reject){
            let possibleHires = [];
            let amountOfHires = 10;
            let counter = 0;

            while (amountOfHires > 0 && counter < allWorkers.length){
                if(!allWorkers[counter].employed){
                    possibleHires.push(allWorkers[counter]);
                    amountOfHires--;
                }
                counter++;
            }
            resolve(possibleHires);
        });
    },
    printWorkers: function(workers){
        /* prints all workers in array (only used during testing)
        */
        printTheseWorkers(workers);
    }

};

module.exports = makeExport;