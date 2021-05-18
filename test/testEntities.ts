import { Column, Table } from '../src/decorators';
import { ICustomDatabaseType } from '../src/ICustomDatabaseType';

@Table('regions')
export class Region {
    @Column({ primary: true })
    public id!: string;
    @Column()
    public code: number;
}

@Table('userCategories')
export class UserCategory {
    @Column({ primary: true })
    public id!: string;
    @Column()
    public name!: string;
    @Column({ name: 'regionId' })
    public region!: Region;
    @Column()
    public regionId!: string;
    @Column()
    public year!: number;
    @Column()
    public phoneNumber?: string;
    @Column({ name: 'backupRegionId' })
    public backupRegion?: Region;
    @Column({ name: 'INTERNAL_NAME' })
    public specialRegionId!: string;
}

// tslint:disable-next-line: no-empty-interfaces
class IExtraData extends ICustomDatabaseType {

}

@Table('users')
export class User {
    @Column({ primary: true })
    public id!: string;
    @Column()
    public name!: string;
    @Column()
    public numericValue: number;
    @Column()
    public someValue!: string;
    @Column({ name: 'categoryId' })
    public category!: UserCategory;
    @Column()
    public categoryId!: string;
    @Column({ name: 'category2Id' })
    public category2!: UserCategory;
    @Column()
    public nickName?: string;
    @Column()
    public birthDate: Date;
    @Column()
    public deathDate: Date | null;
    @Column()
    public tags?: string[];
    @Column({ name: 'weirdDatabaseName' })
    public status?: string;
    @Column({ name: 'weirdDatabaseName2' })
    public notUndefinedStatus: string;
    @Column({ name: 'optionalCategoryId' })
    public optionalCategory?: UserCategory;
    @Column({ name: 'nullableCategoryId' })
    public nullableCategory: UserCategory | null;
    @Column()
    public someOptionalValue?: string;
    @Column()
    public someNullableValue: string | null;
    @Column()
    public extraData!: IExtraData;
}

@Table('userSettings')
export class UserSetting {
    @Column({ primary: true })
    public id!: string;
    @Column({ name: 'userId' })
    public user!: User;
    @Column()
    public userId!: string;
    @Column({ name: 'user2Id' })
    public user2!: User;
    @Column()
    public user2Id!: string;
    @Column()
    public key!: string;
    @Column()
    public value!: string;
    @Column()
    public initialValue!: string;
    @Column({ name: 'other_value' })
    public otherValue!: string;
}


@Table()
// tslint:disable-next-line: class-name
export class correctTableName {
    @Column({ primary: true })
    public id!: string;
    @Column()
    public code: number;
}
