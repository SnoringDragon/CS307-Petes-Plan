export interface BaseRating {
    _id: string,
    course?: {
        _id: string,
        courseID: string,
        subject: string,
        name: string
    },
    instructor: {
        _id: string,
        firstname: string,
        lastname: string,
        nickname: string,
        email: string,
        rateMyProfIds: string[]
    },
    quality: number,
    difficulty: number,
    review: string,
    tags: string[],
    grade: string | null,
    type?: string,
    typeSpecificId?: string | null,
    wouldTakeAgain: boolean | null,
    createdAt: string,
    updatedAt: string
}

export interface RateMyProfRating extends BaseRating {
    isForCredit: boolean,
    isForOnlineClass: boolean,
    isTextbookUsed: boolean | null,
    isAttendanceMandatory: boolean | null
    type: 'ratemyprofessor'
}

export type Rating = BaseRating | RateMyProfRating;

export type RatingSearchResult = {
    data: Rating[],
    metadata: {
        wouldTakeAgain: number | null,
        count: number,
        avgQuality: number,
        avgDifficulty: number,
        courses: {
            _id: string,
            courseID: string,
            subject: string,
            name: string
        }[],
        instructors: {
            _id: string,
            firstname: string,
            lastname: string,
            nickname: string,
            email: string,
            rateMyProfIds: string[]
        }[],
        numQuality: [number, number, number, number, number],
        numDifficulty: [number, number, number, number, number],
        tags: {
            count: number,
            name: string
        }[]
    }
};

type RatingSearchCourse = { courseID: string, subject: string } | { course: string };
type RatingSearchInstructor = { email: string } | { instructor: string };

export type RatingSearch = RatingSearchCourse | RatingSearchInstructor | (RatingSearchCourse & RatingSearchInstructor);
