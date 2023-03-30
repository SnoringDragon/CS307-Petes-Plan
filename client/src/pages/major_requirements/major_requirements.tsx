import React, { useReducer, useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import { FormLabelTypeMap } from '@material-ui/core';
import { Layout } from '../../components/layout/layout';
import { Degree } from '../../types/degree';
import DegreeService from '../../services/DegreeService';
import { Link, useSearchParams } from 'react-router-dom';
import { UserCourse } from '../../types/user-course';
import CourseHistoryService from '../../services/CourseHistoryService';

export function Major_Requirements() {
    const [degree, setDegree] = useState<Degree | null>(null);
    const [searchParams] = useSearchParams();
    const [userCourses, setUserCourses] = useState<UserCourse[]>([]);


    useEffect(() => {
        DegreeService.getDegree(searchParams.get('id') ?? '')
            .then(res => setDegree(res));
        CourseHistoryService.getCourses().then(res => setUserCourses(res.courses));
    }, [searchParams]);

    if (!degree) return (<span>'Degree not found'</span>);

    return (<Layout><div className="w-full h-full flex items-center justify-center">
        <Card className="-mt-16">
            <CardHeader title={`${degree.type[0].toUpperCase()}${degree.type.slice(1)} in ${degree.name}`} className="text-center bg-zinc-800 text-white" />
            <CardContent>
                <div className="p-4">
                    <u>Requirements:</u> {degree.requirements.map((course, i) => {
                        const isSatisfied = userCourses.find(other => other.courseID === course.courseID &&
                            other.subject === course.subject);

                //         return (<span key={i}>
                //             {i !== 0  && <b> AND </b>}
                //             <Link className={`bg-opacity-25 ${isSatisfied ? 'bg-green-500' : 'bg-red-500'}`} to={`/course_description?subject=${course.subject}&courseID=${course.courseID}`}>
                //                 {course.subject} {course.courseID}
                //             </Link>
                //         </span>)
                //     })}
                //     <p></p>
                // </div>
                // <div className="p-4">
                //     <u>Shared Requirements:</u> {degree.requirements.map((course, i) => {
                //         const isSatisfied = userCourses.find(other => other.courseID === course.courseID &&
                //             other.subject === course.subject);

                        return (<span key={i}>
                            {i !== 0  && <b> AND </b>}
                            <Link className={`bg-opacity-25 ${isSatisfied ? 'bg-green-500' : 'bg-red-500'}`} to={`/course_description?subject=${course.subject}&courseID=${course.courseID}`}>
                                {course.subject} {course.courseID}
                            </Link>
                        </span>)
                    })}
                    <p></p>
                </div>
            </CardContent>
        </Card>
    </div></Layout>)
}
