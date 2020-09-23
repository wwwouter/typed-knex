import { getColumnInformation } from "./decorators";

export function mapObjectToTableObject<T>(tableClass: new () => T, input: Partial<T>): {} {

    const output = {} as Record<string, any>;
    for (const key of Object.keys(input)) {

        const columnInformation = getColumnInformation(tableClass, key);
        output[columnInformation.name] = (input as Record<string, any>)[key];

    }
    return output;
}
