import { Layout } from '../../components/layout/layout';
import { TextField } from '@material-ui/core';
import { FaSearch } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { ApiCourse } from '../../types/course-requirements';
import CourseService from '../../services/CourseService';
import { Link, useSearchParams } from 'react-router-dom';
import ProfessorService from '../../services/ProfessorService';
import { ApiProfessor } from '../../types/professor';

export function CourseInstructorSearch() {
    const [courses, setCourses] = useState<ApiCourse[]>([]);
    const [instructors, setInstructors] = useState<ApiProfessor[]>([])
    const [searchParams, setSearchParams] = useSearchParams();

    const courseSearch = () => {
        CourseService.searchCourse(searchParams.get('course') ?? '')
            .then(res => setCourses(res));
    };

    const instructorSearch = () => {
        ProfessorService.searchProfessor(searchParams.get('instructor') ?? '')
            .then(res => setInstructors(res));
    };

    useEffect(() => {
        courseSearch();
        instructorSearch();
    }, []);

    return (<Layout><div className="flex gap-12">
        <div className="flex-grow">
            <div className="flex items-center mb-4">
                <TextField className="flex-grow text-white" label="Course Search" variant="standard" value={searchParams.get('course')}
                           InputProps={{ className: 'text-white' }}
                           InputLabelProps={{ className: 'text-white' }}
                           onChange={ev => setSearchParams({ ...searchParams, course: ev.target.value })}
                           onKeyDown={ev => ev.key === 'Enter' && courseSearch()} />
                <FaSearch className="ml-6 mr-2 cursor-pointer" onClick={courseSearch} />
            </div>
            <div className="border-x border-gray-500 rounded flex flex-col">
            {courses.map((course, i) => (<Link to={`/course_description?subject=${course.subject}&courseID=${course.courseID}`}
                className="w-full py-3 px-4 bg-gray-600 border-y border-gray-500 cursor-pointer" key={i}>
                {course.subject} {course.courseID}: {course.name}
            </Link>))}
            </div>
        </div>
        <div className="flex-grow">
            <div className="flex items-center mb-4">
                <TextField className="flex-grow text-white" label="Instructor Search" variant="standard" value={searchParams.get('instructor')}
                           InputProps={{ className: 'text-white' }}
                           InputLabelProps={{ className: 'text-white' }}
                           onChange={ev => setSearchParams({ ...searchParams, instructor: ev.target.value })}
                           onKeyDown={ev => ev.key === 'Enter' && instructorSearch()} />
                <FaSearch className="ml-6 mr-2 cursor-pointer" onClick={instructorSearch} />
            </div>
            <div className="border-x border-gray-500 rounded flex flex-col">
                {instructors.map((instructor, i) => (<Link to={`/professor?id=${instructor._id}`}
                className="w-full py-3 px-4 bg-gray-600 border-y border-gray-500 cursor-pointer" key={i}>
                    {instructor.firstname}{instructor.nickname ? ` (${instructor.nickname}) ` : ' '}{instructor.lastname}
                </Link>))}
            </div>
        </div>
    </div></Layout>);
}
