import { Direction, ItemType, Speed } from './const';

type GetEnumType<EnumObject> = EnumObject[keyof EnumObject];

export type PosT = [number, number];

export type ItemTypeT = GetEnumType<typeof ItemType>;

export type SpeedT = GetEnumType<typeof Speed>;

export type DirectionT = GetEnumType<typeof Direction>;
