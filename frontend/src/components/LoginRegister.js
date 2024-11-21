import React, { useState } from "react";
import styled from "styled-components";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

const Wrapper = styled.div`
  position: relative;
  width: 420px;
  height: ${(props) => (props.active ? "520px" : "450px")};
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
  margin: -15px 0 15px;

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

const LoginRegister = () => {
  const [action, setAction] = useState(false);

  const registerLink = () => setAction(true);
  const loginLink = () => setAction(false);

  return (
    <Wrapper active={action}>
      <FormBox active={action}>
        <Form>
          <h2>Login</h2>
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
          <RememberForgot>
            <label>
              <input type="checkbox" /> I agree to the T&C
            </label>
            <a href="#">Terms & conditions</a>
          </RememberForgot>
          <Button type="submit">Register</Button>
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
