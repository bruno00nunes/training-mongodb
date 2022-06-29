// 1. Search for a contact in my contact list
// 2. List all my contacts in alphabetic order
// 3. Create a pagination system that shows all my contacts

//  Marco - 20365353
//  Danilo - 34255342
//  More(y/n) y
//  Tiago - 6452432
//  Aguiar - 436345523

const USERS_PER_PAGE = 2;

const MongoClient = require("mongodb").MongoClient;
const inquirer = require("inquirer");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
client.connect();
const database = client.db("contacts");

// List all contacts paginated and ordered
async function listContacts(contactList, pageNumber = 0) {
    const collection = database.collection(contactList);

    pageNumber = pageNumber < 0 ? 0 : pageNumber;

    const sortBy = {name: 1, number: 1};
    const projection = {_id: 0, name: 1, number: 1};

    const contacts = await collection.find({}, projection).limit(USERS_PER_PAGE).skip(pageNumber * USERS_PER_PAGE).sort(sortBy).toArray();

    console.log("\nPage " + (pageNumber + 1));
    contacts.forEach((contact) => {
        console.log(contact.name + " - " + contact.number);
    });

    if (contacts.length < USERS_PER_PAGE) {
        console.log("\nNo more users.\n");
        options();
        return;
    }

    const questions = [
        {
            type: "confirm",
            name: "action",
            message: "Load more contacts?",
            default: true
        }
    ]
    const answers = await inquirer.prompt(questions);
    const { action } = answers;

    if(action) 
        listContacts(contactList, pageNumber + 1);
    else
        options();
}

// Search for a contact in my contact list
async function searchContact(contactList) {
    const collection = database.collection(contactList);

    const prompts = [
        {
            type: "input",
            name: "contactName",
            message: "Contact name to search"
        }
    ];

    const { contactName } = await inquirer.prompt(prompts);
    const contacts = await collection.find({"name": new RegExp('.*' + contactName + '.*')}, {name: 1, number: 1, _id:0}).toArray();

    contacts.forEach((contact) => {
        console.log(contact.name + " - " + contact.number);
    });
    
    options();
}

async function options() {
    const db = client.db("contacts");

    // Get all collections in list form
    const collections = await db.listCollections().toArray();

    // Question to be asked to the user
    const questions = [
        {
            type: "rawlist",
            name: "contactList",
            message: "Please type a contact list",
            choices: collections
        },
        {
            type: "rawlist",
            name: "action",
            message: "Choose an action",
            choices: ["List Contacts", "Search Contact", "Exit"]
        }
    ]

    // Ask questions to the user
    const answers = await inquirer.prompt(questions);

    const {contactList, action} = answers;

    switch(action){
        case "List Contacts":
            listContacts(contactList);
            break;
        case "Search Contact":
            searchContact(contactList);
            break;
        case "Exit":
            process.exit();
        default:
            options();
    }
}

// run interface
options();