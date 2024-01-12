
import React from 'react';
import Login from '../components/Login';
import { LoginDataProvider } from '../provider/LoginDataContext.js';


export default function LoginPage() {
    return <LoginDataProvider>

        <Login />

    </LoginDataProvider>;
}