const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

// start the script by reading a file, a chain of function calls will do the work
const studentRegistration = path.join(__dirname,process.argv[2]+'.csv');
readFile(studentRegistration);
// this is the main data structure that will contain student objects
const students = [];
/*
  each student object has their own method for calculating their own credit totals, status and tuition
  first sum the total of each object.credit property in the classes array
  next determine FT/PT status based on the total credits
  now start to calculate the tuition based on both status and total credits
  part time students just pay $250 per credit and can return from the function early
  if more code runs you are a full time student and you must pay at least $3,000
  but wait! if you are super duper full time get charged an extra $250 per credit over 18 credits
*/
// each student calculation results will be added to these values
const schoolTotals = {
  ptStudents: 0,
  ftStudents: 0,
  allStudents: 0,
  ptTuitTotal: 0,
  ftTuitTotal: 0,
  allTuitTotal: 0
}
class Student{
  constructor(id, firstname, lastname){
    this.id = id
    this.firstname = firstname
    this.lastname = lastname
    this.classes = [] // an array of objects with the props {classname, credit}
    this.classList = '' // added a string verion of the classes for the csv writer
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
      return this.reportTotals();
    }
    this.tuition = 3000;
    if (this.totalCredits > 18) {
      let extraCharge = 250 * (this.totalCredits - 18); // take 18 off of your total to know how many are extra
      this.tuition += extraCharge;
    }
    return this.reportTotals();
  }
  reportTotals(){
    switch(this.status){
      case 'PT':
        schoolTotals.ptStudents += 1;
        schoolTotals.ptTuitTotal += this.tuition;
        schoolTotals.allTuitTotal += this.tuition;
        break;
      case 'FT':
        schoolTotals.ftStudents += 1;
        schoolTotals.ftTuitTotal += this.tuition;
        schoolTotals.allTuitTotal += this.tuition;
        break;
    }
    schoolTotals.allStudents += 1;
    // make a string version of list of classes for the csv writer
    this.classes.forEach(subject => {
      this.classList += `Subject: ${subject.classname} Credit Hours: ${subject.credit} | `;
    });
  }
}
//------------------------------------FUNCTIONAS------------------------------------------------------
// parse the csv file line by line into objects, collect them in an array.
// then pass that array to the compile function
function readFile(fileName){ 
  let fileData = []
  fs.createReadStream(fileName)
    .pipe(csv())
      .on('data', line => fileData.push(line))
        .on('end', () => compileData(fileData))
}
// Compile and restructure the redundant rows of data using instances of the Student class
// Instead of keeping data for every single unique combination of student and class registration  
// Each student will have their own list of enrolled classes, and there will be only one chunk of data per student
function compileData(fileData){
  // look at each row of data and keep track of the student IDs we have seen so far
  let checkedIDs = [];
  fileData.forEach( row => {
    let {id, firstname, lastname, classname, credit} = row;
    // if we have not seen this student ID yet, make a new student object and collect the data that belongs to them
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
  // after our data structure is set up, call a function that will tell each student to calculate their own totals.
  calcData()
}
// Now we will call each student and tell them to figure out what they need to pay
// then they will report their final status and tuiton to the school totals
function calcData(){
  students.forEach((student) => {
    student.calcTuition()
  })
  // after the math is done, call a final reporting function
  reportFinalData();
}

function reportFinalData(){
  // console.log(students);
  // console.log(schoolTotals);
  writeSchoolReport();
  writeStudentReport();
}

function writeSchoolReport(){
  let filePath = path.join(__dirname,'output','school_report.csv');
  let csvWriter = createCsvWriter({  
    path: filePath,
    header: [
      {id: 'ptStudents', title: 'Part Time Students'},
      {id: 'ptStudents', title: 'Full Time Students'},
      {id: 'allStudents', title: 'Total Students'},
      {id: 'ptTuitTotal', title: 'Part Time Tuition'},
      {id: 'ftTuitTotal', title: 'Full Time Tuition'},
      {id: 'allTuitTotal', title: 'Total Tuition'}
    ]
  });
  let records = [schoolTotals];
  csvWriter.writeRecords(records)
    .then( () => console.log(`School Records written to\n${filePath} Successfully!`));
}

function writeStudentReport(){
  let filePath = path.join(__dirname,'output','students_report.csv');
  let csvWriter = createCsvWriter({  
    path: filePath,
    header: [
      {id: 'id', title: 'id'},
      {id: 'firstname', title: 'First Name'},
      {id: 'lastname', title: 'Last Name'},
      {id: 'classList', title: 'Classes'},
      {id: 'totalCredits', title: 'Total Credits'},
      {id: 'status', title: 'Status'},
      {id: 'tuition', title: 'Tuition'}
    ]
  });
  const records = students;
  csvWriter.writeRecords(records)
    .then( () => console.log(`Student Records written to\n${filePath} Successfully!`));
}