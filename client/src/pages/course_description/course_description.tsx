import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/layout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiCourse } from '../../types/course-requirements';
import { FaArrowLeft } from 'react-icons/fa';
import { Prerequisites } from '../../components/prerequisites/prerequisites';
import CourseService from '../../services/CourseService';
import { UserCourse } from '../../types/user-course';
import CourseHistoryService from '../../services/CourseHistoryService';

export function Course_Description() {
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const [error, setError] = useState('');

    const [course, setCourse] = useState<ApiCourse | null>(null);

    const [userCourses, setUserCourses] = useState<UserCourse[]>([])

    /* I did this next lines */

    const [professors, setProfessors] = useState<Professors[]>([])

    const [sections, setSection] = useState<Section[]>([])

    const [time, setTime] = useState<Time[]>([])

    /** */

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

    if (!course) return (<Layout><div className="text-2xl flex flex-col h-full justify-center items-center">
        Loading...
        {error && <>
            <div className="text-xl text-red-500 mt-4">Error: {error}</div>
            <a className="text-sm mt-2 cursor-pointer" onClick={() => navigate(-1)}>Go back</a>
        </>}
    </div></Layout>)

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
            {/* I added this */}
            {course.attributes.length ? <div className="mt-5">
                <span className="underline">Attributes:</span> &nbsp;
                {course.attributes.map(attribute => attribute.name).join(', ')}
            </div> : null}
            <div className="mt-5 underline">Sections:</div>
            <p></p>
            <Prerequisites prerequisites={course.requirements} userCourses={userCourses} />
            {course.attributes.length ? <div className="mt-5">
                <span className="underline">Attributes:</span> &nbsp;
                {course.attributes.map(attribute => attribute.name).join(', ')}
            </div> : null}
            <div className="mt-5 underline">Professors:</div>
            <p></p>
            <Prerequisites prerequisites={course.requirements} userCourses={userCourses} />
            {course.attributes.length ? <div className="mt-5">
                <span className="underline">Attributes:</span> &nbsp;
                {course.attributes.map(attribute => attribute.name).join(', ')}
            </div> : null}
            <div className="mt-5 underline">Time:</div>
            <p></p>
            <Prerequisites prerequisites={course.requirements} userCourses={userCourses} />
            {/** */}
        </div>
    </div></Layout>)
}