const csv = require('csv-parser')
const fs = require('fs')

const fileData = []
const students = []

class Student{
  constructor(id, firstname, lastname){
    this.id = id
    this.firstname = firstname
    this.lastname = lastname
    this.classes = []
    this.totalCredits = 0
    this.status = '?'
    this.tuition = 0
  }
}

function loadFileIntoMemory(fileName){ 
  fs.createReadStream(fileName)
    .pipe(csv())
      .on('data', line => fileData.push(line))
        .on('end', () => processData())
}

function processData(){

  let studentIDs = [];

  fileData.forEach( row => {
    let {id, firstname, lastname, classname, credit} = row;
    if (!studentIDs.includes(id)){
      studentIDs.push(id);
      let student = new Student(id, firstname, lastname);
      student.totalCredits += Number(credit);
      student.classes.push(classname);
      students.push(student);
    }
    else {
      let index = students.findIndex ( student => student.id === id );
      students[index].totalCredits += Number(credit);
      students[index].classes.push(classname);
    }
  })
  console.log(students);
}

loadFileIntoMemory('./sampleData.csv')