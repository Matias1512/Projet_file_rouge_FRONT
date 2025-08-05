import axios from "axios"
import { LANGUAGE_VERSIONS } from "./constants";

const API = axios.create({
    baseURL: "https://emkc.org/api/v2/piston",
  });


export const executeCode = async (language, sourceCode) => {
    const response = await API.post("/execute", {
        "language": language,
        "version": LANGUAGE_VERSIONS[language],
        "files": [
            {
            "content": sourceCode
            }
        ],
    });
    return response.data;
}

export const createUserExercise = async (userId, exerciseId, success = false) => {
    // Utiliser l'instance axios par défaut qui a les interceptors configurés
    const response = await axios.post(`https://schooldev.duckdns.org/api/user-exercises/create?userId=${userId}&exerciseId=${exerciseId}&success=${success}`, {});
    return response.data;
}

export const getUserExercises = async (userId) => {
    const response = await axios.get(`https://schooldev.duckdns.org/api/user-exercises/user/${userId}`);
    return response.data;
}

export const updateUserExercise = async (userExerciseId, success) => {
    const response = await axios.put(`https://schooldev.duckdns.org/api/user-exercises/${userExerciseId}/success?success=${success}`, {});
    return response.data;
}

export const getUserById = async (userId) => {
    const response = await axios.get(`https://schooldev.duckdns.org/api/users/${userId}`);
    return response.data;
}