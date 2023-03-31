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
import DegreePlanService from '../../services/DegreePlanService';
import { DegreePlan } from '../../types/degree-plan';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    MenuItem,
    Select
} from '@material-ui/core';

export function Major_Requirements() {
    const [degree, setDegree] = useState<Degree | null>(null);
    const [searchParams] = useSearchParams();
    const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
    const [shared, setShared] = useState<{courseID: string, subject: string}[]>([]);
    
    const [degreePlans, setDegreePlans] = useState<DegreePlan[]>([]);
    const [degreePlan, setDegreePlan] = useState<DegreePlan | null>(null);

    const share = () => {
        DegreePlanService.getOverlap(degreePlan!._id, degree!._id).then(res => {console.log(res); setShared(res.reqs)});
        console.log(shared);
    }


    useEffect(() => {
        DegreeService.getDegree(searchParams.get('id') ?? '')
            .then(res => setDegree(res));
        CourseHistoryService.getCourses().then(res => setUserCourses(res.courses));
        DegreePlanService.getPlans().then(res => {
            setDegreePlans(res.degreePlans);
            if (res.degreePlans.length)
                setDegreePlan(res.degreePlans[0]);
        });
    }, [searchParams]);


    if (!degree) return (<span>'Degree not found'</span>);

    return (<Layout><div className="w-full h-full flex items-center justify-center">
        <div>
        <Card className="-mt-4">
            <CardHeader title={`${degree.type[0].toUpperCase()}${degree.type.slice(1)} in ${degree.name}`} className="text-center bg-zinc-800 text-white" />
            <CardContent>
                <div className="p-4">
                    <u>Requirements:</u> {degree.requirements.map((course, i) => {
                        const isSatisfied = userCourses.find(other => other.courseID === course.courseID &&
                            other.subject === course.subject);

                        return (<span key={i}>
                            {i !== 0  && <b> AND </b>}
                            <Link className={`bg-opacity-25 ${isSatisfied ? 'bg-green-500' : 'bg-red-500'}`} to={`/course_description?subject=${course.subject}&courseID=${course.courseID}`}>
                                {course.subject} {course.courseID}
                            </Link>
                        </span>)
                    })}
                    <p></p>
                </div>
                <br></br>
                <div className="text-l italic px-4">Select Degree Plan</div>
                <div className="px-4">
                    <Select  className="my-2 italic" value={degreePlans.findIndex(p => p.name === degreePlan?.name)} onChange={ev => setDegreePlan(degreePlans[ev.target.value as number])}>
                        {degreePlans.map((plan, i) => (<MenuItem key={i} value={i}>
                            {plan.name}
                        </MenuItem>))}
                    </Select>
                    <Button onClick={share}>
                        See Shared Courses
                    </Button>
                    </div>
            </CardContent>
        </Card>
        <Card className="mt-8">
            <CardHeader title={"Comparison to Current Plan"} className="text-center bg-zinc-500 text-white" />
            <CardContent>
                <div className="p-4">
                <u>Shared Requirements: </u> {shared!.map((course, i) => {
                        const isSatisfied = userCourses.find(other => other.courseID === course.courseID &&
                            other.subject === course.subject);
                        
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
        </div>
    </div></Layout>)
}
