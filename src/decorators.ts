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
    const columnData = Reflect.getMetadata(columnMetadataKey, target, propertyKey);
    if (!columnData) {
        throw new Error(`Cannot get column data from ${target.constructor.name}.${propertyKey}, did you set @column() attribute?`);
    }
    return { columnClass: Reflect.getMetadata('design:type', target, propertyKey) };
}


export function toManyColumn(tableName: string) {
    return Reflect.metadata(columnMetadataKey, { isColumn: true, toMany: true, toManyTableName: tableName });
}
