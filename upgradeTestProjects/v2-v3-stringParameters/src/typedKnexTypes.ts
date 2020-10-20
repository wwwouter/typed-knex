
interface IWhereWithOperator<Model, SelectableModel, Row> {
    <PropertyType>(
        selectColumnFunction: (
            c: any
        ) => () => PropertyType,
        value: PropertyType
    ): ITypedQueryBuilder<Model, SelectableModel, Row>;

    (prop: string, value: any): ITypedQueryBuilder<Model, SelectableModel, Row>;

}


interface ISelectWithFunctionColumns3<Model, SelectableModel, Row> {
    // <PropertyType>(
    //     selectColumnFunction: (
    //         c: any
    //     ) => () => PropertyType,
    // ): ITypedQueryBuilder<Model, SelectableModel, Row>;

    <
        R1,
        R2,
        R3,
        R4,
        R5,
        R6,
        R7,
        R8,
        R9,
        R10,
        R11,
        R12,
        R13,
        R14,
        R15,
        R16,
        R17,
        R18,
        R19,
        R20,
        R21,
        R22,
        R23,
        R24,
        R25,
        R26,
        R27,
        R28,
        R29
        >(
        selectColumnFunction: (
            c: any
        ) => [
                () => R1,
                (() => R2)?,
                (() => R3)?,
                (() => R4)?,
                (() => R5)?,
                (() => R6)?,
                (() => R7)?,
                (() => R8)?,
                (() => R9)?,
                (() => R10)?,
                (() => R12)?,
                (() => R13)?,
                (() => R14)?,
                (() => R15)?,
                (() => R16)?,
                (() => R17)?,
                (() => R18)?,
                (() => R19)?,
                (() => R20)?,
                (() => R22)?,
                (() => R23)?,
                (() => R24)?,
                (() => R25)?,
                (() => R26)?,
                (() => R27)?,
                (() => R28)?,
                (() => R29)?
            ]
    ): ITypedQueryBuilder<
        Model,
        SelectableModel,
        Row &
        R1 &
        R2 &
        R3 &
        R4 &
        R5 &
        R6 &
        R7 &
        R8 &
        R8 &
        R9 &
        R10 &
        R11 &
        R12 &
        R13 &
        R14 &
        R15 &
        R16 &
        R17 &
        R18 &
        R18 &
        R19 &
        R20 &
        R21 &
        R22 &
        R23 &
        R24 &
        R25 &
        R26 &
        R27 &
        R28 &
        R28 &
        R29
    >;


}

interface IJoinOn<_Model, _JoinedModel> {

    <PropertyType1, PropertyType2>(
        selectColumn1Function: (
            c: any
        ) => () => PropertyType1,
        operator: string,
        selectColumn2Function: (
            c: any
        ) => () => PropertyType2
    ): any;
}

interface IJoinOnColumns<_Model, _JoinedModel> {

    <PropertyType1, PropertyType2>(
        selectColumn1Function: (
            c: any
        ) => () => PropertyType1,
        operator: string,
        selectColumn2Function: (
            c: any
        ) => () => PropertyType2
    ): any;


}

interface IWhereCompareTwoColumns<_Model, _SelectableModel, _Row> {

    <PropertyType1>(
        selectColumn1Function: (
            c: any
        ) => () => PropertyType1,
        operator: string,
        parentSelection: any
    ): any;


}

export interface ITypedQueryBuilder<Model, SelectableModel, Row> {
    where: IWhereWithOperator<Model, SelectableModel, Row>;

    select: ISelectWithFunctionColumns3<Model, SelectableModel, Row>;

    joinOn: IJoinOn<Model, SelectableModel>;

    onColumns: IJoinOnColumns<Model, SelectableModel>;


    whereColumn: IWhereCompareTwoColumns<Model, SelectableModel, Row>;

}
