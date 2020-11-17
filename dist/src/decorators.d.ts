import 'reflect-metadata';
interface IColumnData {
    name: string;
    primary: boolean;
    propertyKey: string;
    isForeignKey: boolean;
    designType: any;
}
export declare function getEntities(): {
    tableName: string;
    entityClass: Function;
}[];
export declare function Entity(tableName?: string): (target: Function) => void;
export declare const Table: typeof Entity;
export declare function getTableMetadata(tableClass: Function): {
    tableName: string;
};
export declare function getTableName(tableClass: Function): string;
export declare function getColumnName<T>(tableClass: new () => T, propertyName: keyof T): string;
interface IColumnOptions {
    /**
     * Column name in the database.
     */
    name?: string;
    /**
     * Indicates if this column is a primary key.
     */
    primary?: boolean;
}
export declare function Column(options?: IColumnOptions): (target: object, propertyKey: string) => void;
export declare function getColumnInformation(target: Function, propertyKey: string): {
    columnClass: new () => any;
} & IColumnData;
export declare function getColumnProperties(tableClass: Function): IColumnData[];
export declare function getPrimaryKeyColumn(tableClass: Function): IColumnData;
export {};
