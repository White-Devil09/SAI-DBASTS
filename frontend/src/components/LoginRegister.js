import React, { useState, useEffect } from "react";
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

    const handleStopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
            setTimer(0);
        }
    };

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
    }, [recording, timer]);

    const sendAudioToBackend = async (audioBlob) => {
        const formData = new FormData();
        formData.append("voice_sample", audioBlob);

        const endpoint = process.env.REACT_APP_UPLOAD_VOICE_ENDPOINT;

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
    };

    useEffect(() => {
        if (!recording && audioChunks.length > 0) {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            sendAudioToBackend(audioBlob);
        }
    }, [recording]);

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
                    // Navigate to dashboard or provide success feedback
                } else {
                    console.log("Voice authentication failed");
                    setLoginFailedAttempts((prev) => prev + 1);
                }
            };

            recorder.start();
            setTimeout(() => recorder.stop(), 5000); // Stop recording after 5 seconds
        } catch (error) {
            console.error("Error accessing microphone for voice login:", error);
        }
    };

    const sendRegistrationData = async (userData) => {
        const response = await fetch(`${apiUrl}${process.env.REACT_APP_REGISTER_ENDPOINT}`, {
            method: "POST",
            body: JSON.stringify(userData),
            headers: {
                "Content-Type": "application/json",
            },
        });
    
        const data = await response.json();
        console.log("Registration Response:", data);
        return data;
    };

    return (
        <Wrapper active={action}>
            <FormBox active={action}>
                <Form>
                    <h2>Login</h2>

                    {loginFailedAttempts < 3 ? (
                        <MicContainer>
                            <MicButton onClick={handleVoiceLogin}>
                                <FaMicrophone />
                            </MicButton>
                            <p>Use your voice to log in</p>
                        </MicContainer>
                    ) : (
                        <>
                            <InputBox>
                                <input type="text" placeholder="Username" required />
                                <FaUser className="icons" />
                            </InputBox>
                            <InputBox>
                                <input type="password" placeholder="Password" required />
                                <FaLock className="icons" />
                            </InputBox>
                            <RememberForgot>
                                <label>
                                    <input type="checkbox" /> Remember me
                                </label>
                                <a href="#">Forgot password?</a>
                            </RememberForgot>
                            <Button type="submit">Login</Button>
                        </>)
                    }

                    <RegisterLink>
                        <p>
                            Don't have an account? <a href="#" onClick={registerLink}>Register</a>
                        </p>
                    </RegisterLink>
                </Form>
            </FormBox>
            <FormBox register active={action}>
                <Form>
                    <h2>Registration</h2>
                    <InputBox>
                        <input type="text" placeholder="Username" required />
                        <FaUser className="icons" />
                    </InputBox>
                    <InputBox>
                        <input type="email" placeholder="Email" required />
                        <FaEnvelope className="icons" />
                    </InputBox>
                    <InputBox>
                        <input type="password" placeholder="Password" required />
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
                        <a href="#">Terms & conditions</a>
                    </RememberForgot>
                    <Button type="submit" disabled={!agreeTnC || recording}>
                        Register
                    </Button>
                    <RegisterLink>
                        <p>
                            Already have an account? <a href="#" onClick={loginLink}>Login</a>
                        </p>
                    </RegisterLink>
                </Form>
            </FormBox>
        </Wrapper>
    );
};

export default LoginRegister;
