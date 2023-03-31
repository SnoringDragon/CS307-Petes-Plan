import { Api } from './Api';
import {Section} from "../types/course-requirements";

class CourseService extends Api {
    getCourse(options: { courseID: string, subject: string } | { course: string }) {
        return this.get(`/api/courses/?${new URLSearchParams(options)}`);
    }

    /**
     * Get sections
     * @param options
     * @return section outer array is group to choose one, next group is grouped by section type,
     *  inner group is list of section types to choose one. Example: [
     *      [
     *          [lecture 1, lecture 2],
     *          [recitation 1, recitation 2]
     *      ],
     *      [
     *          [lecture 3, lecture 4],
     *          [recitation 3, recitation 4]
     *      ]
     *  ]
     *  A valid choice could be lecture 1 + recitation 1. another valid choice could be lecture 3 + recitation 4
     */
    getCourseSections(options: { courseID: string, subject: string, semester: string } | { course: string, semester: string }) {
        return this.get<Section[][][]>(`/api/courses/sections/?${new URLSearchParams(options)}`);
    }

    searchCourse(query: string) {
        return this.get(`/api/courses/search?q=${encodeURIComponent(query)}`);
    }
}

export default new CourseService();
