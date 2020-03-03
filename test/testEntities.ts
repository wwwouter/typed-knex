import { Column, Table } from '../src/decorators';

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
    public birthDate?: Date;
    @Column()
    public tags?: string[];
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
}
