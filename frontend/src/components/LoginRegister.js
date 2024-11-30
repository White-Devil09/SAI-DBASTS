import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { FaUser, FaLock, FaEnvelope, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const Wrapper = styled.div`
  position: relative;
  width: 420px;
  height: ${(props) => (props.active ? "580px" : "450px")};
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  color: white;
  display: flex;
  align-items: center;
  overflow: hidden;
  transition: height 0.2s ease;
`;

const FormBox = styled.div`
  width: 100%;
  padding: 40px;
  position: ${(props) => (props.register ? "absolute" : "relative")};
  transition: translate 0.2s ease;
  translate: ${(props) => (props.register ? (props.active ? "0" : "400px") : props.active ? "-400px" : "0")};
`;

const Form = styled.form`
  h2 {
    font-size: 36px;
    text-align: center;
  }
`;

const InputBox = styled.div`
  position: relative;
  width: 100%;
  height: 50px;
  margin: 30px 0;
  background: transparent;

  input {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    border-radius: 40px;
    font-size: 16px;
    color: #fff;
    padding-left: 20px;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .icons {
    position: absolute;
    right: 20px;
    top: 50%;
    translate: 0 -50%;
    font-size: 16px;
  }
`;

const RememberForgot = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14.5px;
  margin: -1px 0 15px;

  label input {
    accent-color: white;
    margin-right: 4px;
  }

  a {
    color: white;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Button = styled.button`
  width: 100%;
  height: 45px;
  background: white;
  border: none;
  outline: none;
  color: #333;
  border-radius: 40px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;

  &:hover {
    opacity: 0.9;
  }
`;

const InLink = styled.button`
    color: white;
    background: transparent;
    border: none;
    margin: 0 10px;
    font-size: 14.5px;
    cursor: pointer;
    font-weight: 600;

    &:hover {
        text-decoration: underline;
    }
`;

const RegisterLink = styled.div`
  font-size: 14.5px;
  text-align: center;
  margin: 20px 0 15px;

  a {
    color: white;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const MicContainer = styled.div`
  text-align: center;
  margin: 20px 0;
`;

const MicButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 24px;
  margin: 5px 0;
`;

const LoginRegister = () => {
    const [action, setAction] = useState(false);
    const [loginFailedAttempts, setLoginFailedAttempts] = useState(0);
    const [agreeTnC, setAgreeTnC] = useState(false);
    const [recording, setRecording] = useState(false);
    const [timer, setTimer] = useState(10);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");


    const registerLink = () => setAction(true);
    const loginLink = () => setAction(false);
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);

            const chunks = [];
            recorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: "audio/webm" });
                setAudioChunks(chunks);
                console.log("Recording stopped. Audio Blob created:", audioBlob);
            };

            recorder.start();
            setRecording(true);
            setTimer(10);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const handleStopRecording = useCallback(() => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
            setTimer(0);
        }
    }, [mediaRecorder]);

    useEffect(() => {
        let interval;
        if (recording && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0 && recording) {
            handleStopRecording();
        }
        return () => clearInterval(interval);
    }, [recording, timer, handleStopRecording]);


    const sendAudioToBackend = useCallback(async (audioBlob, endpoint) => {
        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Backend Response:", result);
            return result;
        } catch (error) {
            console.error("Error sending audio to backend:", error);
            return { success: false, error: error.message };
        }
    }, [apiUrl]);


    useEffect(() => {
        if (!recording && audioChunks.length > 0) {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            sendAudioToBackend(audioBlob);
        }
    }, [recording, audioChunks, sendAudioToBackend]);


    const handleVoiceLogin = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (event) => chunks.push(event.data);
            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: "audio/webm" });
                const result = await sendAudioToBackend(audioBlob, process.env.REACT_APP_LOGIN_VOICE_ENDPOINT);

                if (result.success) {
                    console.log("Voice authentication successful");
                    window.location.href = "/profile";
                } else {
                    console.log("Voice authentication failed");
                    setLoginFailedAttempts((prev) => prev + 1);
                }
            };

            recorder.start();
            setTimeout(() => recorder.stop(), 5000);
        } catch (error) {
            console.error("Error accessing microphone for voice login:", error);
        }
    };

    const sendRegistrationData = async (userData, audioBlob) => {
        const formData = new FormData();
        formData.append("username", userData.username);
        formData.append("email", userData.email);
        formData.append("password", userData.password);
        formData.append("audio", audioBlob);

        try {
            const response = await fetch(`${apiUrl}${process.env.REACT_APP_REGISTER_ENDPOINT}`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Registration Response:", result);
            return result;
        } catch (error) {
            console.error("Error during registration:", error);
            return { success: false, error: error.message };
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;

        if (!audioChunks.length) {
            console.error("No voice sample recorded.");
            return;
        }

        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        const userData = { username, email, password };
        const result = await sendRegistrationData(userData, audioBlob);

        if (result.success) {
            console.log("Registration successful!");
        } else {
            console.log("Registration failed:", result.error);
        }
    };

    const handleLogin = async () => {
        try {
            const endpoint = `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_LOGIN_ENDPOINT}`;
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log(data.message); // "Login successful"
                window.location.href = "/profile";
            } else {
                const errorData = await response.json();
                console.error("Login failed:", errorData.detail);
                alert("Invalid credentials. Please try again.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred. Please try again.");
        }
    };
    



    return (
        <Wrapper active={action}>
            <FormBox active={action}>
                <Form>
                    <h2>Login</h2>

                    {loginFailedAttempts < 3 ? (
                        <MicContainer>
                            <MicButton onClick={(event) => {
                                event.preventDefault();
                                handleVoiceLogin();
                            }}>
                                <FaMicrophone />
                            </MicButton>
                            <p>Use your voice to log in</p>
                        </MicContainer>
                    ) : (
                        <>
                            <InputBox>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <FaEnvelope className="icons" />
                            </InputBox>
                            <InputBox>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <FaLock className="icons" />
                            </InputBox>
                            <RememberForgot>
                                <label>
                                    <input type="checkbox" /> Remember me
                                </label>
                                <InLink type="button">Forgot password?</InLink>
                            </RememberForgot>
                            <Button type="button" onClick={handleLogin}>
                                Login
                            </Button>
                        </>
                    )
                    }

                    <RegisterLink>
                        <p>
                            Don't have an account?
                            <InLink type="button" onClick={registerLink}>Register</InLink>
                        </p>
                    </RegisterLink>
                </Form>
            </FormBox>
            <FormBox register active={action}>
                <Form onSubmit={handleRegister}>
                    <h2>Registration</h2>
                    <InputBox>
                        <input type="text" name="username" placeholder="Username" required />
                        <FaUser className="icons" />
                    </InputBox>
                    <InputBox>
                        <input type="email" name="email" placeholder="Email" required />
                        <FaEnvelope className="icons" />
                    </InputBox>
                    <InputBox>
                        <input type="password" name="password" placeholder="Password" required />
                        <FaLock className="icons" />
                    </InputBox>

                    <MicContainer>
                        <MicButton onClick={handleStartRecording} disabled={recording}>
                            {recording ? <FaMicrophoneSlash /> : <FaMicrophone />}
                        </MicButton>
                        {recording && <p>Recording... {timer}s remaining</p>}
                        {!recording && audioChunks.length > 0 && <p>Voice sample captured</p>}
                    </MicContainer>

                    <RememberForgot>
                        <label>
                            <input
                                type="checkbox"
                                onChange={(e) => setAgreeTnC(e.target.checked)}
                            />{" "}
                            I agree to the T&C
                        </label>
                        <InLink type="button">Terms & conditions</InLink>
                    </RememberForgot>
                    <Button type="submit" disabled={!agreeTnC || recording}>
                        Register
                    </Button>
                    <RegisterLink>
                        <p>
                            Already have an account?
                            <InLink type="button" onClick={loginLink}>Login</InLink>
                        </p>
                    </RegisterLink>
                </Form>
            </FormBox>
        </Wrapper>
    );
};

export default LoginRegister;
