import { LanguageContext } from "../App";
import { useContext, useState } from "react";
import styled from "styled-components";
import { languageBubbleImage } from "../assets/language-bubble-image";
import { Navigate, useNavigate } from "react-router-dom";
import MuiBox from "@mui/material/Box";
import config from "../config";
import translations from "../assets/translations.json";

const FlexWrapper = styled.div`
  height: 100vh;
  background-color: #c6e8d6;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;

  box-sizing: border-box;
  padding-top: 30px;
  padding-bottom: 30px;
  padding-left: 20px;
  padding-right: 20px;
  justify-content: center;
  @media (min-width: 900px) {
    align-items: center;
  }
  @media (min-height: 900px) {
    padding-bottom: 400px;
  }
  @media (min-height: 1400px) {
    padding-bottom: 500px;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  @media (min-width: 600px) {
    width: 50%;
  }
  margin-top: 20px;
`;

const SpeechBubbleImage = styled.img`
  width: 60px;
  margin-bottom: 20px;
  position: fixed;
  left: 20px;
  top: 20px;
  cursor: pointer;
  @media (max-height: 380px) {
    width: 30px;
  }
  @media (min-width: 1000px) {
    width: 100px;
  }
  @media (min-width: 1600px) {
    width: 120px;
  }
  @media (min-height: 1300px) {
    width: 130px;
  }
`;

const SignInText = styled.span`
  font-size: 28px;
  width: 50%;
  font-weight: bold;
  @media (min-width: 500px) {
    font-size: 40px;
  }
`;
const Box = styled.div`
  font-size: 12px;
  margin-bottom: 5px;
  @media (min-width: 700px) {
    font-size: 15px;
  }
  @media (min-width: 1200px) {
    font-size: 20px;
  }
`;
const StyledTextInput = styled.input`
  max-width: 80%;
  border-radius: 3px;
  height: 20px;
  border-width: 0px;
  margin-bottom: 5px;
  font-size: 12px;
  @media (min-width: 800px) {
    font-size: 15px;
  }
  @media (min-width: 900px) {
    width: 100%;
    max-width: 50%;

    height: 30px;
  }
  @media (min-width: 1200px) {
    font-size: 20px;
  }
  @media (min-width: 1500px) {
    font-size: 22px;
  }
  @media (min-height: 600px) {
    height: 28px;
  }
`;
const SignInButton = styled.button`
  background-color: #0d99ff;
  color: white;
  cursor: pointer;

  width: max-content;
  border-radius: 3px;
  padding: 7px;

  border-width: 0px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 12px;
  @media (min-width: 800px) {
    font-size: 15px;
  }

  @media (min-width: 1200px) {
    font-size: 20px;
  }
  @media (min-width: 1500px) {
    font-size: 23px;
  }
`;

const ForgotPassword = styled.span`
  color: grey;
  cursor: pointer;
  font-size: 10px;
  @media (min-width: 800px) {
    font-size: 12px;
  }

  @media (min-width: 1200px) {
    font-size: 14px;
  }
  @media (min-width: 1500px) {
    font-size: 20px;
  }
`;
const ButtonsContainer = styled.div`
  display: flex;
  width: 80%;
  justify-content: space-between;
  @media (min-width: 900px) {
    width: 50%;
  }
`;

const Register = styled.span`
  color: #0d99ff;
  cursor: pointer;
  font-size: 10px;
  @media (min-width: 800px) {
    font-size: 12px;
  }

  @media (min-width: 1200px) {
    font-size: 14px;
  }
  @media (min-width: 1500px) {
    font-size: 20px;
  }
`;

export default function LoginPage() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const lang = translations[language];

  async function handleSignInClick() {
    if (email === "") {
      setError(lang ? lang.LoginPage.ErrorNoEmail : "No email provided");
      return;
    }
    if (password === "") {
      setError(lang ? lang.LoginPage.ErrorNoPassword : "No password provided");
      return;
    }
    const response = await fetch(`${config.SERVER_URL}/sign-in`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const json = await response.json();
    if (!response.ok) {
      if ("error_id" in json) {
        let error_id = json["error_id"];
        if (error_id === 1) {
          setError(
            lang
              ? lang.LoginPage.ErrorEmailDoesNotBelong
              : "Email does not belong to a registered account"
          );
          return;
        } else if (error_id === 2) {
          setError(
            lang ? lang.LoginPage.ErrorIncorrectPassword : "Incorrect Password"
          );
          return;
        }
      }
    } else {
      localStorage.setItem("auth_token", json["auth_token"]);

      navigate("/");
    }
  }
  return (
    <FlexWrapper>
      <SpeechBubbleImage
        onClick={() => {
          navigate("/language-selection");
        }}
        src={languageBubbleImage}
      ></SpeechBubbleImage>

      <SignInText>{lang ? lang.LoginPage.SignInText : "Login"}</SignInText>

      <FormContainer>
        <Box>{lang ? lang.LoginPage.BoxEmail : "Email"}</Box>
        <StyledTextInput
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          value={email}
        ></StyledTextInput>
        <MuiBox sx={{ height: "10px" }}></MuiBox>
        <Box>{lang ? lang.LoginPage.BoxPassword : "Password"}</Box>
        <StyledTextInput
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          type="password"
          value={password}
        ></StyledTextInput>
        <span style={{ color: "red" }}>{error}</span>
        <SignInButton onClick={handleSignInClick}>
          {lang ? lang.LoginPage.SignInButton : "Sign in"}
        </SignInButton>
        <ButtonsContainer>
          <Register
            onClick={() => {
              navigate("/register_options");
            }}
          >
            {lang ? lang.LoginPage.RegisterText : "Register"}
          </Register>
        </ButtonsContainer>
      </FormContainer>
    </FlexWrapper>
  );
}
