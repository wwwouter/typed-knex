import { IsNullable } from './IsNullable';
import { SelectableColumnTypes } from './SelectableColumnTypes';
declare type GetName<T> = T extends {
    name: infer X;
} ? X : never;
declare type GetNullIfNullable<T> = T extends {
    nullable: never;
} ? never : null;
declare type AddToArray<T extends {
    name: string;
}[], A extends any> = ((a: A, ...t: T) => void) extends ((...u: infer U) => void) ? U : never;
export declare type TransformPropertiesToFunction<Model, PropertyPath extends {
    name: any;
    nullable?: true;
}[] = []> = {
    [P in keyof Model]-?: Model[P] extends SelectableColumnTypes | Required<SelectableColumnTypes> ? () => RecordFromArray<AddToArray<PropertyPath, {
        name: P;
    }>, ({} extends {
        [P2 in P]: Model[P];
    } ? NonNullable<Model[P]> | null : Model[P])> : NonNullable<TransformPropertiesToFunction<Model[P], AddToArray<PropertyPath, {
        name: P;
        nullable: IsNullable<Model[P]>;
    }>>>;
};
declare type RecordFromArray<Keys extends {
    name: any;
}[], LeafType> = Keys extends {
    6: any;
} ? Record<GetName<Keys[6]>, Record<GetName<Keys[5]>, Record<GetName<Keys[4]>, Record<GetName<Keys[3]>, GetNullIfNullable<Keys[3]> | Record<GetName<Keys[2]>, GetNullIfNullable<Keys[2]> | Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>>>>>>> : Keys extends {
    5: any;
} ? Record<GetName<Keys[5]>, Record<GetName<Keys[4]>, Record<GetName<Keys[3]>, GetNullIfNullable<Keys[3]> | Record<GetName<Keys[2]>, GetNullIfNullable<Keys[2]> | Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>>>>>> : Keys extends {
    4: any;
} ? Record<GetName<Keys[4]>, Record<GetName<Keys[3]>, GetNullIfNullable<Keys[3]> | Record<GetName<Keys[2]>, GetNullIfNullable<Keys[2]> | Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>>>>> : Keys extends {
    3: any;
} ? Record<GetName<Keys[3]>, GetNullIfNullable<Keys[3]> | Record<GetName<Keys[2]>, GetNullIfNullable<Keys[2]> | Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>>>> : Keys extends {
    2: any;
} ? Record<GetName<Keys[2]>, GetNullIfNullable<Keys[2]> | Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>>> : Keys extends {
    1: any;
} ? Record<GetName<Keys[1]>, GetNullIfNullable<Keys[1]> | Record<GetName<Keys[0]>, LeafType>> : Keys extends {
    0: any;
} ? Record<GetName<Keys[0]>, LeafType> : never;
export {};
