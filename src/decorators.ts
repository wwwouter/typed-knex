import 'reflect-metadata';

const tableyMetadataKey = Symbol('table');

export function table(tableName: string) {
    return Reflect.metadata(tableyMetadataKey, { tableName: tableName });
}

export function getTableMetadata(tableClass: Function): { tableName: string } {
    return Reflect.getMetadata(tableyMetadataKey, tableClass);
}



const columnMetadataKey = Symbol('column');

export function column() {
    return Reflect.metadata(columnMetadataKey, { isColumn: true });
}

export function getColumn(target: any, propertyKey: string): { columnClass: new () => any } {
    return { columnClass: Reflect.getMetadata('design:type', target, propertyKey), ...Reflect.getMetadata(columnMetadataKey, target, propertyKey) };
}
