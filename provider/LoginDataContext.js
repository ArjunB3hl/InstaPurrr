import { createContext, useContext, useState } from 'react';
export const LoginDataContext = createContext();
import { useRouter } from 'next/router';

export const LoginDataProvider = ({ children }) => {
    const router = useRouter();
    const [formData, setFormData] = useState({});

    const handleRegistration = async (data) => {
        console.log("FORM SUBMITTED");

        try {
            const userResponse = await fetch(`/api/getUsersB?username=${data.username}&password=${data.password}`);
            const user = await userResponse.json();

            if (userResponse.ok) {
                localStorage.setItem('formData', JSON.stringify({ ...data, id: user.id }));
                setFormData({ ...data, id: user.id });
                router.push('/Home');
            } else {
                alert(user.message || 'Error during login');
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    return (
        <LoginDataContext.Provider value={{ formData, handleRegistration }}>
            {children}
        </LoginDataContext.Provider>
    );
};

export function useAppState() {
    const context = useContext(LoginDataContext);

    if (context === undefined) {
        throw new Error('useAppState must be used within a AppStateProvider');
    }

    return context;
}