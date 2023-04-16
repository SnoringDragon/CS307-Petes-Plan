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
    Button,
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
import { Semester } from '../../types/semester';
import SemesterService from '../../services/SemesterService';
import { Boilergrade, BOILERGRADES_GRADES } from '../../types/boilergrades';
import BoilerGradesService from '../../services/BoilerGradesService';
import { Boilergrades } from '../../components/boilergrades/boilergrades';

export function Course_Description() {
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [course, setCourse] = useState<ApiCourse | null>(null);
    const [userCourses, setUserCourses] = useState<UserCourse[]>([])
    const [selectedSemester, setSemester] = useState<string | null>(null);
    const [section, setSection] = useState<Section[][][] | null>(null);
    const [showSections, setShowSections] = useState(true);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [boilergrades, setBoilergrades] = useState<Boilergrade[]>([]);

    const [viewReviews, setViewReviews] = useState(false);
    const [makeReviews, setMakeReviews] = useState(false);

    useEffect(() => {
        CourseHistoryService.getCourses()
            .then(res => setUserCourses(res.courses));

        SemesterService.getSemesters().then(res => setSemesters(res));

    }, [])

    useEffect(() => {
        const subject = searchParams.get('subject') ?? '';
        const courseID = searchParams.get('courseID') ?? '';
        setBoilergrades([]);

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

        BoilerGradesService.getCourse({ subject, courseID })
            .then(res => setBoilergrades(res));
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
    </div></Layout>);

    const bgdata = BoilerGradesService.reduceBoilergrades(boilergrades, 'instructor');

    console.log(course)
    return (<Layout>
        <Dialog open={viewReviews} onClose={() => setViewReviews(false)}>
            <DialogTitle>Reviews</DialogTitle>    
            <DialogContent>
                <div>Reviews Go Here</div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setViewReviews(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={makeReviews} onClose={() => setMakeReviews(false)}>
            <DialogTitle>Make a Review</DialogTitle>    
            <DialogContent>
                <div>Making a review goes here</div>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Review"
                    fullWidth
                    variant="standard"
                    inputRef={}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setMakeReviews(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        <div className="w-full h-full flex flex-col items-center">
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
            <Prerequisites prerequisites={course.requirements} />

            <div className="mt-4 mb-2 flex items-center">
                <span className="underline mr-4">Sections:</span>

                <Select className="my-2 mx-4 text-white" labelId="demo-simple-select-label"
                        value={selectedSemester}
                        label="Semester"
                        onChange={ev => {
                            setSemester(ev.target.value as string);
                            setShowSections(true);
                        }} >
                    {semesters.map((semester) => (<MenuItem key={semester._id} value={semester._id}>
                        {semester.semester} {semester.year}
                    </MenuItem>))}
                </Select>

                {section?.length ? <Button color="inherit" variant="outlined" onClick={() => setShowSections(!showSections)}>
                    {showSections ? 'Hide' : 'Show'} Sections
                </Button> : null}

                {section?.length === 0 && <span>No sections scheduled for this semester.</span>}
            </div>

            <div className={`flex w-full justify-center ${showSections ? '' : 'hidden'}`}>
            <div className="flex w-full flex-row flex-wrap gap-4 items-start justify-center">
            {section?.map((section, i) =>
                <div key={i} className="bg-opacity-25 bg-gray-500 p-2 mb-2 rounded-md">{section.map(
                    (section, i) => <div className="bg-gray-500 bg-opacity-25 py-2 px-3 mb-2 rounded-md" key={i}>
                    <div className="text-xl">{section[0].scheduleType} Schedule Type</div>
                    {section.map((section, i) => <div key={i} className="my-2 text-sm">
                        <div className="mb-1">{section.name} ({section.sectionID}) CRN: {section.crn}</div>
                        <table>
                            <thead>
                                <tr className="border border-gray-500">
                                    <th className="border border-gray-500 px-2 py-1">Days</th>
                                    <th className="border border-gray-500 px-2 py-1">Time</th>
                                    <th className="border border-gray-500 px-2 py-1">Location</th>
                                    <th className="border border-gray-500 px-2 py-1">Instructor</th>
                                </tr>
                            </thead>
                            <tbody>
                            {section.meetings.map((meeting, i) => <tr key={i}>
                                <td className="border border-gray-500 px-2 py-1 w-16">{meeting.days?.length ? meeting.days.join(', ') : 'TBD'}</td>
                                <td className="border border-gray-500 px-2 py-1 w-36">
                                    {meeting.startTime ? `${meeting.startTime}-${meeting.endTime}` : 'TBD'}
                                </td>
                                <td className="border border-gray-500 px-2 py-1 w-64">
                                    {meeting.location || 'TBD'}
                                </td>
                                <td className="border border-gray-500 px-2 py-1 w-96">
                                    {meeting.instructors?.length ? meeting.instructors.map((instructor, i) =>
                                        <Link to={`/professor?id=${instructor._id}&filter=${course?._id}`}>{instructor.firstname}{instructor.nickname ? ` (${instructor.nickname}) ` : ' '}{instructor.lastname}</Link>) : 'TBA (To Be Assigned)'}
                                </td>
                            </tr>)}
                            </tbody>
                    </table></div>)}</div>)}</div>)}
            </div>
            </div>

            <Boilergrades data={bgdata} />

            <div className="mt-5 underline">Reviews:</div>
            <Ratings courseID={course.courseID} subject={course.subject} filter={searchParams.get('filter')?.split(',') ?? []} />
            <div></div>
            <Button
            variant="contained"
            size="large"
            color="primary"
            className="w-full h-6"
            onClick={() => {
                setViewReviews(true);
            }}>
            Do you want to view the reviews? Click Here.
        </Button>
        </div>
    </div></Layout>)
}
