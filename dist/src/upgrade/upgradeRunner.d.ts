import { Project } from "ts-morph";
export declare function upgradeProjectStringParameters(project: Project): void;
export declare function upgradeProjectJoinOnColumnsToOn(project: Project): void;
export declare function runUpgrade(actions: string[], configFilename?: string): Promise<void>;
