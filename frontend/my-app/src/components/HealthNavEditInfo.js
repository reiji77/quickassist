import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BasicPageLayout from "./BasicPageLayout";
import translations from "../assets/translations.json";
import { LanguageContext } from "../App";
import config from "../config";

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const HeaderControls = styled.div`
  display: flex;
  justify-content: flex-start; /* Aligns BackButton to the left */
  align-items: center;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  padding: 8px 15px;
  background-color: red;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box; /* Ensures padding is included in width */
`;

const Label = styled.label`
  font-size: 14px;
  color: #333;
  margin-top: 10px;
  display: block;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #0277bd;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
`;

export default function HealthNavEditInfo() {
  const { language } = useContext(LanguageContext);
  const lang = translations[language]?.HealthNavEditInfo || {
    Title: "Edit Information",
    FirstName: "First Name",
    LastName: "Last Name",
    Languages: "Languages",
    SubmitButton: "Submit",
    UpdateSuccess: "Information updated successfully.",
    UpdateFailed: "Failed to update information.",
    BackButton: "Back",
    NotSet: "Not set",
  };

  const [formData, setFormData] = useState({ languages: [] });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${config.SERVER_URL}/health_navigator/get_details?auth_token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setFormData({
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            languages: userData.languages || [],
          });
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchData();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${config.SERVER_URL}/health_navigator/edit_info`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auth_token: localStorage.getItem("auth_token"),
            ...formData,
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        alert(lang.UpdateSuccess);
      } else {
        const result = await response.json();
        setError(result.message || lang.UpdateFailed);
      }
    } catch (err) {
      setError(lang.UpdateFailed);
    }
  };

  return (
    <BasicPageLayout title={lang.Title}>
      <FormContainer>
        <HeaderControls>
          <BackButton onClick={handleBack}>{lang.BackButton}</BackButton>
        </HeaderControls>

        <h2>{lang.Title}</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={handleSubmit}>
          <Label>{lang.FirstName}</Label>
          <InputField
            name="first_name"
            placeholder={lang.FirstName}
            value={formData.first_name || ""}
            onChange={handleChange}
          />
          <Label>{lang.LastName}</Label>
          <InputField
            name="last_name"
            placeholder={lang.LastName}
            value={formData.last_name || ""}
            onChange={handleChange}
          />

          <Label>{lang.Languages}</Label>
          <div>
            {formData.languages.length > 0
              ? formData.languages.join(", ")
              : lang.NotSet}
          </div>

          <SubmitButton type="submit">{lang.SubmitButton}</SubmitButton>
        </form>
      </FormContainer>
    </BasicPageLayout>
  );
}
