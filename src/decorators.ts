import "reflect-metadata";

interface IColumnData {
    name: string;
    /**
     * @deprecated
     */
    primary: boolean;
    propertyKey: string;
    isForeignKey: boolean;
    designType: any;
}

const tables = [] as {
    tableName: string;
    tableClass: Function;
}[];

/**
 * @deprecated use `getTables`.
 */
export function getEntities() {
    return tables;
}

export function getTables() {
    return tables;
}

/**
 * @deprecated use `Table`.
 */
export function Entity(tableName?: string) {
    return (target: Function) => {
        target.prototype.tableMetadataKey = Symbol("table");
        Reflect.metadata(target.prototype.tableMetadataKey, { tableName: tableName ?? target.name })(target);

        tables.push({ tableName: tableName ?? target.name, tableClass: target });
    };
}

export const Table = Entity;

export function getTableMetadata(tableClass: Function): { tableName: string } {
    return Reflect.getMetadata(tableClass.prototype.tableMetadataKey, tableClass);
}

export function getTableName(tableClass: Function): string {
    return getTableMetadata(tableClass).tableName;
}

export function getColumnName<T>(tableClass: new () => T, propertyName: keyof T): string {
    return getColumnInformation(tableClass, propertyName as string).name;
}

const columnMetadataKey = Symbol("column");

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

export function Column(options?: IColumnOptions): (target: object, propertyKey: string) => void {
    return getRegisterColumn(options);
}

function getRegisterColumn(options?: IColumnOptions) {
    function registerColumn(target: any, propertyKey: string): void {
        Reflect.metadata(columnMetadataKey, { isColumn: true })(target);

        const designType = Reflect.getMetadata("design:type", target, propertyKey);
        const isForeignKey = designType ? ["String", "Number", "Boolean"].includes(designType.name) === false : false;

        const columns: IColumnData[] = target.constructor.prototype.tableColumns || [];

        let name = propertyKey;
        // console.log('name: ', name);
        let primary = false;
        // console.log('options: ', options);
        if (options) {
            if (options.name !== undefined) {
                name = options.name;
            }
            primary = options.primary === true;
        }

        columns.push({ name, primary, propertyKey, isForeignKey, designType });
        target.constructor.prototype.tableColumns = columns;
    }

    return registerColumn;
}

export function getColumnInformation(target: Function, propertyKey: string): { columnClass: new () => any } & IColumnData {
    const properties = getColumnProperties(target);

    const property = properties.find((i) => i.propertyKey === propertyKey);
    if (!property) {
        const fkObject = properties.find((p) => p.name === propertyKey);
        if (typeof fkObject?.designType === "function") {
            throw new Error(
                `It seems that class "${target.name}" only has a foreign key object "${fkObject.propertyKey}", but is missing the foreign key property "${propertyKey}". Try adding "@column() ${propertyKey} : [correct type]" to class "${target.name}"`
            );
        }
        throw new Error(`Cannot get column data. Did you set @Column() attribute on ${target.name}.${propertyKey}?`);
    }
    return {
        columnClass: Reflect.getMetadata("design:type", target.prototype, propertyKey),
        name: property.name,
        primary: property.primary,
        propertyKey: property.propertyKey,
        designType: property.designType,
        isForeignKey: property.isForeignKey,
    };
}

export function getColumnProperties(tableClass: Function): IColumnData[] {
    const columns: IColumnData[] = tableClass.prototype.tableColumns;
    if (!columns) {
        throw new Error(`Cannot get column data from ${tableClass.constructor.name}, did you set @Column() attribute?`);
    }
    return columns;
}

/**
 * @deprecated
 */
export function getPrimaryKeyColumn(tableClass: Function): IColumnData {
    const columns: IColumnData[] = tableClass.prototype.tableColumns;
    if (!columns) {
        throw new Error(`Cannot get column data from ${tableClass.constructor.name}, did you set @Column() attribute?`);
    }
    const primaryKeyColumn = columns.find((i) => i.primary);
    if (primaryKeyColumn === undefined) {
        throw new Error(`Cannot get primary key column ${tableClass.constructor.name}, did you set @Column({primary:true}) attribute?`);
    }
    return primaryKeyColumn;
}
