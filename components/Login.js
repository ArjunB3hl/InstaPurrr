

import React from 'react';
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';
import { Box, Typography } from '@mui/material';
import { useAppState } from '../provider/LoginDataContext.js';
import { useForm } from "react-hook-form";
import Link from '@mui/material/Link';




export default function Login() {

    const { formData, handleRegistration } = useAppState();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ mode: "onChange" });



    const handleError = (errors) => { };

    const registerOptions = {
        username: { required: "Username cannot be blank" },
        password: {
            required: "Password is required",
            minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
            },
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '80vh',
                bgcolor: 'background.default',
                color: 'text.primary',
                '& .MuiTextField-root': { m: 1, width: '80%' },
                '& .MuiButton-root': { m: 1, width: '80%' }
            }}
        >
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    fontFamily: '"Great Vibes", cursive',
                    fontWeight: 'lighter',
                    textAlign: 'center',
                    color: '#262626',
                }}
            >
                InstaPurr
            </Typography>
            <form onSubmit={handleSubmit(handleRegistration, handleError)}>
                <TextField
                    id="username-input"
                    placeholder="Phone number, username, or email"
                    label="Username"
                    variant="outlined"
                    {...register("username", registerOptions.username)}
                    error={!!errors.username}
                    helperText={errors?.username?.message}
                />
                <TextField
                    id="password-input"
                    type="password"
                    placeholder="Password"
                    label="Password"
                    variant="outlined"
                    {...register("password", registerOptions.password)}
                    error={!!errors.password}
                    helperText={errors?.password?.message}
                />


                <Button type="submit" variant="contained" color="primary">
                    Log In
                </Button>

            </form>

            <Typography sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
                Don't have an account?{' '}
                <Link href="\login"> Register </Link>
            </Typography>

        </Box>
    );
}
