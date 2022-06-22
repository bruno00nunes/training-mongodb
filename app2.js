const MongoClient = require("mongodb").MongoClient
const ObjectId = require("mongodb").ObjectId
const inquirer = require("inquirer")

const url = "mongodb://localhost:27017/contacts"
const client = new MongoClient(url)
client.connect();
const db = client.db("contacts");

async function menu() {
    const prompts = [
        {
            type:"input",
            name:"contactList",
            message:"Type a contact list"
        },
        {
            type: 'rawlist',
            name: 'action',
            message: 'Action',
            choices: ['List Contacts', 'Create Contact', 'Remove Contact', "Exit"],
        }
    ];

    const { contactList, action } = await inquirer.prompt(prompts)

    switch (action) {
        case "List Contacts":
            listContacts(contactList);
            break;
        case "Create Contact":
            createContact(contactList);
            break;
        case "Remove Contact":
            removeContact(contactList);
            break;
        case "Exit":
            process.exit();
        default:
            menu();
    }
};

async function listContacts(contactList){
    const collection = db.collection(contactList);
    const contacts = await collection.find().toArray();

    console.table(contacts, ['_id', 'name', 'number', 'address']);

    menu();
}

async function createContact(contactList){
    const collection = db.collection(contactList);

    const prompts = [
        {
            type: "input",
            name: "name",
            message: "Contact name"
        },
        {
            type: "input",
            name: "number",
            message: "Contact number"
        },
        {
            type: "input",
            name: "address",
            message: "Contact address"
        }
    ];

    const { name, number, address } = await inquirer.prompt(prompts);
    
    const res = await collection.insertOne({name:name, number:number, address:address});
    console.log("Contact " + name + " added\n" + JSON.stringify(res));
    
    menu();
}

async function removeContact(contactList){
    const collection = db.collection(contactList);

    const prompts = [
        {
            type: "input",
            name: "contactId",
            message: "Contact ID to remove"
        }
    ];

    const { contactId } = await inquirer.prompt(prompts);
    
    try {
        const res = await collection.deleteOne({_id: new ObjectId(contactId)});
        console.log("Contact with ID " + contactId + " removed\n" + JSON.stringify(res));
    }
    catch(e) {
        console.log(e.message);
    }
    finally {
        menu();
    }
}

menu();