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
const Textarea = styled.textarea`
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 80px;

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

const SubmitButton = styled.button`
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
export default function HealthOrgRegistration() {
  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = async () => {
    if (name === "") {
      alert(" No name provided");
      return;
    }

    if (password !== reEnterPassword) {
      alert("passwords don't match");
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

    if (password.length < 8) {
      alert("password must be at least 8 characters");
      return;
    }
    if (
      !(
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password)
      )
    ) {
      alert("password must contain a lower case, upper case and number");
      return;
    }

    if (
      password.toLowerCase().includes(name.toLowerCase()) ||
      password.toLowerCase().includes(name.toLowerCase())
    ) {
      alert("password must not contain name");
      return;
    }
    const response = await fetch(`${config.SERVER_URL}/health_org/register`, {
      method: "POST",
      body: JSON.stringify({
        auth_token: localStorage.getItem("auth_token"),
        email,
        password,
        name,
        url,
        description,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const json = await response.json();
    if (!response.ok) {
      if ("error_id" in json) {
        let error_id = json["error_id"];
        if (error_id === 2) {
          alert("email already registered");
          return;
        } else {
          alert(error_id);
        }
      }
    } else {
      localStorage.setItem("auth_token", json["auth_token"]);
      navigate("/");
    }
  };

  return (
    <RegistrationContainer>
      <BackButton onClick={() => navigate(-1)}>Back</BackButton>
      <h1 style={{ maxWidth: "80%" }}>Health Organisation Registration</h1>
      <Form>
        <InputGroup>
          <Label>Name *</Label>
          <Input
            type="text"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
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
          <Label>Description</Label>
          <Textarea
            type="text"
            name="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>Website URL</Label>
          <Input
            type="text"
            name="website url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
            }}
            required
          />
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
