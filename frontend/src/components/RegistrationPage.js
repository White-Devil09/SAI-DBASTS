import React, { useState } from "react";
import axios from "axios";

const RegistrationPage = () => {
    const [email, setEmail] = useState("");
    const [voice, setVoice] = useState(null);
    const [message, setMessage] = useState("");

    const handleEmailSubmit = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/register", { email });
            setMessage(response.data.message || "Password reset link sent!");
        } catch (error) {
            setMessage("Error sending email. Please try again.");
        }
    };

    const handleVoiceUpload = (event) => {
        setVoice(event.target.files[0]);
    };

    const handleVoiceSubmit = async () => {
        if (!voice) {
            setMessage("Please upload a voice note.");
            return;
        }

        const formData = new FormData();
        formData.append("email", email);
        formData.append("voice", voice);

        try {
            const response = await axios.post("http://localhost:5000/api/upload-voice", formData);
            setMessage(response.data.message || "Voice uploaded successfully!");
        } catch (error) {
            setMessage("Error uploading voice note. Please try again.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Registration</h2>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={handleEmailSubmit}>Send Password Reset Link</button>
            </div>
            <div>
                <label>Upload Voice Note:</label>
                <input type="file" accept="audio/*" onChange={handleVoiceUpload} />
                <button onClick={handleVoiceSubmit}>Submit Voice Note</button>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
};

export default RegistrationPage;
