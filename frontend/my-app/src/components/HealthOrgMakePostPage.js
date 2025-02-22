import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Box } from "@mui/material";
import supportedLanguages from "../assets/supported_languages.json";
import config from "../config";
import { PostsChangeContext } from "./HealthOrg";
import translations from "../assets/translations.json";
import { LanguageContext } from "../App";
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
export default function HealthOrgMakePostPage() {
  const navigate = useNavigate();
  const { postsChange, setPostsChange } = useContext(PostsChangeContext);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const { language } = useContext(LanguageContext);
  const lang = translations[language];

  const handleSubmit = async () => {
    const response = await fetch(`${config.SERVER_URL}/health_org/make_post`, {
      method: "POST",
      body: JSON.stringify({
        auth_token: localStorage.getItem("auth_token"),
        title,
        description,
        location,
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
          alert("No title provided");
          return;
        } else if (error_id === 3) {
          alert("No Description provided");
          return;
        }
      }
    } else {
      setPostsChange(!postsChange);
      navigate(-1);
    }
  };

  return (
    <RegistrationContainer>
      <BackButton onClick={() => navigate(-1)}>Back</BackButton>
      <h1 style={{ maxWidth: "80%" }}>New Post</h1>
      <Form>
        <InputGroup>
          <Label>Title *</Label>
          <Input
            type="text"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>Location</Label>
          <Input
            type="text"
            name="title"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
            }}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>Description *</Label>
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

        <Box>
          <NextButton type="button" onClick={handleSubmit}>
            Post
          </NextButton>
        </Box>
      </Form>
    </RegistrationContainer>
  );
}
