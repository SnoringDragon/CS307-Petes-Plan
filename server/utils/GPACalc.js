const courseModel = require('../models/courseModel');
const usercourseModel = require('../models/userCourseModel');
const degreeModel = require('../models/degreeModel');

let uniqueCourses;

async function calculateGPA(userCourseModels) {
    let GPAQualPts = [];
    let creditHours = [];
    let creditHourSum = 0;
    let creditHour = 0;
    //userCourseModels is list of userCourseModel docs
    for (let i = 0; i < userCourseModels.length; i++) {
        if (!userCourseModels[i].grade.localeCompare("A+") || !userCourseModels[i].grade.localeCompare("A")) {
            GPAQualPts.push(4.0);
        } else if (!userCourseModels[i].grade.localeCompare("A-")) {
            GPAQualPts.push(3.7);
        } else if (!userCourseModels[i].grade.localeCompare("B+")) {
            GPAQualPts.push(3.3);
        } else if (!userCourseModels[i].grade.localeCompare("B")) {
            GPAQualPts.push(3.0);
        } else if (!userCourseModels[i].grade.localeCompare("B-")) {
            GPAQualPts.push(2.7);
        } else if (!userCourseModels[i].grade.localeCompare("C+")) {
            GPAQualPts.push(2.3);
        } else if (!userCourseModels[i].grade.localeCompare("C")) {
            GPAQualPts.push(2.0);
        } else if (!userCourseModels[i].grade.localeCompare("C-")) {
            GPAQualPts.push(1.7);
        } else if (!userCourseModels[i].grade.localeCompare("D+")) {
            GPAQualPts.push(1.3);
        } else if (!userCourseModels[i].grade.localeCompare("D")) {
            GPAQualPts.push(1.0);
        } else if (!userCourseModels[i].grade.localeCompare("D-")) {
            GPAQualPts.push(0.7);
        } else if (!userCourseModels[i].grade.localeCompare("E") || !userCourseModels[i].grade.localeCompare("F") || !userCourseModels[i].grade.localeCompare("IF")) {
            GPAQualPts.push(0.0);
        } else {
            continue; // WIP, TR, P, N, I, PI, SI, W, WF, WN, WU, IN, IU, AU, NS are Not included
        }
        creditHour = await courseModel.findOne({ subject: userCourseModels[i].subject, courseID: userCourseModels[i].courseID })
        creditHours.push(+creditHour.maxCredits);
        creditHourSum += +creditHour.maxCredits;
    }
    let indexPts = 0;
    for (let i = 0; i < creditHours.length; i++) {
        indexPts += creditHours[i] * GPAQualPts[i];
    }
    return [indexPts, creditHourSum];
}

async function cumulativeGPA(req, res) {
    //userCourseModels is doc array
    //hopefully this only pulls current user's courses
    let userCourseModels = req.user.completedCourses;
    let returned = await calculateGPA(userCourseModels);
    res.json(returned[0] / returned[1]);
}

async function semesterGPA(req, res, semesterInput, yearInput) {
    let userCourseModels = req.user.completedCourses
        .filter(course => course.semester === semesterInput && course.year === yearInput);
    let returned = await calculateGPA(userCourseModels);
    res.json(returned[0] / returned[1]);
}

async function concentrationGPA(req, res, major, concentrations) {
    debugger;
    //cycle through all of user's concentrations, see which ones apply to major -- if it applies, add it to major GPA
    // let majorDoc = degreeModel.findOne({ name: major, type: 'major' });
    // majorDoc.exec(function (err) {
    //     if (err) {
    //         return "Error: Major does not exist. Please pick a different major.";
    //     }
    // });
    let major_concentrations_ids = [];

    let concentrIndexPtsSum = 0, concentrCreditHourSum = 0;
    //add all major concentrations and their names
    for (let i = 0; i < major.concentrations.length; i++) {
        // let concentration = degreeModel.findById(majorDoc.concentrations[i]);
        // concentration.exec(function (err) {
        //     if (err) {
        //         return "Error: Concentration does not exist.";
        //     }
        // });
        const concentration = major.concentrations[i];
        major_concentrations_ids.push(concentration.toString());
    }

    //if the student is taking the concentration, calculateGPA for those courses
    for (let i = 0; i < concentrations.length; i++) {
        let concentrCourses = [];
        //if user is taking a concentration that applies to the current major
        if (major_concentrations_ids.includes(concentrations[i]._id.toString())) {
            const concentration = await degreeModel.findOne({ _id: concentrations[i] });

            for (let i = 0; i < concentration.requirements.length; i++) {
                const requirement = concentration.requirements[i];
                const course = req.user.completedCourses
                    .find(({ subject, courseID }) => subject === requirement.subject && courseID === requirement.courseID);
                // let course = usercourseModel.findOne({ courseID: req.user.degreePlans.degrees[i].requirements[i].courseID });
                // course.exec(function (err, courseRet) {
                //     if (err) {
                //         return "Error: User did not take course OR Course does not exist.";
                //     }
                    if (course && !(uniqueCourses.has(course.courseID))) { //if course not already in uniqueCourses
                        concentrCourses.push(course);
                        uniqueCourses.set(course.courseID, 1);
                    } 
                // });
            }
            let [concentrIndexPts, concentrCreditHour] = await calculateGPA(concentrCourses);
            concentrIndexPtsSum += concentrIndexPts;
            concentrCreditHourSum += concentrCreditHour;
        }
    }
    return [concentrIndexPtsSum, concentrCreditHourSum];
}

async function majorGPA(req, res, majorDoc, concentrations) {
    uniqueCourses = new Map();
    //doesn't include concentration GPA
    // let majorDoc = await degreeModel.findOne({ name: major, type: 'major' }).exec();
    let requirements = majorDoc.requirements; //series of requirements: Course objects
    let userCourseModels = req.user.completedCourses;  //completed courses: UserCourse objects
    let majorCourses = [];
    let requirementIDs = [];
    //add all major requirements to requirementIDs 
    for (let i = 0; i < requirements.length; i++) {
        requirementIDs.push(requirements[i].courseID);
    }
    //if the completed courses are also in major requirements, include them
    for (let i = 0; i < userCourseModels.length; i++) {
        if (requirementIDs.includes(userCourseModels[i].courseID)) {
            // let completedCourse = await courseModel.findOne({ courseID: userCourseModels[i].courseID });
            majorCourses.push(userCourseModels[i]);
            uniqueCourses.set(userCourseModels[i].courseID, 1); //add class to uniqueClasses to eliminate double-couning
        }
    }
    let majorReturned = await calculateGPA(majorCourses);
    let returned = await concentrationGPA(req, res, majorDoc, concentrations);
    majorReturned[0] += returned[0];
    majorReturned[1] += returned[1];
    res.json(majorReturned[0] / majorReturned[1]);
}

module.exports = { cumulativeGPA, semesterGPA, majorGPA };


// courseAttributeSchema = new courseAttribute
// let CS180 = courseModel.findOne({ courseID: "18000"}).exec();
// console.log(CS180.courseID);
// course = new courseModel("Object Oriented Progragrimming in Java", "CS", "CS 180000", "180", 3, 3, "Intro CS course");
// userCourseModels = new courseModel("Object Oriented Progragrimming in Java", "CS", "A", 2020);
// calculateGPA(userCourseModels)