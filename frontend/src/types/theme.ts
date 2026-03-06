export type HeaderColor =
  | 'dark_gray'
  | 'dark_blue'
  | 'light_green'
  | 'pink'
  | 'turquoise'
  | 'brown'
  | 'light_yellow';

export const HEADERCOLOR_OPTIONS: { label: string; value: HeaderColor; colorVar: string }[] = [
  { label: 'Dark', value: 'dark_gray', colorVar: '#3f3f3f' },
  { label: 'Småspeider', value: 'light_yellow', colorVar: '#fff292' },
  { label: 'Bever', value: 'brown', colorVar: '#b49f5f' },
  { label: 'Stifinner', value: 'dark_blue', colorVar: '#69869f' },
  { label: 'Vandrer', value: 'light_green', colorVar: '#91c575' },
  { label: 'Rover', value: 'pink', colorVar: '#c475a8' },
  { label: 'Leder', value: 'turquoise', colorVar: '#7fd4e8' },
];
