/*
* === GOAL ===
* Create a command line interface to create and list and remove contact folders
* Every contact folder should be a container
* Create a command to create
* Create a command to list
* Create a command to remove
* */

const MongoClient = require("mongodb").MongoClient
const inquirer = require("inquirer")

const url = "mongodb://localhost:27017/contacts"
const client = new MongoClient(url)
client.connect()

async function listContactList(){
    // show collections
    // use databaseName - Create and select database
    const db = client.db("contacts");

    // Get all collections in list form
    const collections = await db.listCollections().toArray();

    collections.forEach((collection, i) => {
        console.log(i + " - " + collection.name);
    });

    menu();
}

async function createContactList(){
    const db = client.db("contacts");

    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "New Collection name"
        }
    ])
    .then((answers) => {
        const { name } = answers;
        
        console.log("Collection " + name + " added");
        db.createCollection(name);
    })
    .catch((error) => {
        console.log("Aconteceu um erro: "+ error);
    })
    .finally(() => {
        menu();
    });
}

async function removeContactList(){
    const db = client.db("contacts")

    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Collection to remove"
        }
    ])
    .then((answers) => {
        const { name } = answers;
    
        console.log("Collection " + name + " removed");
        db.dropCollection(name);
    })
    .catch((error) => {
        console.log("Aconteceu um erro: "+ error);
    })
    .finally(() => {
        menu();
    });
}

function menu() {
    inquirer
        .prompt([
            {
                type: 'rawlist',
                name: 'action',
                message: 'Action',
                choices: ['List Contact Lists', 'Create Contact List', 'Remove Contact List'],
            },
        ])
        .then(function (answers) {
            switch (answers['action']) {
                case "List Contact Lists":
                    listContactList();
                    break;
                case "Create Contact List":
                    createContactList();
                    break;
                case "Remove Contact List":
                    removeContactList();
                    break;
                default:
                    menu();
            }
        })
        .catch(error => {
            console.log(error);
        });
};
menu();