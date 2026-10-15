// The 12 dinosaur companions. require() calls must be static so Metro can
// bundle the images. Names are used as labels in the Settings picker.

import { ImageSourcePropType } from 'react-native';

export type MascotId =
  | 'dino-01'
  | 'dino-02'
  | 'dino-03'
  | 'dino-04'
  | 'dino-05'
  | 'dino-06'
  | 'dino-07'
  | 'dino-08'
  | 'dino-09'
  | 'dino-10'
  | 'dino-11'
  | 'dino-12';

export type MascotChoice = MascotId | 'none';

export const DEFAULT_MASCOT: MascotChoice = 'dino-01';

export const MASCOTS: { id: MascotId; name: string; image: ImageSourcePropType }[] = [
  { id: 'dino-01', name: 'Scooter ride', image: require('@/assets/mascots/dino-01.png') },
  { id: 'dino-02', name: 'Sleepy', image: require('@/assets/mascots/dino-02.png') },
  { id: 'dino-03', name: 'Basketball', image: require('@/assets/mascots/dino-03.png') },
  { id: 'dino-04', name: 'Scooter cruise', image: require('@/assets/mascots/dino-04.png') },
  { id: 'dino-05', name: 'Bath time', image: require('@/assets/mascots/dino-05.png') },
  { id: 'dino-06', name: 'Beach day', image: require('@/assets/mascots/dino-06.png') },
  { id: 'dino-07', name: 'Splashing', image: require('@/assets/mascots/dino-07.png') },
  { id: 'dino-08', name: 'Boba tea', image: require('@/assets/mascots/dino-08.png') },
  { id: 'dino-09', name: 'Swimming', image: require('@/assets/mascots/dino-09.png') },
  { id: 'dino-10', name: 'Happy splash', image: require('@/assets/mascots/dino-10.png') },
  { id: 'dino-11', name: 'Picnic', image: require('@/assets/mascots/dino-11.png') },
  { id: 'dino-12', name: 'Heart hug', image: require('@/assets/mascots/dino-12.png') },
];

export function isMascotChoice(value: unknown): value is MascotChoice {
  return value === 'none' || MASCOTS.some((mascot) => mascot.id === value);
}

export function findMascot(choice: MascotChoice) {
  return MASCOTS.find((mascot) => mascot.id === choice);
}
