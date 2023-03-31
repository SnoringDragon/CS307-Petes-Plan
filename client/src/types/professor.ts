interface AbstractClasses {
    type: string
}

/*
export interface AbstractClassesGroup extends AbstractClasses {
    children: Classes[],
    // if set, this group also requires a certain amount of credits from the courses inside it
    // this requirement must be met alongside the group requirement
    // requiredCredits: number | null
}
*/
//export type Classes = ProfessorRequirement;

export interface ApiProfessor {
    _id: string,
    firstname: string,
    lastname: string,
    email: string,
    //classes: Classes
    rateMyProfIds: string[],
    nickname?: string
}


