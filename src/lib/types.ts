export interface Project {
    id: string;
    name: string;
    creation_date: Date;
    deadline: Date;
    done: boolean;
}

export interface Objective {
    id: string;
    name: string;
    description: string;
    parent_id: string;
}

export interface KeyResult {
    id: string;
    projectID: string;
    description: string;
    startValue: number;
    endValue: number;
}
