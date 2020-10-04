
interface IWhereWithOperator<Model, SelectableModel, Row> {
    <PropertyType>(
        selectColumnFunction: (
            c: any
        ) => () => PropertyType,
        value: PropertyType
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;

    (prop: string, value: any): ITypedQueryBuilder<Model, SelectableModel, Row>;

}


export interface ITypedQueryBuilder<Model, SelectableModel, Row> {
    where: IWhereWithOperator<Model, SelectableModel, Row>;
}
