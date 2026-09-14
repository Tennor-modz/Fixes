import http from '@/api/http';

export interface RegistrationData {
    username: string;
    email: string;
    name_first: string;
    name_last: string;
    password: string;
    password_confirmation: string;
}

export default async (data: RegistrationData): Promise<void> => {
    await http.get('/sanctum/csrf-cookie');
    await http.post('/auth/register', data);
};
