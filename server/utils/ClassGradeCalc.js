//input: weights (Map) & assigments (2D Arr)
                        //str    //str   //double   
    //assignments: [['label', 'name', numberGrade], [...], [...], ...]
    //weights: Map() with key category "label" and value [label_weight, label_cap]

    //Note: label_cap is a 0 or 1 for any category label except for for extra credit. for extra_cred, it can be an int cap 

//label examples: homework, exam, essay, quiz, project, extra cred, discussion, activity, mischellaneous
//see below to testing code for more examples

function calculateGrade(req, res) {
    let grade = 0.0;
    categories = req.categories;
    //weights is a map of type (str, int) = (label, weight). Ex: ("homework", "20") 
    
    for (let i = 0; i < categories.length; i++) {
        // let categoryGrade = 0;
        let numGrades = 0;
        let earnedPoints = 0;
        let maxPoints = 0;
        let ec = 0;
        for (let j = 0; j < categories[i].assignments.length; j++) {
            numGrades+=1;
            earnedPoints += (categories[i].assignments[j].earned_points);
            maxPoints += (categories[i].assignments[j].max_points);
            ec += categories[i].assignments[j].extra_credit;
        }
        //if extra credit category, add earnedPoints raw
        if (!categories[i].label.localeCompare("extra credit")) {
            ec += earnedPoints;
        } else {
            grade += earnedPoints/maxPoints * categories[i].weight * 100;
        }
        
        //if no extra credit cap, then don't apply it
        if (categories[i].max_ec < ec) {
            ec = categories[i].max_ec;
        }
        
        grade += ec;
        
    }
}

function getLetterGrade(numberGrade) {
    if (numberGrade >= 97) {
        return 'A+';
    } else if (numberGrade >= 93) {
        return 'A';
    } else if (numberGrade >= 90) {
        return 'A-';
    } else if (numberGrade >= 87) {
        return 'B+';
    } else if (numberGrade >= 83) {
        return 'B';
    } else if (numberGrade >= 80) {
        return 'B-';
    } else if (numberGrade >= 77) {
        return 'C+';
    } else if (numberGrade >= 73) {
        return 'C';
    } else if (numberGrade >= 70) {
        return 'C-';
    } else if (numberGrade >= 67) {
        return 'D+';
    } else if (numberGrade >= 63) {
        return 'D'
    } else if (numberGrade >= 60) {
        return 'D-'
    } else {
        return 'F';
    }   
}

module.exports = calculateGrade;

const jsonExample = {
    "categories": [
        {
            "label": "homework",
            "weight": 0.2,
            "max_ec": 4,
            "assignments": [
                {
                    "label": "Assignment 1",
                    "earned_points": 10,
                    "max_points": 12,
                    "extra_credit": 1
                },
                {
                    "label": "Assignment 2",
                    "earned_points": 4,
                    "max_points": 7,
                    "extra_credit": 2
                }
            ]
        },
        {
            "label": "quizzes",
            "weight": 0.3,
            "max_ec": 2,
            "assignments": [
                {
                    "label": "Quiz 1",
                    "earned_points": 36,
                    "max_points": 58,
                    "extra_credit": 4
                },
                {
                    "label": "Quiz 2",
                    "earned_points": 38,
                    "max_points": 39,
                    "extra_credit": 1
                }
            ]
        },
        {
            "label": "exams",
            "weight": 0.5,
            "max_ec": 0,
            "assignments": [
                {
                    "label": "Exam 1",
                    "earned_points": 48,
                    "max_points": 100,
                    "extra_credit": 1
                },
                {
                    "label": "Exam 2",
                    "earned_points": 85,
                    "max_points": 98,
                    "extra_credit": 0
                }
            ]
        }
    ]
};

// let weights = new Map();
// let labels = ["homework", "quiz", "exam", "extra credit"];
// //extra cred has default weight of 100
// let label_weights = [[30, 0], [40, 0], [30, 1], [100, 1]];
// for (let i = 0; i < (label_weights.length); i++) {
//     weights.set(labels[i], label_weights[i]);
// }
// assignments = [["homework", "Assignment 1", 90], ["homework", "Assignment 2", 80], ["homework", "Assignment 2", 70], ["quiz", "Quiz 1", 90], ["quiz", "Quiz 2", 100], ["exam", "Exam 1", 105], ["exam", "Exam 1", 100], ["extra credit", "ec 1", 6],];
console.log(calculateGrade(jsonExample));