export type ApiAPTest = {
    name: string,
    credits: {
        score: 1 | 2 | 3 | 4 | 5,
        courses: {
            courseID: string,
            subject: string
        }[]
    }[]
};