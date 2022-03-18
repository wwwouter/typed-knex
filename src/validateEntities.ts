import { Knex } from "knex";
import { getColumnProperties, getEntities } from "./decorators";

export async function validateEntities(knex: Knex) {
    const entities = getEntities();

    for (const entity of entities) {
        const doesTableExists = await knex.schema.hasTable(entity.tableName);

        if (doesTableExists === false) {
            throw new Error(`Table "${entity.tableName}" of class "${entity.entityClass.name}" does not exist in database.`);
        }

        const columns = getColumnProperties(entity.entityClass);

        for (const column of columns) {
            if (column.isForeignKey) {
                continue;
            }

            const doesColumnExists = await knex.schema.hasColumn(entity.tableName, column.name);

            if (doesColumnExists === false) {
                throw new Error(`Column "${column.name}" of table "${entity.tableName}" of class "${entity.entityClass.name}" does not exist in database.`);
            }
        }
    }
}

export const validateTables = validateEntities;
