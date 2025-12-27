export interface Project {
    id: string;
    name: string;
    creation_date: number;
    deadline: number;
    done: boolean;
}

export interface Objective {
    id: string;
    name: string;
    description: string;
    parentID: string;
}

export interface KeyResult {
    id: string;
    projectID: string;
    description: string;
    startValue: number;
    endValue: number;
}