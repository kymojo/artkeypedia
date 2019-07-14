
/*

Still to use:
    + https://www.toptal.com/nodejs/secure-rest-api-in-nodejs





*/

// ###############################################

/*
Setting up a new node.js application with Express:
1. Create your application ______.js file (this file)
2. Set up package.json w command: npm init --yes
3. Install express using command: npm i express
4. Install nodemon using command: npm i -g nodemon
5. Run application ______.js file using command:
           nodemon ______.js

6. If nodemon isn't recognized: npm i --save nodemon
   Then execute it via a script in package.json
   e.g. "scripts" : { "start" : "nodemon ___.js"}

    Sources:
        https://youtu.be/TlB_eWDSMt4
        https://youtu.be/pKd0Rpw7O48

Restful API implementation
7. Install joi using command: npm i joi
*/

// =========================================
// Require modules
// -----------------------------------------
const express = require('express');
const Joi = require('joi');

// =========================================
// Set up express app
// -----------------------------------------

// Set express app
const app = express();
app.use(express.json()); // allow JSON parsing

// Set port using PORT environment variable
// (eg. using command: set PORT=1337)
// if not set, default to port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

// =========================================
// Use public folder
// -----------------------------------------

app.use(express.static(__dirname + '/public'));

// =========================================
// REST API Example
// -----------------------------------------

// A constant array of persons
const people = [
    {'id':1, 'name':'Billy'},
    {'id':2, 'name':'Bob'},
    {'id':3, 'name':'Joe'},
];

// GET (all people)
app.get('/api/people', (req,res) => {
    res.send(people);
});

// GET (person by id)
app.get('/api/people/:id', (req,res) => {
    
    // Find person
    const person = people.find(c => c.id === parseInt(req.params.id));
    
    // If not found, set 404 status and return message
    if (!person) return res.status(404).send('The person with the given ID was not found!');
    
    // If found, return found person
    res.send(person);

    // Side-note: don't forget that you can use ?this=that in the URL to get req.query of {"this":"that"}
});

// POST
app.post('/api/people', (req,res) => {
    
    // Validate post
    const result = validatePerson(req.body);

    // If validation returned error, set status to 400 and return Joi error message
    if (result.error) return res.status(400).send(result.error.details[0].message);

    // Create new person
    const person = {
        id: people.length + 1,
        name: req.body.name
    }

    // Add new person to array
    people.push(person);

    // Return new person
    res.send(person);
});

// PUT
app.put('/api/people/:id', (req,res) => {

    // Find person
    const person = people.find(c => c.id === parseInt(req.params.id));
    
    // If not found, set 404 status and return message
    if (!person) return res.status(404).send('The person with the given ID was not found!');

    // Validate put
    const result = validatePerson(req.body);

    // If validation returned error, set status to 400 and return Joi error message
    if (result.error) return res.status(400).send(result.error.details[0].message);

    // Update person in array (note: person points to an object in the array)
    person.name = req.body.name;

    // Return updated person
    res.send(person);
});

// DELETE
app.delete('/api/people/:id', (req,res) => {

    // Find person
    const person = people.find(c => c.id === parseInt(req.params.id));
    
    // If not found, set 404 status and return message
    if (!person) return res.status(404).send('The person with the given ID was not found!');

    // Get index of person and remove from array
    const index = people.indexOf(person);
    people.splice(index, 1);

    // Return removed person
    res.send(person);
});

// Helper function
// -------------------------------------------
function validatePerson(person)
{
    const schema = {
        name : Joi.string().min(3).required()
    };
    return Joi.validate(person, schema);
}