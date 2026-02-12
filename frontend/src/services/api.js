import { LAYERS, CATEGORIES } from '../config/layers';

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

export const getLayers = async () => {
    return Promise.resolve(LAYERS);
};

export const getCategories = async () => {
    return Promise.resolve(CATEGORIES);
};

export const subscribeEmail = async (email) => {
    // Google Apps Script Web App URL
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });
    // With no-cors, we can't check response.ok, so we assume success if no error is thrown
    return { status: "success" };
};
