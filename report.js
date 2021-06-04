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
    this.totalCredits = null
    this.status = '?'
    this.tuition = null
  }
  // each student has their own method for calculating their own totals and status
  calculate(){
    // total the credit hours
    let countCredit = 0;
    this.classes.forEach((c)=>{
      countCredit += c.credit;
    });
    this.totalCredits = countCredit;
    // determine status
    // I forgot the criteria, but this is where we'd do that logic
    this.status = (this.totalCredits > 10) ? 'FT' : 'PT'
    this.tuition = this.totalCredits
  }
}

function loadFileIntoMemory(fileName){ 
  fs.createReadStream(fileName)
    .pipe(csv())
      .on('data', line => fileData.push(line))
        .on('end', () => compileData())
}

// this function will compile and restructure the data so that there is only one object per student
function compileData(){
  let checkedIDs = [];
  fileData.forEach( row => {
    let {id, firstname, lastname, classname, credit} = row;
    if (!checkedIDs.includes(id)){
      let student = new Student(id, firstname, lastname);
      student.classes.push({classname:classname,credit:Number(credit)});
      students.push(student);
      checkedIDs.push(id);
    }
    else {
      let index = students.findIndex ( student => student.id === id );
      students[index].classes.push({classname:classname,credit:Number(credit)});
    }
  })
  processData()
}

function processData(){
  students.forEach((student)=>{
    student.calculate()
  })
  console.log(students)
}

loadFileIntoMemory('./sampleData.csv')