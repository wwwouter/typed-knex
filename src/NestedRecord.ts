/* eslint-disable @typescript-eslint/ban-types */
export type NestedRecord<Property extends string | number | symbol, Type> = Property extends ""
    ? {}
    : Property extends `${infer PropertyPart1}.${infer PropertyPart2}`
    ? Record<PropertyPart1, NestedRecord<PropertyPart2, Type>>
    : Record<Property, Type>;
