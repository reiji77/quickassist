import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Box } from "@mui/material";
import supportedLanguages from "../assets/supported_languages.json";
import config from "../config";

const RegistrationContainer = styled.div`
  background-color: #c6e8d6;
  padding: 20px;

  display: flex;
  flex-direction: column;

  height: 100vh;
  box-sizing: border-box;
  align-items: start;
  overflow-y: scroll;
  @media (min-width: 900px) {
    align-items: center;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: max-content;

  gap: 20px;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 70vw;
  height: 30px;

  min-width: 250px;
  max-width: 700px;
  font-size: 15px;
  @media (min-width: 900px) {
    font-size: 20px;
  }
`;

const Label = styled.label`
  margin-bottom: 5px;
  display: block;
  width: 50%;
  @media (min-width: 900px) {
    font-size: 20px;
  }
`;

const NextButton = styled.button`
  background-color: #0277bd;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  width: 100%;
  max-width: 200px;
  font-size: 15px;

  margin-top: 20px;
`;

const BackButton = styled.button`
  background-color: #0277bd;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  align-self: flex-start;
  margin-bottom: 20px;
  font-size: 15px;
`;

const LanguageCheckBoxInput = styled.input`
  margin-right: 5px;
`;

export default function HealthNavRegistration() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");
  const [languages, setLanguages] = useState(new Set());
  const handleSubmit = async () => {
    if (firstName === "") {
      alert("error: No first name provided");
      return;
    }
    if (lastName === "") {
      alert("error: No last name provided");
      return;
    }

    if (password !== reEnterPassword) {
      alert("error: passwords don't match");
      return;
    }
    if (email === "") {
      alert("error: No email provided");
      return;
    }
    if (password === "") {
      alert('error: No password provided"');
      return;
    }
    if (languages.size === 0) {
      alert("error: No language selected");
      return;
    }
    if (!languages.has("English")) {
      alert("error: registered health navigators must know at least English");
      return;
    }
    if (password.length < 8) {
      alert("error: password must be at least 8 characters");
      return;
    }
    if (
      !(
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password)
      )
    ) {
      alert("error: password must contain a lower case, upper case and number");
      return;
    }

    if (
      password.toLowerCase().includes(firstName.toLowerCase()) ||
      password.toLowerCase().includes(lastName.toLowerCase())
    ) {
      alert(
        "error: password must not contain health navigator's first or last name"
      );
      return;
    }
    const response = await fetch(
      `${config.SERVER_URL}/admin/register-health-navigator`,
      {
        method: "POST",
        body: JSON.stringify({
          auth_token: localStorage.getItem("auth_token"),
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          languages: [...languages].sort(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const json = await response.json();
    if (!response.ok) {
      if ("error_id" in json) {
        let error_id = json["error_id"];
        if (error_id === 12) {
          alert("error: only admins can register health navigators");
          return;
        } else if (error_id === 13) {
          alert("error: email already belongs to a registered account");
          return;
        } else {
          alert(json["error_id"]);
        }
      }
    } else {
      alert("health navigator account successfully registered!");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setReEnterPassword("");
      setLanguages(new Set());
    }
  };

  return (
    <RegistrationContainer>
      <BackButton onClick={() => navigate(-1)}>Back</BackButton>
      <h1 style={{ maxWidth: "80%" }}>Health Navigator Registration</h1>
      <Form>
        <InputGroup>
          <Label>First name *</Label>
          <Input
            type="text"
            name="first_name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>Last name *</Label>
          <Input
            type="text"
            name="last_name"
            value={lastName} // Use the correct state key here
            onChange={(e) => {
              setLastName(e.target.value);
            }}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>Email *</Label>
          <Input
            type="text"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>Password *</Label>
          <Input
            type="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>Re-enter password *</Label>
          <Input
            type="password"
            name="reEnterPassword"
            value={reEnterPassword}
            onChange={(e) => {
              setReEnterPassword(e.target.value);
            }}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>Languages *</Label>
          <Box sx={{ paddingLeft: "10px" }}>
            {supportedLanguages.map((language) => {
              return (
                <Label key={language[0]}>
                  <LanguageCheckBoxInput
                    type="checkbox"
                    checked={languages.has(language[0])}
                    name={language[0]}
                    key={language[0]}
                    onChange={(e) => {
                      if (e.target.checked) {
                        languages.add(language[0]);
                        setLanguages(new Set(languages));
                      } else {
                        languages.delete(language[0]);
                        setLanguages(new Set(languages));
                      }
                    }}
                  />
                  {language[0]}
                </Label>
              );
            })}
          </Box>
        </InputGroup>
        <Box>
          <NextButton type="button" onClick={handleSubmit}>
            Submit
          </NextButton>
        </Box>
      </Form>
    </RegistrationContainer>
  );
}
