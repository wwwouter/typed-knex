import { IsNullable } from './IsNullable';
import { NonForeignKeyObjects } from './NonForeignKeyObjects';
// take { a : string, b : { c : string }} and return { a : ()=> {a: string}, b : { c : ()=> { b: { c: string } }}}
// Special cases:
//   { a: User, b : string[] } returns { a: () => User, b : () => { b: string[] } }
//   { a?: string[]  } returns { a : () => (null|string[]) }
//   { a: User | null } returns { a : () => User }
// PropertyPath contains the path to one leaf. {a : { b: string }} will have a PropertyPath of ['b', 'a']
export type TransformPropertiesToFunction<Model, PropertyPath extends {
    name: any;
    nullable?: true;
}[] = []> = {
        [P in keyof Model]-?:
        // if it's an object
        Model[P] extends (object | undefined | null) ?
        // and if it isn't a foreign key
        Model[P] extends (NonForeignKeyObjects | undefined) ?
        // create leaf with this type
        () => RecordFromArray<AddToArray<PropertyPath, {
            name: P;
        }>, ({} extends {
            [P2 in P]: Model[P];
        } ? NonNullable<Model[P]> | null : Model[P])> :
        // if it is a foreign key, transform it's properties
        // TransformPropertiesToFunction<Model[P], AddToArray<Result, P>>
        // null extends Model ? TransformPropertiesToFunction<Model[P], AddToArray<PropertyPath, { name: P, nullable: true }>>
        // : TransformPropertiesToFunction<Model[P], AddToArray<PropertyPath, { name: P }>>
        NonNullable<TransformPropertiesToFunction<Model[P], AddToArray<PropertyPath, {
            name: P;
            nullable: IsNullable<Model[P]>;
        }>>> :
        // if it isn't an object, create leaf with this type
        () => RecordFromArray<AddToArray<PropertyPath, {
            name: P;
        }>, ({} extends {
            [P2 in P]: Model[P];
        } ? NonNullable<Model[P]> | null : Model[P])>;
    };

// Creates a type from an array of strings (in reversed order)
// input ['c','b','a'] and string returns { a : { b:  { c : string }}}
type RecordFromArray<Keys extends { name: any }[], LeafType> =
    // Keys extends { 6: any } ? Record<Keys[6], Record<Keys[5], Record<Keys[4], Record<Keys[3], Record<Keys[2], Record<Keys[1], Record<Keys[0], LeafType>>>>>>> :
    // Keys extends { 5: any } ? Record<Keys[5], Record<Keys[4], Record<Keys[3], Record<Keys[2], Record<Keys[1], Record<Keys[0], LeafType>>>>>> :
    // Keys extends { 4: any } ? Record<Keys[4], Record<Keys[3], Record<Keys[2], Record<Keys[1], Record<Keys[0], LeafType>>>>> :
    // Keys extends { 3: any } ? Record<Keys[3], Record<Keys[2], Record<Keys[1], Record<Keys[0], LeafType>>>> :
    // Keys extends { 2: any } ? Record<Keys[2], Record<Keys[1], Record<Keys[0], LeafType>>> :
    Keys extends { 1: any } ? Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>> :
    Keys extends { 0: any } ? Record<GetName<Keys[0]>, LeafType> :
    never;

type GetName<T> = T extends { name: infer X } ? X : never;
type GetNullIfNullable<T> = T extends { nullable: never } ? never : null;
const a = {} as any as { a: string } | never;


console.log('a?.a: ', a.a);
console.log('a?.a: ', a?.a);

const b = {} as any as IsNullable<{}>;
console.log('b: ', b);


const c = {} as any as GetNullIfNullable<{ nullable: never }>;
console.log('c: ', c);


const c2 = {} as any as GetNullIfNullable<{ nullable: true }>;
console.log('c2: ', c2);

type AddToArray<T extends { name: string }[], A extends any> = ((a: A, ...t: T) => void) extends ((...u: infer U) => void) ? U : never;


