import { ImageURISource } from 'react-native';

export interface IPill {
  id: number;
  image: ImageURISource;
  title: string;
  type: EPillType;
}

export enum EPillType {
  Common,
  Capsule,
  Pill,
  Tablet,
}

export const pillTypeNames = new Map<EPillType, string>();

pillTypeNames.set(EPillType.Common, 'PILL_TYPES.COMMON');
pillTypeNames.set(EPillType.Capsule, 'PILL_TYPES.CAPSULE');
pillTypeNames.set(EPillType.Pill, 'PILL_TYPES.PILL');
pillTypeNames.set(EPillType.Tablet, 'PILL_TYPES.TABLET');

export const PILLS: IPill[] = [
  {
    id: 1,
    image: require(`../assets/pills/1.png`),
    title: 'PILL_NAMES.VITAMIN',
    type: EPillType.Capsule,
  },
  {
    id: 2,
    image: require(`../assets/pills/2.png`),
    title: 'PILL_NAMES.COLOUR_PILL',
    type: EPillType.Pill,
  },
  {
    id: 3,
    image: require(`../assets/pills/3.png`),
    title: 'PILL_NAMES.ELLIPSE_PILL',
    type: EPillType.Tablet,
  },
  {
    id: 4,
    image: require(`../assets/pills/4.png`),
    title: 'PILL_NAMES.ROUND_TABLET',
    type: EPillType.Tablet,
  },
  {
    id: 5,
    image: require(`../assets/pills/5.png`),
    title: 'PILL_NAMES.ROUNDED_TABLET',
    type: EPillType.Pill,
  },
];

export const PILLS_MAP = new Map<number, IPill>();

PILLS.forEach(pill => {
  PILLS_MAP.set(pill.id, pill);
});
