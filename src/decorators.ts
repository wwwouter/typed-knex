import 'reflect-metadata';

const entityMetadataKey = Symbol('entity');

export function entity(tableName: string) {
    return Reflect.metadata(entityMetadataKey, { tableName: tableName });
    // return (tableClass: Function) => {
    //     tableClass.prototype.typedKnex = { tableName: tableName };
    // };
}

export function getEntityMetadata(tableClass: Function): { tableName: string } {
    return Reflect.getMetadata(entityMetadataKey, tableClass);
}
