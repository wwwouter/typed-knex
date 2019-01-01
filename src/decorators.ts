import 'reflect-metadata';

const tableyMetadataKey = Symbol('table');

interface IColumnData {
    name: string;
    primary: boolean;
}
const tableColumns = new Map<Function, IColumnData[]>();



export function Entity(tableName: string) {
    return Reflect.metadata(tableyMetadataKey, { tableName: tableName });
}

export function getTableMetadata(tableClass: Function): { tableName: string } {
    return Reflect.getMetadata(tableyMetadataKey, tableClass);
}

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
        let primary = false;
        if (options) {
            if (options.name !== undefined) {
                name = options.name;
            }
            primary = options.primary === true;
        }

        columns.push({ name, primary });
        tableColumns.set(target.constructor, columns);
    }

    return registerColumn;
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
