import { Column, Entity } from '../src/decorators';


@Entity('regions')
export class Region {
    public id!: string;
    public code: number;
}

@Entity('userCategories')
export class UserCategory {
    public id!: string;
    public name!: string;
    @Column()
    public region!: Region;
    public regionId!: string;
    public year!: number;
}


@Entity('users')
export class User {
    public id!: string;
    public name!: string;
    public numericValue: number;
    public someValue!: string;
    @Column()
    public category!: UserCategory;
    public categoryId!: string;
    @Column()
    public category2!: UserCategory;

}



@Entity('userSettings')
export class UserSetting {
    @Column()
    public id!: string;
    @Column()
    public user!: User;
    public userId!: string;
    @Column()
    public user2!: User;
    public user2Id!: string;
    public key!: string;
    public value!: string;
    public initialValue!: string;
}
