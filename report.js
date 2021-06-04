const csv = require('csv-parser')
const fs = require('fs')

// this is the main data structure that will contain student objects
const students = []

/*
  each student object has their own method for calculating their own credit totals, status and tuition
  28. first sum the total of each object.credit property in the classes array
  31. next determine FT/PT status based on the total credits
      now start to calculate the tuition based on both status and total credits
  32. part time students just pay $250 per credit and can return from the function early
  36. if more code runs you are a full time student and you must pay at least $3,000
  37. but wait! if you are super duper full time get charged an extra $250 per credit over 18 credits
*/

class Student{
  constructor(id, firstname, lastname){
    this.id = id
    this.firstname = firstname
    this.lastname = lastname
    this.classes = [] // an array of objects with the props {classname, credit} 
    this.totalCredits = 0
    this.status = '?'
    this.tuition = 0
  }
  calcTuition(){
    for (let i = 0; i < this.classes.length; i++){
      this.totalCredits += this.classes[i].credit;
    }
    this.status = (this.totalCredits >= 12) ? 'FT' : 'PT';
    if (this.status === 'PT') { 
      this.tuition = 250 * this.totalCredits;
      return;
    }
    this.tuition = 3000;
    if (this.totalCredits > 18) {
      let extraCharge = 250 * (this.totalCredits - 18); // take 18 off of your total to know how many are extra
      this.tuition += extraCharge;
    }
  }
  reportTotals(){
    // after every student is done we can tell them to report the totals to make the school report
  }
}

// parse the raw csv file line by line into objects, collect them in an array
// then spit that array out to the compile function
function loadFileIntoMemory(fileName){ 
  let fileData = []
  fs.createReadStream(fileName)
    .pipe(csv())
      .on('data', line => fileData.push(line))
        .on('end', () => compileData(fileData))
}

// this function will compile and restructure the redundant data using instances of the Student class
function compileData(fileData){
  // look at each row of data and remember keep track of the student IDs we have seen
  let checkedIDs = [];
  fileData.forEach( row => {
    let {id, firstname, lastname, classname, credit} = row;
    // if we have not seen this student ID yet, make a new student and collect the data
    if (!checkedIDs.includes(id)){
      let student = new Student(id, firstname, lastname);
      student.classes.push({classname:classname,credit:Number(credit)});
      students.push(student);
      checkedIDs.push(id);
    }
    else {
      // if we have already seen this student ID, find a reference to that student, and add more data to their object
      let index = students.findIndex ( student => student.id === id );
      students[index].classes.push({classname:classname,credit:Number(credit)});
    }
  })
  // after our data structure is set up, call a function that will tell each student to calculate their own data.
  calcData()
}

// This function calls each student and tells them to do figure out what they need to pay
function calcData(){
  students.forEach((student) => {
    student.calcTuition()
  })
  // after the math is done, send off the reporting
  reportFinalData();
}

//this is where we could make a student report file
function reportFinalData( ){
  // now we can calculate stuff for the school report
  // for now, log out the results
  console.log(students);
}

loadFileIntoMemory('./sampleData.csv')