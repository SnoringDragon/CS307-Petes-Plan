const courseModel = require('../models/courseModel');
const usercourseModel = require('../models/userCourseModel');
const degreeModel = require('../models/degreeModel');

async function calculateGPA9(userCourseModels) { 
    let GPAQualPts = [];
    let qualityHours = [];
    let qualityHourSum = 0;
    let qualityHour = 0;
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
        qualityHour = (await courseModel.findOne({ courseID: userCourseModels[i].courseID }).exec()).maxCredits;
        qualityHours.push(qualityHour);
        qualityHourSum += qualityHour;
    }
    indexPts = 0;
    for (let i = 0; i < qualityHours.length; i++) {
        indexPts += qualityHours[i]*GPAQualPts[i];
    }
    return indexPts, qualityHourSum;
    
}

exports.cumulativeGPA = async (req, res) =>  {
    //userCourseModels is doc array
    //hopefully this only pulls current user's courses
    let userCourseModels = req.user.completedCourses;
    indexPts, qualityHourSum = calculateGPA(userCourseModels);
    return indexPts/qualityHourSum;
}

exports.semesterGPA = async (req, res) =>  {
    let userCourseModels = await usercourseModel.find({ semester: semesterInput, year: yearInput }).exec();
    indexPts, qualityHourSum = calculateGPA(userCourseModels);
    return indexPts/qualityHourSum;
}

async function concentrationGPA(req, res, major) {
    //cycle through all concentrations, see which ones apply to major -- if it applies, add it to major GPA
    let majorDoc = await degreeModel.findOne({ name: major, type: 'major' }).exec();
    major_concentrations = [];
    major_concentrations_names = [];
    concentrIndexPtsSum, concentrQualityHourSum = 0, 0
    //add all major concentrations and their names
    for (let i = 0; i < majorDoc.concentrations.length; i++) {
        concentration = await this.findById(majorDoc.concentrations[i]).exec();
        major_concentrations.push(concentration);
        major_concentrations_names.push(concentration.name);
    } 
    //if the student is taking the concentration, calculateGPA for those courses
    for (let i = 0; i < req.user.degreePlans.degrees; i++) {
        if (major_concentrations_names.contains(req.user.degreePlans.degrees[i].name)) {
            let concentrIndexPts, concentrQualityHour = calculateGPA(major_concentrations[i].requirements)
            concentrIndexPtsSum+=concentrIndexPts;
            concentrQualityHourSum+=concentrQualityHour;
        }
    }
    return concentrIndexPtsSum, concentrQualityHourSum;
}

exports.majorGPA = async (req, res, major) =>  {
    //doesn't include concentration GPA
    let majorDoc = await degreeModel.findOne({ name: major, type: 'major' }).exec();
    let requirements = majorDoc.requirements;
    let userCourseModels = await usercourseModel.find();
    let majorCourses = [];
    let requirementIDs = [];
    //add all major requirements to requirementIDs 
    for (let i = 0; i < requirements.length; i++) {
        requirementIDs.push(requirements.courseID);
    }
    //if the completed courses are also in major requirements, include them
    for (let i = 0; i < userCourseModels.length; i++) {
        if (requirementIDs.contains(userCourseModels[i].courseID)) {
            majorCourses.push(userCourseModels[i].courseID);
        }
    }
    let majorIndexPts, majorQualityHourSum = calculateGPA(majorCourses);
    let concentrIndexPtsSum, concentrQualityHourSum = concentrationGPA(req, res, major);
    majorIndexPts +=  concentrIndexPtsSum;
    majorQualityHourSum += concentrQualityHourSum;
    return majorIndexPts/majorQualityHourSum;
}
    

