type GetLevel4Property<Model, Key1 extends string, Key2 extends string, Key3 extends string, Key4 extends string> = Key1 extends keyof Model
    ? Key2 extends keyof Model[Key1]
        ? Key3 extends keyof Model[Key1][Key2]
            ? Key4 extends keyof Model[Key1][Key2][Key3]
                ? {
                      [K in Key1]: { [K2 in Key2]: { [K3 in Key3]: { [K4 in Key4]: Model[Key1][Key2][Key3][Key4] } } };
                  }
                : never
            : never
        : never
    : never;

type GetLevel3Property<Model, Key1 extends string, Key2 extends string, Key3 extends string> = Key1 extends keyof Model
    ? Key2 extends keyof Model[Key1]
        ? Key3 extends keyof Model[Key1][Key2]
            ? {
                  [K in Key1]: { [K2 in Key2]: { [K3 in Key3]: Model[Key1][Key2][Key3] } };
              }
            : never
        : never
    : never;

type GetLevel2Property<Model, Key1 extends string, Key2 extends string> = Key1 extends keyof Model
    ? Key2 extends keyof Model[Key1]
        ? {
              [K in Key1]: { [K2 in Key2]: Model[Key1][Key2] };
          }
        : never
    : never;

type GetLevel1Property<Model, Key1 extends string> = Key1 extends keyof Model
    ? {
          [K in Key1]: Model[Key1];
      }
    : never;

export type GetNestedProperty<Model, T extends string> = T extends ""
    ? {}
    : T extends `${infer Level4Part1}.${infer Level4Part2}.${infer Level4Part3}.${infer Level4Part4}`
    ? GetLevel4Property<Model, Level4Part1, Level4Part2, Level4Part3, Level4Part4>
    : T extends `${infer Level3Part1}.${infer Level3Part2}.${infer Level3Part3}`
    ? GetLevel3Property<Model, Level3Part1, Level3Part2, Level3Part3>
    : T extends `${infer Level2Part1}.${infer Level2Part2}`
    ? GetLevel2Property<Model, Level2Part1, Level2Part2>
    : GetLevel1Property<Model, T>;

type GetLevel4PropertyType<Model, Key1 extends string, Key2 extends string, Key3 extends string, Key4 extends string> = Key1 extends keyof Model
    ? Key2 extends keyof Model[Key1]
        ? Key3 extends keyof Model[Key1][Key2]
            ? Key4 extends keyof Model[Key1][Key2][Key3]
                ? Model[Key1][Key2][Key3][Key4]
                : never
            : never
        : never
    : never;

type GetLevel3PropertyType<Model, Key1 extends string, Key2 extends string, Key3 extends string> = Key1 extends keyof Model
    ? Key2 extends keyof Model[Key1]
        ? Key3 extends keyof Model[Key1][Key2]
            ? Model[Key1][Key2][Key3]
            : never
        : never
    : never;

type GetLevel2PropertyType<Model, Key1 extends string, Key2 extends string> = Key1 extends keyof Model ? (Key2 extends keyof Model[Key1] ? Model[Key1][Key2] : never) : never;

type GetLevel1PropertyType<Model, Key1 extends string> = Key1 extends keyof Model ? Model[Key1] : never;

export type GetNestedPropertyType<Model, T extends string> = T extends ""
    ? {}
    : T extends `${infer Level4Part1}.${infer Level4Part2}.${infer Level4Part3}.${infer Level4Part4}`
    ? GetLevel4PropertyType<Model, Level4Part1, Level4Part2, Level4Part3, Level4Part4>
    : T extends `${infer Level3Part1}.${infer Level3Part2}.${infer Level3Part3}`
    ? GetLevel3PropertyType<Model, Level3Part1, Level3Part2, Level3Part3>
    : T extends `${infer Level2Part1}.${infer Level2Part2}`
    ? GetLevel2PropertyType<Model, Level2Part1, Level2Part2>
    : GetLevel1PropertyType<Model, T>;
