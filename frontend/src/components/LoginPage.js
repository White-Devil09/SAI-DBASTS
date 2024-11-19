import React, { useState } from "react";
import axios from "axios";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [voice, setVoice] = useState(null);
    const [message, setMessage] = useState("");
    const [fallback, setFallback] = useState(false);

    const handleVoiceLogin = async () => {
        if (!voice) {
            setMessage("Please upload a voice note.");
            return;
        }

        const formData = new FormData();
        formData.append("voice", voice);

        try {
            const response = await axios.post("http://localhost:5000/api/login/voice", formData);
            if (response.data.success) {
                setMessage("Login successful!");
            } else {
                setFallback(true);
                setMessage("Voice authentication failed. Please try fallback login.");
            }
        } catch (error) {
            setMessage("Error during voice authentication. Please try again.");
        }
    };

    const handleFallbackLogin = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/login", { email, password });
            if (response.data.success) {
                setMessage("Fallback login successful!");
            } else {
                setMessage("Invalid email or password.");
            }
        } catch (error) {
            setMessage("Error during login. Please try again.");
        }
    };

    const handleVoiceUpload = (event) => {
        setVoice(event.target.files[0]);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Login</h2>
            {!fallback ? (
                <div>
                    <label>Upload Voice Note:</label>
                    <input type="file" accept="audio/*" onChange={handleVoiceUpload} />
                    <button onClick={handleVoiceLogin}>Login with Voice</button>
                </div>
            ) : (
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleFallbackLogin}>Login with Email and Password</button>
                </div>
            )}
            {message && <p>{message}</p>}
        </div>
    );
};

export default LoginPage;
