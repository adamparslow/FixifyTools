import { writeFileSync, readFileSync } from 'fs';

export const saveToken = (token, scope) => {
   writeFileSync("refreshToken.txt", `${token} ${scope}`);
};

export const getToken = () => {
   return readFileSync("refreshToken.txt", 'utf-8').split(" ")[0];
};