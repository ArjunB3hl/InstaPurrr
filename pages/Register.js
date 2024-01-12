
import React from 'react';
import FormDemo from '../components/FormDemo.js';
import { FormDataProvider } from '../provider/FormDataContext.js';


export default function RegisterPage() {
    return <FormDataProvider>

        <FormDemo />

    </FormDataProvider>;
}