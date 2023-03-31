import { Api } from './Api';
import { UserCourse } from '../types/user-course';
import { DegreePlan } from '../types/degree-plan';

class DegreePlanService extends Api {
    getPlans() {
        return this.get<{ degreePlans: DegreePlan[] }>('/api/degreePlan');
    }

    createDegreePlan(name: string) {
        return this.post<{ degreePlan: DegreePlan }>('/api/degreePlan/create', { name });
    }

    addToDegreePlan(plan: string, degrees: { _id: string }[], courses: Omit<UserCourse, '_id'>[]) {
        return this.post<{ degreePlan: DegreePlan }>(`/api/degreePlan/${plan}/add`, { degrees, courses });
    }

    removeFromDegreePlan(plan: string, degrees: string[], courses: string[]) {
        return this.delete<{ degreePlan: DegreePlan }>(`/api/degreePlan/${plan}/remove`, { degrees, courses });
    }

    getOverlap(plan: string, degree: string ) {
        return this.get<{reqs: {courseID: string, subject: string}[]}>(`/api/degreePlan/${plan}/gradReqsIntersect/${degree}`);
    }

    getTotalReqs(plan: string) {
        return this.get<{reqs: {courseID: string, subject: string}[]}>(`/api/degreePlan/${plan}/gradReqs`);
    }
}

export default new DegreePlanService();
