import { LAYERS, CATEGORIES } from '../config/layers';

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

export const getLayers = async () => {
    return Promise.resolve(LAYERS);
};

export const getCategories = async () => {
    return Promise.resolve(CATEGORIES);
};

