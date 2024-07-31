import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const MyForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        pan: '',
        address1: '',
        address2: '',
        postcode: '',
        state: '',
        city: '',
    });

    const [emailError, setEmailError] = useState('');
    const [loader, setLoader] = useState(false); // State for general loader
    const [postcodeLoader, setPostcodeLoader] = useState(false); // State for postcode loader
    const [contactNumberError, setContactNumberError] = useState('');

    const handleChange = async (e) => {
        const { name, value, type } = e.target;

        let newValue = value;
        let isValid = true;

        if (type === 'text') {
            if (name === 'contactNumber') {
                newValue = value.replace(/[^0-9]/g, ''); // Allow only digits

                if (newValue.length > 10) {
                    setContactNumberError('Mobile number should be exactly 10 digits');
                } else {
                    setContactNumberError('');
                }

                setFormData(prevState => ({
                    ...prevState,
                    contactNumber: newValue
                }));
            } else if (name === 'postcode') {
                newValue = value.replace(/[^0-9]/g, ''); // Allow only digits

                if (newValue.length === 6) { // Assuming postcode length is 6
                    setPostcodeLoader(true); // Show loader
                    try {
                        const response = await axios.post('https://lab.pixel6.co/api/get-postcode-details.php', {
                            postcode: newValue
                        });

                        if (response.data.status === 'Success') {
                            const city = response.data.city[0]?.name || '';
                            const state = response.data.state[0]?.name || '';

                            setFormData(prevState => ({
                                ...prevState,
                                postcode: newValue,
                                city: city,
                                state: state,
                            }));
                        }
                    } catch (error) {
                        console.error('Error fetching postcode details:', error);
                    } finally {
                        setPostcodeLoader(false); // Hide loader
                    }
                }
            } else if (name === 'pan') {
                newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Allow only uppercase letters and digits
                
                if (newValue.length === 10) { // PAN has 10 characters
                    setLoader(true); // Show loader
                    try {
                        const response = await axios.post('https://lab.pixel6.co/api/verify-pan.php', {
                            panNumber: newValue
                        });

                        if (response.data.status === 'Success' && response.data.isValid) {
                            const [firstName, lastName] = response.data.fullName.split(' ');
                            setFormData(prevState => ({
                                ...prevState,
                                pan: newValue,
                                firstName: firstName || '',
                                lastName: lastName || '',
                            }));
                        } else {
                            setFormData(prevState => ({
                                ...prevState,
                                pan: newValue,
                                firstName: '',
                                lastName: '',
                            }));
                        }
                    } catch (error) {
                        console.error('Error verifying PAN:', error);
                    } finally {
                        setLoader(false); // Hide loader
                    }
                }
            } else if (name === 'address1' || name === 'address2') {
                newValue = value.replace(/[^a-zA-Z0-9\s,.-]/g, ''); // Allow letters, numbers, spaces, commas, periods, and dashes
            } else {
                newValue = value.replace(/[^a-zA-Z\s]/g, ''); // Only allow letters and spaces
            }
        } else if (type === 'email') {
            const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
            isValid = emailPattern.test(value);

            if (!isValid) {
                setEmailError('Please enter your correct email address');
            } else {
                setEmailError(''); // Clear error if valid
            }

            newValue = value; // Allow the user to continue typing
        }

        setFormData(prevState => ({
            ...prevState,
            [name]: newValue,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
        if (!emailPattern.test(formData.email)) {
            alert("Invalid email format. Please enter a valid email address.");
            return; // Stop form submission if the email is invalid
        }

        if (formData.contactNumber.length !== 10) {
            setContactNumberError('Mobile number must be exactly 10 digits');
            return; // Stop form submission if the mobile number is invalid
        }

        console.log("Form submitted with data:", formData);
    };

    return (
        <div className="form-container" style={{ marginBottom: '20px' }}>
            <h2 style={{ textAlign: 'center', fontFamily: 'Bold', fontSize: '30px', marginBottom: '50px', color: '#aeb44e' }}>Registration Form</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="firstName" style={{ display: 'block', marginBottom: '1rem' }}>First Name <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="Enter your First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        maxLength={140}
                        style={{ width: '94%', padding: '1rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="lastName" style={{ display: 'block', marginBottom: '1rem' }}>Last Name <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Enter your Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        maxLength={140}
                        style={{ width: '94%', padding: '1rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '1rem' }}>Email <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        maxLength={255}
                        style={{ width: '94%', padding: '1rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    {emailError && <div style={{ color: 'red', marginTop: '0.5rem' }}>{emailError}</div>}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="contactNumber" style={{ display: 'block', marginBottom: '1rem' }}>Contact Number <span style={{ color: 'red' }}>*</span></label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1rem',
                            color: '#888'
                        }}>
                            +91
                        </span>
                        <input
                            type="text"
                            id="contactNumber"
                            name="contactNumber"
                            placeholder="Enter your Contact Number"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            required
                            maxLength={10}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                paddingLeft: '50px', // Space for the prefix
                                fontSize: '1rem',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box' // Include padding in width calculation
                            }}
                        />
                    </div>
                    {contactNumberError && <div style={{ color: 'red', marginTop: '0.5rem' }}>{contactNumberError}</div>}
                </div>

                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <label htmlFor="pan" style={{ display: 'block', marginBottom: '1rem' }}>PAN <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        id="pan"
                        name="pan"
                        placeholder="Enter your PAN Number"
                        value={formData.pan}
                        onChange={handleChange}
                        required
                        maxLength={10}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            paddingRight: '50px', 
                            fontSize: '1rem',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            boxSizing: 'border-box' 
                        }}
                    />
                    {loader && (
                        <img
                            src="https://media.tenor.com/SLFiTi_nrQ4AAAAC/loader.gif"
                            alt="Loading..."
                            style={{
                                position: 'absolute',
                                right: '5px',
                                top: '70%', 
                                transform: 'translateY(-50%)',
                                width: '40px',
                                height: '40px',
                                pointerEvents: 'none',
                            }}
                        />
                    )}
                </div>

                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <label htmlFor="postcode" style={{ display: 'block', marginBottom: '1rem' }}>Postcode <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        id="postcode"
                        name="postcode"
                        placeholder="Enter your Postcode"
                        value={formData.postcode}
                        onChange={handleChange}
                        required
                        maxLength={6}
                        style={{ width: '94%', padding: '1rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    {postcodeLoader && (
                        <img
                            src="https://media.tenor.com/SLFiTi_nrQ4AAAAC/loader.gif"
                            alt="Loading..."
                            style={{
                                position: 'absolute',
                                right: '2px',
                                top: '70%',
                                transform: 'translateY(-50%)',
                                width: '40px',
                                height: '40px',
                                pointerEvents: 'none',
                            }}
                        />
                    )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="address1" style={{ display: 'block', marginBottom: '1rem' }}>Address Line 1 (Correspondence) <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        id="address1"
                        name="address1"
                        placeholder="Enter your Correspondence Address"
                        value={formData.address1}
                        onChange={handleChange}
                        required
                        style={{ width: '94%', padding: '1rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="address2" style={{ display: 'block', marginBottom: '1rem' }}>Address Line 2 (Permanent) <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        id="address2"
                        name="address2"
                        placeholder="Enter your Permanent Address"
                        value={formData.address2}
                        onChange={handleChange}
                        required
                        style={{ width: '94%', padding: '1rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="state" style={{ display: 'block', marginBottom: '1rem' }}>State <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        id="state"
                        name="state"
                        placeholder="Enter your State"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        style={{ width: '94%', padding: '1rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="city" style={{ display: 'block', marginBottom: '1rem' }}>City <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        placeholder="Enter your City"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        style={{ width: '94%', padding: '1rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div className="submit-button-container">
                    <button type="submit" className="submit-button">SUBMIT</button>
                </div>
            </form>
        </div>
    );
};

export { MyForm };
