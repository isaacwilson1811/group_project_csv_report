// import node modules
const csv = require('csv-parser') // this 3rd party module needs to be installed separately and will live in './node_modules/'
// running 'npm install' in this directory will make node see that csv-parser is listed in 'package.json' as a dependency, then npm will install it. 
const fs = require('fs') // the 'file system' module is built into node, no extra installation needed.

// Our data structure that lives and dies in runtime memory.
const fileData = [] // this is an empty array that will consist of objects representing each row of our csv file

// Function, that when called, will start reading our csv file line by line, parsing them into objects, and pushing them into our data array.
// this is a non-blocking / asynchronous function with a .on('end') event callback chained to it.
// you can see the infamous 'callback chain/tree of hell' issue starting to form here. Look that term up if you haven't heard it!
// I chose to envoke an outside named function as the last callback to avoid ugly nesting of the data processing logic.
function loadFileIntoMemory(fileName){ 
  fs.createReadStream(fileName)
    .pipe(csv())
      .on('data', line => fileData.push(line))
        // note that 'line' is just a temporary reference name for the current object produced by the parsing of the current line of data
        // we could call it something else and it would work.
        .on('end', () => processData())
}

// Function, that is to be called when the asynchronous file loading is done.
function processData(){

  // inside this function we can log out all of the data we now have in memory
  // our main program logic can live in here
  console.log(fileData);

  // before we scope into an iterative loop, we can define some counter variables and such
  let exampleCounter = 0;

   // we can iterate though the 'fileData' array and accesss the properties of each 'row' (object)
   // FYI nowhere in our data structure is anything actually called 'row', it's just a temporary reference name for the current object being looked at in our loop
  fileData.forEach( row => {
    // we can process and or manipulate the data here
    // maybe we would want to copy or push processed data into a new object or array?

    // inside this forEach loop we could do some conditional if statements
    // we can add to counter variables that have been defined outside of this loop (exampleCounter)
    exampleCounter ++ // increment the counter by 1. I just used it to count how many rows of data we have processed

    // alos, any variables we define in this loop with 'let' will die when the loop ends

    // lets just log out property values of the current row
    console.log('Row #' + exampleCounter + ' Processing...')
    console.log('Student ID: ' + row.id)
    console.log('Student Name: ' + row.firstname, row.lastname)
    console.log('Name of Class: ' + row.class)
    console.log('Credits: ' + row.credit)
    console.log(' ') // log an empty line to seperate chunks of log
    
  })

  // for each loop is done now
  // lets log out the value of our counter
  console.log('Total Rows Processed: ' + exampleCounter)
}

// *** PROGRAM STARTS ***
// okay let's envoke the file loading function with a our sample data's path/name as the argument
// when the data is done loading into memory, it will call the processData function
loadFileIntoMemory('./sampleData.csv')