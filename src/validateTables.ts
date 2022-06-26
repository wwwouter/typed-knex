import { Knex } from "knex";
import { getColumnProperties, getTables } from "./decorators";

export async function validateTables(knex: Knex, tableNamesToValidate?: string[]) {
    let tables = getTables();

    if (tableNamesToValidate) {
        tables = tables.filter((table) => tableNamesToValidate.includes(table.tableName));
    }

    for (const table of tables) {
        const doesTableExists = await knex.schema.hasTable(table.tableName);

        if (doesTableExists === false) {
            throw new Error(`Table "${table.tableName}" of class "${table.tableClass.name}" does not exist in database.`);
        }

        const columns = getColumnProperties(table.tableClass);

        for (const column of columns) {
            if (column.isForeignKey) {
                continue;
            }

            const doesColumnExists = await knex.schema.hasColumn(table.tableName, column.name);

            if (doesColumnExists === false) {
                throw new Error(`Column "${column.name}" of table "${table.tableName}" of class "${table.tableClass.name}" does not exist in database.`);
            }
        }
    }
}
/**
 * @deprecated use `validateTables`.
 */
export const validateEntities = validateTables;
