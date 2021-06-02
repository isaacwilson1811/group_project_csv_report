const csv = require('csv-parser')
const fs = require('fs')
const fileData = []

function loadFileIntoMemory(fileName){ 
  fs.createReadStream(fileName)
    .pipe(csv())
      .on('data', line => fileData.push(line))
        .on('end', () => processData())
}

function processData(){
  console.log(fileData);
  let exampleCounter = 0;

  fileData.forEach( row => {
    exampleCounter ++
    console.log('Row #' + exampleCounter + ' Processing...')
    console.log('Student ID: ' + row.id)
    console.log('Student Name: ' + row.firstname, row.lastname)
    console.log('Name of Class: ' + row.class)
    console.log('Credits: ' + row.credit)
    console.log(' ')
  })
  console.log('Total Rows Processed: ' + exampleCounter)
}

loadFileIntoMemory('./sampleData.csv')