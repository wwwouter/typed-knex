import { Column, Entity } from '../src/decorators';


@Entity('regions')
export class Region {
    @Column({ primary: true })
    public id!: string;
    @Column()
    public code: number;
}

@Entity('userCategories')
export class UserCategory {
    @Column({ primary: true })
    public id!: string;
    @Column()
    public name!: string;
    @Column()
    public region!: Region;
    @Column()
    public regionId!: string;
    @Column()
    public year!: number;
}


@Entity('users')
export class User {
    @Column({ primary: true })
    public id!: string;
    @Column()
    public name!: string;
    @Column()
    public numericValue: number;
    @Column()
    public someValue!: string;
    @Column()
    public category!: UserCategory;
    @Column()
    public categoryId!: string;
    @Column()
    public category2!: UserCategory;

}


@Entity('userSettings')
export class UserSetting {
    @Column({ primary: true })
    public id!: string;
    @Column()
    public user!: User;
    @Column()
    public userId!: string;
    @Column()
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
