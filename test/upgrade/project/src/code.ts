interface ITest<T> {
    name: T;
}

export const t: ITest<string> = {
    name: '1'
};



interface IWhereWithOperator<Model, SelectableModel, Row> {
    <PropertyType>(
        selectColumnFunction: (
            c: any
        ) => () => PropertyType,
        value: PropertyType
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;

    (prop: string, value: any): ITypedQueryBuilder<Model, SelectableModel, Row>;

}


interface ITypedQueryBuilder<Model, SelectableModel, Row> {
    where: IWhereWithOperator<Model, SelectableModel, Row>;
}


const a = {} as ITypedQueryBuilder<{}, {}, {}>;

a.where(i => i.name, 'this name1');

export function doSomething() {
    a.where(i => i.id, 'this id1');
}
