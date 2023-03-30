import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import App from './App';
import './index.scss';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Homepage } from './pages/homepage/homepage';
import { PasswordReset } from './pages/password-reset/password-reset';
import { Verification } from './pages/verification/verification';
import { ChangePassword } from './pages/change-password/change-password';
import { ClassHistory } from './pages/classhistory/classhistory';
import { FuturePlan } from './pages/futureplan/futureplan';
import { Course_Description } from './pages/course_description/course_description';
import { Modify_Profile_Page } from './pages/modify_profile_page/modify_profile_page';
import { Profile_Page } from './pages/profile_page/profile_page';
import { AP_Class } from './pages/ap_class/ap_class';
import { Major_Requirements } from './pages/major_requirements/major_requirements';
import { VerifyEmail } from './pages/verify-email/verify-email';
import { CourseSearch } from './pages/course-search/course-search';
import { AllReq } from './pages/all_req/all_req';
import { GradeCalc } from './pages/grade-calc/grade-calc';
import { Section_Info } from './pages/section-info/section-info';
import { Instructor } from './pages/instructor/instructor';
import { SharedReq } from './pages/shared_req/shared_req';
import { TotalDeg } from './pages/total_deg/total_deg';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [{
      index: true,
      element: <FuturePlan />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/register',
      element: <Register />
    },
    {
      path: '/verify-email',
      element: <VerifyEmail />
    },
    {
      path: '/dashboard',
      element: <Dashboard />
    },
    {
      path: "/password-reset",
      element: <PasswordReset />
    },
    {
      path: "/verification",
      element: <Verification />
    },
    {
      path: "/change-password",
      element: <ChangePassword />
    },
    {
      path: "/course_description",
      element: <Course_Description />
    },
    {
      path: '/course-search',
      element: <CourseSearch />
    },
    {
      path: "/profile_page",
      element: <Profile_Page />
    },
    {
      path: "/modify_profile_page",
      element: <Modify_Profile_Page />
    },
    {
      path: "/ap_class",
      element: <AP_Class />
    },
    {
      path: "/major_requirements",
      element: <Major_Requirements />
    },
    {
      path: "/class-history",
      element: <ClassHistory />
    },
    {
      path: "/future-plan",
      element: <FuturePlan />
    },
    {
      path: "/all-req",
      element: <AllReq />
    },
    {
      path: "/grade-calc",
      element: <GradeCalc />
    }, 
    {
      path: "/section-info",
      element: <Section_Info />
    }, 
    {
      path: "/instructor",
      element: <Instructor />
    }, 
    {
      path: "/shared-req",
      element: <SharedReq />
    },
    {
      path: "/total-degree",
      element: <TotalDeg />
    }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
