import { getColumnProperties } from "./decorators";


export function concatKeyToColumnName<T>(concatKey: string, tableClass: new () => T) {
    const concatKeyParts = concatKey.split(',');

    const columns = getColumnProperties(tableClass);

    if (concatKeyParts.length === 1) {
        const column = columns.find(({ propertyKey }) => propertyKey === concatKeyParts[0]);
        if (!column) {
            throw new Error(`${concatKeyParts[0]} is not part of table ${tableClass.name}`);
        }
        return column.name;
    }

    throw new Error("Too many parts for concatKeyToColumnName");


}