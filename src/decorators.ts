import 'reflect-metadata';

const tableyMetadataKey = Symbol('table');

interface IColumnData {
    name: string;
    primary: boolean;
    propertyKey: string;
}
const tableColumns = new Map<Function, IColumnData[]>();

const entities = [] as {
    tableName: string;
    entityClass: Function;
}[];

// export function Entity2(tableName: string) {

//     return ((target: Function) => {
//         console.log('target: ', target);
//         return Reflect.metadata(tableyMetadataKey, { tableName: tableName });
//     })(arguments);


// }

export function getEntities() {
    return entities;
}

export function Entity(tableName: string) {

    return ((target: Function) => {
        Reflect.metadata(tableyMetadataKey, { tableName: tableName })(target);

        entities.push({ tableName: tableName, entityClass: target });
    });
}


export function getTableMetadata(tableClass: Function): { tableName: string } {
    return Reflect.getMetadata(tableyMetadataKey, tableClass);
}


// function registerEntity(target: any, propertyKey: string): void {

//     Reflect.metadata(columnMetadataKey, { isColumn: true })(target);

//     const columns = tableColumns.get(target.constructor) || [];

//     let name = propertyKey;
//     // console.log('name: ', name);
//     let primary = false;
//     // console.log('options: ', options);
//     if (options) {
//         if (options.name !== undefined) {
//             name = options.name;
//         }
//         primary = options.primary === true;
//     }

//     columns.push({ name, primary, propertyKey });
//     tableColumns.set(target.constructor, columns);
// }



const columnMetadataKey = Symbol('column');

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

        const columns = tableColumns.get(target.constructor) || [];

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

        columns.push({ name, primary, propertyKey });
        tableColumns.set(target.constructor, columns);
    }

    return registerColumn;
}



export function getColumnInformation(target: Function, propertyKey: string): { columnClass: new () => any } & IColumnData {
    // console.log('target: ', target);
    // console.log('target: ', target.name);
    const properties = getColumnProperties(target);

    const property = properties.find(i => i.propertyKey === propertyKey);
    // console.log('properties: ', properties);
    // console.log('propertyKey: ', propertyKey);
    // console.log('property: ', property);
    // const columnData = Reflect.getMetadata(columnMetadataKey, target, propertyKey);
    // console.log('columnData: ', columnData);
    if (!property) {
        throw new Error(`Cannot get column data. Did you set @Column() attribute on ${target.name}.${propertyKey}?`);
    }
    return { columnClass: Reflect.getMetadata('design:type', target.prototype, propertyKey), name: property.name, primary: property.primary, propertyKey: property.propertyKey };
}

export function getColumnProperties(tableClass: Function): IColumnData[] {
    const columns = tableColumns.get(tableClass);
    if (!columns) {
        throw new Error(`Cannot get column data from ${tableClass.constructor.name}, did you set @Column() attribute?`);
    }
    return columns;
}


export function getPrimaryKeyColumn(tableClass: Function): IColumnData {
    // console.log('tableClass: ', tableClass);
    const columns = tableColumns.get(tableClass);
    if (!columns) {
        throw new Error(`Cannot get column data from ${tableClass.constructor.name}, did you set @Column() attribute?`);
    }
    const primaryKeyColumn = columns.find(i => i.primary);
    if (primaryKeyColumn === undefined) {
        throw new Error(`Cannot get primary key column ${tableClass.constructor.name}, did you set @Column({primary:true}) attribute?`);

    }
    return primaryKeyColumn;
}
