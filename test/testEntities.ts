import { column, table } from '../src/decorators';


@table('regions')
export class Region {
    public id!: string;
    public code: number;
}

@table('userCategories')
export class UserCategory {
    public id!: string;
    public name!: string;
    @column()
    public region!: Region;
    public regionId!: string;
    public year!: number;
}


@table('users')
export class User {
    public id!: string;
    public name!: string;
    public someValue!: string;
    @column()
    public category!: UserCategory;
    public categoryId!: string;
    @column()
    public category2!: UserCategory;

}



@table('userSettings')
export class UserSetting {
    @column()
    public id!: string;
    @column()
    public user!: User;
    public userId!: string;
    @column()
    public user2!: User;
    public user2Id!: string;
    public key!: string;
    public value!: string;
    public initialValue!: string;
}
