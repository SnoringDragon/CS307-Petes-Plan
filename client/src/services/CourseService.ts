import { Api } from './Api';

class CourseService extends Api {
    getCourse(options: { courseID: string, subject: string }) {
        return this.get(`/api/courses/?${new URLSearchParams(options)}`);
    }

    getCourseSections(options: { courseID: string, subject: string, semester: string }) {
        return this.get(`/api/courses/sections/?${new URLSearchParams(options)}`);
    }

    searchCourse(query: string) {
        return this.get(`/api/courses/search?q=${encodeURIComponent(query)}`);
    }
}

export default new CourseService();
