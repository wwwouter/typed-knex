import 'reflect-metadata';

const tableyMetadataKey = Symbol('table');

interface IColumnData {
    name: string;
}
const tableColumns = new Map<Function, IColumnData[]>();


export function table(tableName: string) {
    return Reflect.metadata(tableyMetadataKey, { tableName: tableName });
}

export function getTableMetadata(tableClass: Function): { tableName: string } {
    return Reflect.getMetadata(tableyMetadataKey, tableClass);
}

const columnMetadataKey = Symbol('column');

export function column(): (target: object, propertyKey: string) => void {
    return registerColumn;
}



function registerColumn(target: any, propertyKey: string): void {
    Reflect.metadata(columnMetadataKey, { isColumn: true })(target);

    const columns = tableColumns.get(target.constructor) || [];
    columns.push({ name: propertyKey });
    tableColumns.set(target.constructor, columns);
}

export function getColumnInformation(target: Function, propertyKey: string): { columnClass: new () => any } {
    // console.log('target: ', target);
    const properties = getColumnProperties(target);

    const property = properties.find(i => i.name === propertyKey);
    // console.log('properties: ', properties);
    // const columnData = Reflect.getMetadata(columnMetadataKey, target, propertyKey);
    // console.log('columnData: ', columnData);
    if (!property) {
        throw new Error(`Cannot get column data from ${target.constructor.name}.${propertyKey}, did you set @column() attribute?`);
    }
    return { columnClass: Reflect.getMetadata('design:type', target.prototype, propertyKey) };
}

export function getColumnProperties(tableClass: Function): { name: string }[] {
    const columns = tableColumns.get(tableClass);
    if (!columns) {
        throw new Error(`Cannot get column data from ${tableClass.constructor.name}, did you set @column() attribute?`);
    }
    return columns;
}
