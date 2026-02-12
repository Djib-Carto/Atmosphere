import { LAYERS, CATEGORIES } from '../config/layers';

export const getLayers = async () => {
    return Promise.resolve(LAYERS);
};

export const getCategories = async () => {
    return Promise.resolve(CATEGORIES);
};

