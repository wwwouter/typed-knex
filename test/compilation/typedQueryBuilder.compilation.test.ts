/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Equal, Expect, NotAny } from "@type-challenges/utils";
import knex from "knex";
import { TypedKnex } from "../../src";
import { User, UserSetting } from "../testTables";

export async function leftOuterJoinTableOnFunction() {
    const typedKnex = new TypedKnex(knex({ client: "postgresql" }));

    const item = await typedKnex
        .query(UserSetting)
        .leftOuterJoinTableOnFunction("otherUser", User, (join) => {
            join.on("id", "=", "user2Id");
        })
        .select("otherUser.name", "user2.numericValue")
        .getSingle();

    // eslint-disable-next-line no-unused-vars
    type checks = [Expect<NotAny<typeof item>>, Expect<Equal<typeof item, { otherUser: { name: string } } & { user2: { numericValue: number } }>>];
}

export async function select() {
    const typedKnex = new TypedKnex(knex({ client: "postgresql" }));

    await typedKnex.query(UserSetting).select("id").getSingle();

    // @ts-expect-error - should fail
    await typedKnex.query(UserSetting).select("id", "unknown").getSingle();
}
