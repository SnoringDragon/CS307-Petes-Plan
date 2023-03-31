import { AbstractRequirementGroup, Requirement } from '../../types/course-requirements';
import { Link } from 'react-router-dom';
import { UserCourse } from '../../types/user-course';
import React, { useReducer, useEffect, useState } from 'react';
import DegreePlanService from '../../services/DegreePlanService';
import { DegreePlan } from '../../types/degree-plan';

let gradeValues: { [key: string]: number } = {
    'D-': 1, 'D': 2, 'D+': 3, 'C-': 4, 'C': 5, 'C+': 6, 'B-': 7, 'B': 8, 'B+': 9, 'A-': 10, 'A': 11, 'A+': 12
};

const joinRequirements = (group: AbstractRequirementGroup, joiner: JSX.Element | string | null, depth: number, userCourses: UserCourse[]) => {
    return group.children.map((child, i) => (<span key={`${child.type} ${i} ${depth}`}>
        {i !== 0 && joiner}
        <Prerequisites userCourses={userCourses} prerequisites={child} isChild={true} depth={depth + 1} />
    </span>));
};

export function Prerequisites(props: { prerequisites: Requirement, userCourses: UserCourse[], isChild?: boolean, depth?: number }) {
    // TODO: better looking prerequisites

    const data = props.prerequisites;
    const isChild = props.isChild;
    const depth = props.depth ?? 0;
    const [degreePlans, setDegreePlans] = useState<DegreePlan[]>([]);
    const [degreePlan, setDegreePlan] = useState<DegreePlan | null>(null);


    if (data === null) return (<span>None</span>);

    if (data.type === 'course_group') { } // TODO FIXME!!!

    if (data.type === 'course') {

        useEffect(() => {
            DegreePlanService.getPlans().then(res => {
                setDegreePlans(res.degreePlans);
                if (res.degreePlans.length)
                    setDegreePlan(res.degreePlans[0]);
            });
        })

        const userCourse = props.userCourses.find(course => course.courseID === data.courseID &&
            course.subject === data.subject);
        console.log(data);

        const satisfied = (userCourse?.grade === data.minGrade) || (gradeValues[userCourse?.grade ?? ''] >= gradeValues[data.minGrade]);

        
        let current = false;
        let planned = false;
        if (userCourse) {
        
        if (satisfied) {
            let yr = new Date().getFullYear();
            let mon = new Date().getMonth();
            let month;

            if (mon > 7 && mon < 13) {
                month = "Fall";
            } else if (mon < 5 && mon > 0) {
                month = "Spring";
            } else if (mon > 4 && mon < 8) {
                month = "Summer";
            } else {
                month = "N/A";
            }

            if (!(userCourse!.semester.localeCompare(month)) && yr == userCourse!.year)  {
                current = true;
            }
        }

        if (!satisfied) {
            for (let j = 0; j < degreePlans!.length; j++) {
                for (let i = 0; i < degreePlan!.courses.length; i++) {
                    if (userCourse!.courseID === degreePlan!.courses[i].courseID
                        && userCourse!.subject === degreePlan!.courses[i].subject) {
                            planned = true;
                            break;
                    }
                }
                if (planned) {
                    break;
                }
            }
        }
    }

        let color = '';
        if (current) {
            color = 'bg-blue-500';
        } else if (planned) {
            color = 'bg-yellow-500';
        } else if (satisfied) {
            color = 'bg-green-500';
        } else {
            color = 'bg-red-500';
        }

        
        console.log(data);

        return (<span className={`bg-opacity-25 ${color}`}>
            <Link to={`/course_description?subject=${data.subject}&courseID=${data.courseID}`}>
                {data.subject} {data.courseID}
            </Link> minimum grade of {data.minGrade}
            {data.isCorequisite && ' [can be taken concurrently]'}
        </span>);
    }

    if (data.type === 'and')
        return (<span>{isChild && '('}{joinRequirements(data, <b> AND </b>, depth, props.userCourses)}{isChild && ')'}</span>);

    if (data.type === 'or')
        return (<span>{isChild && '('}{joinRequirements(data, <b> OR </b>, depth, props.userCourses)}{isChild && ')'}</span>);

    if (data.type === 'pick_n')
        return (<span>Pick {data.n} {data.requiredCredits !== null && `; ${data.requiredCredits} credits required`}: ({joinRequirements(data, <b>OR</b>, depth, props.userCourses)})</span>);

    if (data.type === 'non_course')
        return (<span>{data.text}</span>);

    if (data.type === 'student_level')
        return (<span>Student Level: {data.level}</span>);

    return null;
}

