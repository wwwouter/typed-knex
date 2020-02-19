import { IsNullable } from './IsNullable';
import { NonForeignKeyObjects } from './NonForeignKeyObjects';

// Gets the name of the property
type GetName<T> = T extends { name: infer X } ? X : never;
type GetNullIfNullable<T> = T extends { nullable: never } ? never : null;
// Add an object to an already existing array
type AddToArray<T extends { name: string }[], A extends any> = ((a: A, ...t: T) => void) extends ((...u: infer U) => void) ? U : never;



// Take { a : string, b : { c : string }} and return { a : ()=> {a: string}, b : { c : ()=> { b: { c: string } }}}
// PropertyPath contains the path to one leaf. {a : { b: string }} will have a PropertyPath of [{name:'b'}, {name:'a'}]
// Special cases:
//   { a: User, b : string[] } returns { a: () => User, b : () => { b: string[] } }
//   { a?: string[]  } returns { a : () => (string[] | null) }
//   { a: (User | null) } returns { a : () => User } (because you want to navigate the foreign keys when SELECT-ing)
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
// input [{ name: 'c'} ,{name: 'b'},{ name:'a'}] and string returns { a : { b:  { c : string }}}
type RecordFromArray<Keys extends { name: any }[], LeafType> =
    Keys extends { 6: any } ? Record<GetName<Keys[6]>, Record<GetName<Keys[5]>, Record<GetName<Keys[4]>, Record<GetName<Keys[3]>, GetNullIfNullable<Keys[3]> | Record<GetName<Keys[2]>, GetNullIfNullable<Keys[2]> | Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>>>>>>> :
    Keys extends { 5: any } ? Record<GetName<Keys[5]>, Record<GetName<Keys[4]>, Record<GetName<Keys[3]>, GetNullIfNullable<Keys[3]> | Record<GetName<Keys[2]>, GetNullIfNullable<Keys[2]> | Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>>>>>> :
    Keys extends { 4: any } ? Record<GetName<Keys[4]>, Record<GetName<Keys[3]>, GetNullIfNullable<Keys[3]> | Record<GetName<Keys[2]>, GetNullIfNullable<Keys[2]> | Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>>>>> :
    Keys extends { 3: any } ? Record<GetName<Keys[3]>, GetNullIfNullable<Keys[3]> | Record<GetName<Keys[2]>, GetNullIfNullable<Keys[2]> | Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>>>> :
    Keys extends { 2: any } ? Record<GetName<Keys[2]>, GetNullIfNullable<Keys[2]> | Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>>> :
    Keys extends { 1: any } ? Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>> :
    Keys extends { 0: any } ? Record<GetName<Keys[0]>, LeafType> :
    never;
