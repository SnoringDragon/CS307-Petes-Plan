import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/layout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiCourse } from '../../types/course-requirements';
import { Section } from '../../types/course-requirements';
import { FaArrowLeft } from 'react-icons/fa';
import { Prerequisites } from '../../components/prerequisites/prerequisites';
import CourseService from '../../services/CourseService';
import { UserCourse } from '../../types/user-course';
import CourseHistoryService from '../../services/CourseHistoryService';
import { Ratings } from '../../components/ratings/ratings';
import { Link } from 'react-router-dom';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from '@material-ui/core';
import { Instructor } from '../instructor/instructor';

export function Course_Description() {
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const [error, setError] = useState('');

    const [course, setCourse] = useState<ApiCourse | null>(null);

    const [userCourses, setUserCourses] = useState<UserCourse[]>([])

    const [selectedSemester, setSemester] = useState<string | null>(null);

    const [section, setSection] = useState<Section[][][]>([]);

    useEffect(() => {
        CourseHistoryService.getCourses()
            .then(res => setUserCourses(res.courses));
    }, [])

    useEffect(() => {
        const subject = searchParams.get('subject') ?? '';
        const courseID = searchParams.get('courseID') ?? '';

        CourseService.getCourse({ subject, courseID })
            .then(res => {
                if (!res) {
                    setCourse(null);
                    setError('Course not found');
                    return;
                }
                setCourse(res);
            })
            .catch(err => {
                setError(err?.message ?? err);
            });
    }, [searchParams])

    useEffect(() => {
        const subject = searchParams.get('subject') ?? '';
        const courseID = searchParams.get('courseID') ?? '';

        if (selectedSemester != null) {
            CourseService.getCourseSections({ subject, courseID, semester: selectedSemester })
                .then(res => {
                    if (!res) {
                        setSection([]);
                        setError('Course Sections not found');
                        return;
                    }
                    setSection(res);
                })
                .catch(err => {
                    setError(err?.message ?? err);
                });
        }
    }, [selectedSemester])

    if (!course) return (<Layout><div className="text-2xl flex flex-col h-full justify-center items-center">
        Loading...
        {error && <>
            <div className="text-xl text-red-500 mt-4">Error: {error}</div>
            <a className="text-sm mt-2 cursor-pointer" onClick={() => navigate(-1)}>Go back</a>
        </>}
    </div></Layout>)

    console.log(course)
    return (<Layout><div className="w-full h-full flex flex-col items-center">
        <header className="text-center text-white text-3xl mt-4 w-full">
            <div className="float-left ml-2 text-2xl cursor-pointer" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </div>
            {course.subject} {course.courseID}: {course.name}
        </header>
        <div className="p-4">
            <div><span className="underline">Credit Hours:</span> {course.minCredits === course.maxCredits ?
                course.minCredits :
                `${course.minCredits} to ${course.maxCredits}`}</div>
            <div className="mt-5 underline">Course Description:</div>
            <div>{course.description} </div>
            {/*<p> </p>*/}
            {/*<text><u><br />Class Type:</u></text>*/}
            {/*<p></p>*/}
            {/*<text>{initialState.class_type.split('\n').map(str => <p>{str}</p>)}</text>*/}
            {/*<p></p>*/}
            {/*<text><u><br />Semester(s) offered:</u></text>*/}
            {/*<p></p>*/}
            {/*<text>{initialState.semester.split('\n').map(str => <p>{str}</p>)} </text>*/}
            {/*<p></p>*/}
            {/*<text><u><br />Restrictions:</u></text>*/}
            {/*<p></p>*/}
            {/*<text>{initialState.restrictions.split('\n').map(str => <p>{str}</p>)}</text>*/}
            {course.attributes.length ? <div className="mt-5">
                <span className="underline">Attributes:</span> &nbsp;
                {course.attributes.map(attribute => attribute.name).join(', ')}
            </div> : null}
            <div className="mt-5 underline">Prerequisities:</div>
            <p></p>
            <Prerequisites prerequisites={course.requirements} userCourses={userCourses} />
            <div className="mt-5 underline">Reviews:</div>
            <Ratings courseID={course.courseID} subject={course.subject} filter={searchParams.get('filter')?.split(',') ?? []} />
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Semester</InputLabel>
                <Select fullWidth className="my-2" labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedSemester}
                    label="Semester"
                    onChange={ev => setSemester(ev.target.value as string)} >
                    {course.semesters.map((semester) => (<MenuItem key={semester._id} value={semester._id}>
                        {semester.semester} {semester.year}
                    </MenuItem>))}
                </Select>
            </FormControl>
            <div><span className="underline">Sections:</span></div>
            {section.map(section => <div>{section.map(
                section => <div>{section.map(
                    section => <div>{section.meetings.map(
                        meetings => <div>{meetings.days} {meetings.startTime}-{meetings.endTime} {meetings.instructors.length ? meetings.instructors.map(
                            instructors => <div><Link to={`/professor?id=${instructors._id}`}>
                                {instructors.firstname} {instructors.lastname}
                            </Link></div>) : "To Be Assigned (TBA)"}</div>)}</div>)}</div>)}</div>)}
        </div>
    </div></Layout>)
}