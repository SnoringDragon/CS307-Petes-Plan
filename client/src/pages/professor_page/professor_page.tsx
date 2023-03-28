import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/layout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiProfessor } from '../../types/professor';
import { FaArrowLeft } from 'react-icons/fa';
import ProfessorService from '../../services/ProfessorService';

export function Professor_Page() {
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const [error, setError] = useState('');

    const [professor, setProfessor] = useState<ApiProfessor | null>(null);

    /*
    const [userCourses, setUserCourses] = useState<UserCourse[]>([])
    
    useEffect(() => {
        CourseHistoryService.getCourses()
            .then(res => setUserCourses(res.courses));
    }, [])
    */
    useEffect(() => {
        const name = searchParams.get('professorName') ?? '';

        ProfessorService.getProfessor({ name })
            .then(res => {
                if (!res) {
                    setProfessor(null);
                    setError('Professor not found');
                    return;
                }
                setProfessor(res);
            })
            .catch(err => {
                setError(err?.message ?? err);
            });
    }, [searchParams])

    if (!professor) return (<Layout><div className="text-2xl flex flex-col h-full justify-center items-center">
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
            {professor.name}
        </header>
        <div className="p-4">
            <div><span className="underline">Email:</span> {professor.email}</div>
            <div className="mt-5 underline">Rate my Professor link:</div>
            <div>{professor.rateMyProfessorLink} </div>
        </div>
    </div></Layout>)
}