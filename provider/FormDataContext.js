// provider/FormDataContext.js
import { createContext, useContext, useState } from 'react';
export const FormDataContext = createContext();
import { useRouter } from 'next/router';


export const FormDataProvider = ({ children }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({});

  const handleRegistration = async (data) => {
    console.log("FORM SUBMITTED");

    try {
      const userResponse = await fetch(`/api/getUsers?username=${data.username}`);
      const users = await userResponse.json();

      if (users.length > 0) {
        alert('Username already taken');
        return;
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result && result.id) {
        localStorage.setItem('formData', JSON.stringify({ ...data, id: result.id }));
        setFormData({ ...data, id: result.id });
        router.push('/Home');
      } else {
        console.error('ID not received in the response');
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <FormDataContext.Provider value={{ formData, handleRegistration }}>
      {children}
    </FormDataContext.Provider>
  );
};

export function useAppState() {
  const context = useContext(FormDataContext);

  if (context === undefined) {
    throw new Error('useAppState must be used within a AppStateProvider');
  }

  return context;
}

