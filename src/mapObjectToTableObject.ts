/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getColumnInformation } from "./decorators";

/**
 * @deprecated use mapPropertiesToColumns
 */
export function mapObjectToTableObject<T>(tableClass: new () => T, input: Partial<T>): {} {
    const output = {} as Record<string, any>;
    for (const key of Object.keys(input)) {
        const columnInformation = getColumnInformation(tableClass, key);
        output[columnInformation.name] = (input as Record<string, any>)[key];
    }
    return output;
}
