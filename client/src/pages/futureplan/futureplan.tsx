import { Layout } from '../../components/layout/layout';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { ApiCourse } from '../../types/course-requirements';
import CourseService from '../../services/CourseService';
import { Degree } from '../../types/degree';
import DegreeService from '../../services/DegreeService';
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
import { UserCourse } from '../../types/user-course';

export function FuturePlan() {
    const navigate = useNavigate()

    const [courses, setCourses] = useState<ApiCourse[]>([]);
    const [degrees, setDegrees] = useState<Degree[]>([]);
    const [degreePlans, setDegreePlans] = useState<DegreePlan[]>([]);
    const [degreePlan, setDegreePlan] = useState<DegreePlan | null>(null);
    const [error, setError] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
    const [selectedSem, setSelectedSem] = useState('Fall');

    const [createNewPlan, setCreateNewPlan] = useState(false);
    const [selectSemester, setSelectSemester] = useState(false);

    const searchRef = useRef({ value: '' });
    const nameRef = useRef({value:''});
    const yearRef = useRef({value: ''});

    const [degreeSearch, setDegreeSearch] = useState('');

    const [courseModifications, setCourseModifications] = useState<{
        add: Omit<UserCourse, '_id'>[],
        delete: string[]
    }>({ delete: [], add: [] });

    const [degreeModifications, setDegreeModifications] = useState<{
        add: Degree[],
        delete: string[]
    }>({ delete: [], add: [] });


    const search = () => {
        CourseService.searchCourse(searchRef.current.value)
            .then(res => setCourses(res));
    };

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
        DegreePlanService.getPlans().then(res => {
            setDegreePlans(res.degreePlans);
            if (res.degreePlans.length)
                setDegreePlan(res.degreePlans[0]);
        });
    }, []);

    return (<Layout>
        <Dialog open={createNewPlan} onClose={() => setCreateNewPlan(false)}>
            <DialogTitle>Enter Plan Name</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Name"
                    fullWidth
                    variant="standard"
                    inputRef={nameRef}
                />
            </DialogContent>
            <DialogContentText>
                {error && <div className="text-red-500">Error: {error}</div>}
            </DialogContentText>
            <DialogActions>
                <Button onClick={() => setCreateNewPlan(false)}>Cancel</Button>
                <Button onClick={() => {
                    DegreePlanService.createDegreePlan(nameRef.current.value)
                        .then((newPlan) => {
                            DegreePlanService.getPlans()
                                .then(res => {
                                    setDegreePlans(res.degreePlans);
                                    setDegreePlan(res.degreePlans.find(p => p._id === newPlan.degreePlan._id)!)
                                });
                            setCreateNewPlan(false);
                        })
                        .catch(err => setError(err?.message ?? err))

                }}>Create</Button>
            </DialogActions>
        </Dialog>

        <Dialog open={selectSemester} onClose={() => setSelectSemester(false)}>
            <DialogTitle>Select Semester</DialogTitle>
            <DialogContent>
                <Select value = {selectedSem} onChange={e => setSelectedSem(e.target.value as string)} >
                    <MenuItem value="Fall">Fall</MenuItem>
                    <MenuItem value="Spring">Spring</MenuItem>
                    <MenuItem value="Summer">Summer</MenuItem>
                </Select>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Year"
                    fullWidth
                    variant="standard"
                    inputRef={yearRef}
                />
            </DialogContent>
            <DialogContentText>
                {error && <div className="text-red-500">Error: {error}</div>}
            </DialogContentText>
            <DialogActions>
                <Button onClick={() => setSelectSemester(false)}>Cancel</Button>
                <Button onClick={() => {
                    setCourseModifications({
                        ...courseModifications,
                        add: [...courseModifications.add, {
                            subject: selectedCourse!.subject,
                            courseID: selectedCourse!.courseID,
                            semester: selectedSem,
                            grade: 'A',
                            year: parseInt(yearRef.current.value)
                        }]
                    });
                    setSelectSemester(false);
                }}>Create</Button>
            </DialogActions>
            </Dialog>

        <div className="grid grid-cols-3 gap-y-2 gap-x-3">
            <div className="w-full h-full flex flex-col items-center justify-left">
                <div className="bg-white rounded px-4 pb-3 pt-4 text-black w-full">
                    <div className="text-2xl">Search Courses</div>
                    <div className="flex items-center">
                        <TextField
                            fullWidth
                            label="Search"
                            placeholder="Search"
                            margin="normal"
                            onKeyDown={ev => ev.key === 'Enter' && search()}
                            inputRef={searchRef}
                        />
                        <FaSearch className="ml-4 cursor-pointer" onClick={search} />
                    </div>
                </div>
                <div className="border-x border-gray-500 bg-slate-500 rounded mt-4 w-full flex flex-col">
                    {courses.map((course, i) => (<div
                                                       className="w-full py-3 px-4 bg-gray-600 border-y border-gray-500 flex items-center" key={i}>
                        <Link to={`/course_description?subject=${course.subject}&courseID=${course.courseID}`} className="mr-auto">{course.subject} {course.courseID}: {course.name}</Link>
                        <Button color="inherit" onClick={() => {
                            setSelectedCourse(course);
                            setError(''); setSelectSemester(true)
                        }}>Add</Button>
                    </div>))}
                </div>
            </div>
            <div className="bg-white rounded px-4 pb-3 pt-4 text-black w-full">
                <div className="text-2xl">Degrees</div>
                <TextField
                    fullWidth
                    label="Search"
                    placeholder="Search"
                    margin="normal"
                    value={degreeSearch}
                    onChange={ev => setDegreeSearch(ev.target.value)}
                />
                {degrees.filter(d => d.name.toLowerCase().includes(degreeSearch.toLowerCase()))
                    .map((degree, i) => (<div key={i} className="my-2 flex">
                        <Link to={`/major_requirements?id=${degree._id}`} className="mr-auto">{degree.type[0].toUpperCase()}{degree.type.slice(1)} in {degree.name}</Link>
                        <Button variant="contained" color="secondary" onClick={() => {
                            setDegreeModifications({
                                ...degreeModifications,
                                add: [...degreeModifications.add, degree]
                            });
                        }}>Add</Button>
                </div>))}
            </div>
            <div className="col-start-3 flex flex-col justify-right">
                <div className="bg-white rounded px-4 pb-3 pt-4 text-black w-full">
                    <div className="text-2xl">Select Degree Plan</div>
                    <Select fullWidth className="my-2" value={degreePlans.findIndex(p => p.name === degreePlan?.name)} onChange={ev => setDegreePlan(degreePlans[ev.target.value as number])}>
                        {degreePlans.map((plan, i) => (<MenuItem key={i} value={i}>
                            {plan.name}
                        </MenuItem>))}
                    </Select>
                    <Button variant="contained" color="secondary" fullWidth onClick={() => {
                        setError(''); setCreateNewPlan(true)
                    }}>Create New Plan</Button>
                </div>
                {degreePlan && <>
                    <div className="bg-white rounded px-4 pb-3 pt-4 text-black w-full mt-3">
                        <div className="text-2xl">Planned Courses</div>
                        {degreePlan.courses.map((course, i) => (<div key={i} className="flex items-center py-2 border-b border-gray-300">
                            <Link className="mr-auto" to={`/course_description?subject=${course.subject}&courseID=${course.courseID}`}>{course.subject} {course.courseID}</Link>
                            <Button variant="contained" color="secondary" onClick={() => {
                                setDegreePlan({
                                    ...degreePlan,
                                    courses: degreePlan.courses.filter(x => x !== course)
                                });
                                setCourseModifications({
                                    ...courseModifications,
                                    delete: [...courseModifications.delete, course._id]
                                });
                            }}>Delete</Button>
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

                    <div className="bg-white rounded px-4 pb-3 pt-4 text-black w-full mt-3">
                        <div className="text-2xl">Planned Degrees</div>
                        {degreePlan.degrees.map((degree, i) => (<div key={i} className="flex items-center py-2 border-b border-gray-300">
                            <Link to={`/major_requirements?id=${degree._id}`} className="mr-auto">{degree.type[0].toUpperCase()}{degree.type.slice(1)} in {degree.name}</Link>
                            <Button variant="contained" color="secondary" onClick={() => {
                                setDegreePlan({
                                    ...degreePlan,
                                    degrees: degreePlan.degrees.filter(x => x !== degree)
                                });
                                setDegreeModifications({
                                    ...degreeModifications,
                                    delete: [...degreeModifications.delete, degree._id]
                                });
                            }}>Delete</Button>
                        </div>))}
                        {degreeModifications.add.map((degree, i) => (<div key={i} className="flex items-center py-2 border-b border-gray-300">
                            <Link to={`/major_requirements?id=${degree._id}`} className="mr-auto">{degree.type[0].toUpperCase()}{degree.type.slice(1)} in {degree.name}</Link>
                            <Button variant="contained" color="secondary" onClick={() => {
                                setDegreeModifications({
                                    ...degreeModifications,
                                    add: degreeModifications.add.filter(c => c !== degree)
                                });
                            }}>Delete</Button>
                        </div>))}
                        {(degreeModifications.add.length || degreeModifications.delete.length) ? <Button
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
        
    </Layout>);
}