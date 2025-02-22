import React, { useState, useContext } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import translations from "../../assets/translations.json";
import { LanguageContext } from "../../App";

// Styled components
const Container = styled.div`
  background-color: #c6e8d6;
  padding: 20px;
  border-radius: 5px;
  width: 90%;
  max-width: 400px;
  margin: auto;
  display: flex;
  flex-direction: column;

  align-items: center;

  box-sizing: border-box;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const Instruction = styled.p`
  text-align: center;
  margin-bottom: 20px;
  font-size: 15px;
  @media (min-width: 800px) {
    font-size: 18px;
  }
`;

const CodeContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const CodeInput = styled.input`
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 24px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const DoneButton = styled.button`
  background-color: #0277bd;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  max-width: 200px;
  align-self: center;
`;
const CancelButton = styled.button`
  background-color: #0277bd;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  max-width: 200px;
  align-self: center;
  margin-top: 10px;
`;

function VerificationPage() {
  const [code, setCode] = useState(["", "", "", ""]);
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const lang = translations[language];

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") {
      // Accept only single digit numbers
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
    }
  };

  // Handle form submission
  const handleDone = async () => {
    const verificationCode = code.join("");

    const response = await fetch(
      `${config.SERVER_URL}/user/register-request-code`,
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          code: parseInt(verificationCode),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const json = await response.json();
    if (!response.ok) {
      if ("error_id" in json) {
        let error_id = json["error_id"];
        if (error_id === 1) {
          alert(
            lang
              ? lang.VerificationPage.AlertWrongCode
              : "The code you entered is wrong."
          );
        }
      }
    } else {
      localStorage.setItem("auth_token", json["auth_token"]);
      navigate("/user/home");
    }
  };

  return (
    <Container>
      <Instruction>
        {lang
          ? lang.VerificationPage.Instruction
          : "Enter 4 digit verification code sent to your email to finish registering your account"}
      </Instruction>
      <CodeContainer>
        {code.map((digit, index) => (
          <CodeInput
            key={index}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e, index)}
          />
        ))}
      </CodeContainer>
      <DoneButton onClick={handleDone}>
        {lang ? lang.VerificationPage.Done : "Done"}
      </DoneButton>
    </Container>
  );
}

export default VerificationPage;
