import { LAYERS, CATEGORIES } from '../config/layers';

const API_BASE_URL = 'http://localhost:8001/api';

export const getLayers = async () => {
    return Promise.resolve(LAYERS);
};

export const getCategories = async () => {
    return Promise.resolve(CATEGORIES);
};

export const subscribeEmail = async (email) => {
    const response = await fetch(`${API_BASE_URL}/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) {
        throw new Error('Failed to subscribe');
    }
    return response.json();
};
