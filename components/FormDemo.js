


import React from 'react';
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';
import { Box, Typography } from '@mui/material';
import { useAppState } from '../provider/FormDataContext.js';
import { useForm } from "react-hook-form";
import Link from '@mui/material/Link';




export default function FormDemo() {

    const { formData, handleRegistration } = useAppState();
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
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
        },
        confirmPassword: {
            required: "Confirm Password is required",
            validate: value =>
                value === watch('password') || "The passwords do not match",
        },
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Ensures all child elements are centered
                justifyContent: 'center',
                height: '80vh',
                bgcolor: 'background.default',
                color: 'text.primary',
                margin: 'auto', // This centers the Box itself
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
                    textAlign: 'center', // Centers the text within Typography
                    color: '#262626',
                    width: '100%' // Ensure the Typography takes the full width
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

                <TextField
                    id="confirm-password-input"
                    type="password"
                    placeholder="Confirm Password"
                    label="Confirm Password"
                    variant="outlined"
                    {...register("confirmPassword", registerOptions.confirmPassword)}
                    error={!!errors.confirmPassword}
                    helperText={errors?.confirmPassword?.message}
                />
                <Button type="submit" variant="contained" color="primary">
                    Register
                </Button>

            </form>
            <Typography sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
                Already have an account?{' '}
                <Link href="\login"> Login </Link>
            </Typography>

        </Box>
    );
}



