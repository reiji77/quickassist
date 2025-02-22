import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Box } from "@mui/material";

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

export default function AdminRegistration() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const handleSubmit = async () => {
    if (password !== reEnterPassword) {
      alert("error: passwords don't match");
      return;
    }

    const response = await fetch(`${config.SERVER_URL}/admin/register`, {
      method: "POST",
      body: JSON.stringify({
        auth_token: localStorage.getItem("auth_token"),
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        admin_key: adminKey,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const json = await response.json();
    if (!response.ok) {
      alert(json.message || json.error_id || "could not register");
    } else {
      localStorage.setItem("auth_token", json["auth_token"]);
      navigate("/");
    }
  };

  return (
    <RegistrationContainer>
      <BackButton onClick={() => navigate(-1)}>Back</BackButton>
      <h1 style={{ maxWidth: "80%" }}>Admin Registration</h1>
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
          <Label>Admin Key *</Label>
          <Input
            type="text"
            name="admin key"
            value={adminKey}
            onChange={(e) => {
              setAdminKey(e.target.value);
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
