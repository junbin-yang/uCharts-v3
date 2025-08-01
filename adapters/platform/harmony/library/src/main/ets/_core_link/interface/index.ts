import { GlobalConfig } from '../core/types/config';
export * from '../core/types';
export * from '../core/types/extra';
export * from '../core/types/series';
export * from '../core/types/geojson';
export * from './canvas.type';
export { setGlobalConfig } from '../core/types/config';
export const getGlobalConfig = () => GlobalConfig;