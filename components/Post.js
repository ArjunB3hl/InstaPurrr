

import React from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";






export default function Post({ onAddImage }) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleError = (errors) => { };
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({ mode: "onChange" });

    const registerOptions = {
        image: { required: "Image URL cannot be blank" },
    };

    const handleRegistration = async (data) => {
        console.log("FORM SUBMITTED");
        console.log(data);
        handleClose();

        const savedFormData = JSON.parse(localStorage.getItem('formData'));
        const userId = savedFormData ? savedFormData.id : null;
        const username = savedFormData ? savedFormData.username : null;


        const imageData = { ...data, userId: userId, username: username };

        try {
            const response = await fetch('/api/submitImage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(imageData),
            });
            const result = await response.json();
            onAddImage({ id: result.id, image: data.image });
            console.log(result.message);
        } catch (error) {
            console.error('Error submitting form data:', error);
        }
        reset();




    };


    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{
                        flexGrow: 1, fontFamily: '"Great Vibes", cursive',
                        fontWeight: 'lighter',
                        textAlign: 'center',
                        color: 'white',
                        fontSize: '24px'
                    }}>
                        <Typography


                        >
                            InstaPurr
                        </Typography>
                    </Typography>
                    <div>
                        <Button id="demo-positioned-button" variant="filled" startIcon={<AddIcon />}
                            aria-controls={open ? 'demo-positioned-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                        >
                            Add POST
                        </Button>
                        <Menu
                            id="demo-positioned-menu"
                            aria-labelledby="demo-positioned-button"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            sx={{
                                '& .MuiPaper-root': {
                                    minWidth: '250px',
                                    maxWidth: '100%',
                                    width: 'auto',

                                }
                            }}
                        >
                            <MenuItem>

                                <form onSubmit={handleSubmit(handleRegistration, handleError)}>
                                    <TextField
                                        id="image-input"
                                        placeholder="add image url"
                                        label="image"
                                        variant="outlined"
                                        {...register("image", registerOptions.image)}
                                        error={!!errors.image}
                                        helperText={errors?.image?.message}
                                    />

                                    {/* <Button type="submit" variant="contained" color="primary">
                                            Post
                                        </Button> */}

                                </form>


                            </MenuItem>
                        </Menu>
                    </div>


                </Toolbar>
            </AppBar>
        </Box>
    )
}
