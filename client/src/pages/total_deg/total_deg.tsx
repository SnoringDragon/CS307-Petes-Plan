import React from 'react';
import Collapse from '@material-ui/core/Collapse';
import { Layout } from '../../components/layout/layout';
import { useReducer, useEffect, useState } from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core';
import Container from '@material-ui/core/Container';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import { FormLabelTypeMap } from '@material-ui/core';
import { Degree } from '../../types/degree';
import DegreeService from '../../services/DegreeService';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { UserCourse } from '../../types/user-course';
import CourseHistoryService from '../../services/CourseHistoryService';

import { FaSearch } from 'react-icons/fa';
import { ApiCourse } from '../../types/course-requirements';
import CourseService from '../../services/CourseService';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    MenuItem,
    Select
} from '@material-ui/core';
import { DegreePlan } from '../../types/degree-plan';
import DegreePlanService from '../../services/DegreePlanService';


export function TotalDeg() {
    const navigate = useNavigate()

    const [courses, setCourses] = useState<ApiCourse[]>([]);
    const [degrees, setDegrees] = useState<Degree[]>([]);
    const [degreePlans, setDegreePlans] = useState<DegreePlan[]>([]);
    const [degreePlan, setDegreePlan] = useState<DegreePlan | null>(null);
    const [error, setError] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
    const [course, setCourse] = useState<ApiCourse | null>(null);
    
    const [useCour, setUseCour] = useState<UserCourse[]>([]);
    const [userCourses, setUserCourses] = useState<UserCourse[]>([]);

    const [createNewPlan, setCreateNewPlan] = useState(false);
    const [selectSemester, setSelectSemester] = useState(false);
    const [degreeSearch, setDegreeSearch] = useState('');
    

    const [courseModifications, setCourseModifications] = useState<{
        add: Omit<UserCourse, '_id'>[],
        delete: string[]
    }>({ delete: [], add: [] });

    const [degreeModifications, setDegreeModifications] = useState<{
        add: Degree[],
        delete: string[]
    }>({ delete: [], add: [] });      


    const save = async () => {
        try {
            await DegreePlanService.removeFromDegreePlan(degreePlan!._id, degreeModifications.delete, courseModifications.delete)
            await DegreePlanService.addToDegreePlan(degreePlan!._id, degreeModifications.add, courseModifications.add);

            setCourseModifications({ add: [], delete: [] });
            setDegreeModifications({ add: [], delete: [] });
        } catch (e) {
            alert('Failed to update: ' + ((e as any)?.message ?? e)); // it is 4 am and i do not want to style this more
        }

        DegreeService.getDegrees().then(res => setDegrees(res));
        DegreePlanService.getPlans().then(res => {
            setDegreePlans(res.degreePlans);
            setDegreePlan(res.degreePlans.find(p => p._id === degreePlan?._id)!);
        });
    }

    useEffect(() => {
        DegreeService.getDegrees().then(res => setDegrees(res));
        CourseHistoryService.getCourses()
                .then(res => setUserCourses(res.courses.sort(
                    function(a, b) {
                        if(a.year < b.year) return -1;
                        if(a.year > b.year) return 1;
                        if(a.year == b.year && a.semester.toLowerCase() > b.semester.toLowerCase()) return 1;
                        if(a.year == b.year && a.semester.toLowerCase() < b.semester.toLowerCase()) return -1;
                        return 0;
                    })));
        DegreePlanService.getPlans().then(res => {
            setDegreePlans(res.degreePlans);
            if (res.degreePlans.length)
                setDegreePlan(res.degreePlans[0]);
        });
    }, []);
    


    
    return (<Layout>
        <div className="grid grid-cols-3 gap-y-2 gap-x-3">
            <div className="w-full h-full flex flex-col items-center justify-left">
                <div className="bg-white rounded px-4 pb-3 pt-4 text-black w-full">
                    <div className="text-2xl">Select Degree Plan</div>
                    <Select fullWidth className="my-2" value={degreePlans.findIndex(p => p.name === degreePlan?.name)} onChange={ev => setDegreePlan(degreePlans[ev.target.value as number])}>
                        {degreePlans.map((plan, i) => (<MenuItem key={i} value={i}>
                            {plan.name}
                        </MenuItem>))}
                    </Select>
                </div>
                <Card className="mt-3">
                        <CardHeader title="Completed Courses" className="text-center h-10 bg-zinc-800 text-white" />
                        <CardContent>
                            {userCourses.map((course, i) => (<div className="flex items-center mb-2" key={i}>
                                <div className="mr-4">{course.subject} {course.courseID}: {course.semester} {course.year} : </div>
                                <TextField value={course.grade}/>
                                <div className="mx-2" />
                            </div>))}
                            {courseModifications.add.map((course, i) => (<div className="flex items-center mb-2" key={i}>
                                <div className="mr-4">{course.subject} {course.courseID}:</div>
                                <TextField value={course.grade} onChange={ev => {
                                    const newAdditions = courseModifications.add.map(x => {
                                        if (x === course)
                                            return { ...x, grade: ev.target.value }
                                        return x;
                                    });
                                    setCourseModifications({...courseModifications, add: newAdditions });
                                }} />
                            </div>))}
                        </CardContent>
                    </Card>
                {degreePlan && <>
                    <div className="bg-white rounded px-4 pb-3 pt-4 text-black w-full mt-3">
                        <div className="text-2xl">Planned Courses</div>
                        {degreePlan.courses.sort(
                    function(a, b) {
                        if(a.year < b.year) return -1;
                        if(a.year > b.year) return 1;
                        if(a.year == b.year && a.semester.toLowerCase() > b.semester.toLowerCase()) return 1;
                        if(a.year == b.year && a.semester.toLowerCase() < b.semester.toLowerCase()) return -1;
                        return 0;
                    }).map((course, i) => (<div key={i} className="flex items-center py-2 border-b border-gray-300">
                            <Link className="mr-auto" to={`/course_description?subject=${course.subject}&courseID=${course.courseID}`}>{course.subject} {course.courseID} : {course.semester} {course.year} </Link>
                        </div>))}
                        {courseModifications.add.map((course, i) => (<div key={i} className="flex items-center py-2 border-b border-gray-300">
                            <Link className="mr-auto" to={`/course_description?subject=${course.subject}&courseID=${course.courseID}`}>{course.subject} {course.courseID}</Link>
                            <Button variant="contained" color="secondary" onClick={() => {
                                setCourseModifications({
                                    ...courseModifications,
                                    add: courseModifications.add.filter(c => c !== course)
                                });
                            }}>Delete</Button>
                        </div>))}
                        {(courseModifications.add.length || courseModifications.delete.length) ? <Button
                            variant="contained"
                            size="large"
                            color="secondary"
                            className="w-full h-8" onClick={save}>
                            Save
                        </Button> : null}
                    </div>
                </>}
            </div>
        </div>
    </Layout>)
}

