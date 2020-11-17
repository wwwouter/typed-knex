import { ICustomDatabaseType } from '../src/ICustomDatabaseType';
export declare class Region {
    id: string;
    code: number;
}
export declare class UserCategory {
    id: string;
    name: string;
    region: Region;
    regionId: string;
    year: number;
    phoneNumber?: string;
    backupRegion?: Region;
}
declare class IExtraData extends ICustomDatabaseType {
}
export declare class User {
    id: string;
    name: string;
    numericValue: number;
    someValue: string;
    category: UserCategory;
    categoryId: string;
    category2: UserCategory;
    nickName?: string;
    birthDate: Date;
    deathDate: Date | null;
    tags?: string[];
    status?: string;
    notUndefinedStatus: string;
    optionalCategory?: UserCategory;
    nullableCategory: UserCategory | null;
    someOptionalValue?: string;
    someNullableValue: string | null;
    extraData: IExtraData;
}
export declare class UserSetting {
    id: string;
    user: User;
    userId: string;
    user2: User;
    user2Id: string;
    key: string;
    value: string;
    initialValue: string;
}
export declare class correctTableName {
    id: string;
    code: number;
}
export {};
