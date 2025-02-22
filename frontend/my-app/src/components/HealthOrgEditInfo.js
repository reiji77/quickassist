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
  justify-content: space-between;
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

const Label = styled.label`
  font-size: 14px;
  color: #333;
  margin-top: 10px;
  display: block;
`;

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box; /* Ensures padding is included in width */
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box; /* Ensures padding is included in width */
  height: 150px; /* Adjust height as needed for a tall box */
  resize: vertical; /* Allows the user to resize vertically if needed */
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

export default function HealthOrgEditInfo() {
  const { language } = useContext(LanguageContext);
  const lang = translations[language]?.HealthOrgEditInfo || {
    Title: "Edit Health Organization Information",
    Name: "Name",
    Description: "Description",
    Url: "URL",
    SubmitButton: "Submit",
    UpdateSuccess: "Information updated successfully.",
    UpdateFailed: "Failed to update information.",
    BackButton: "Back",
    NotSet: "Not set",
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${config.SERVER_URL}/health_org/get_details?auth_token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const orgData = await response.json();
          setFormData({
            name: orgData.name || "",
            description: orgData.description || "",
            url: orgData.url || "",
          });
        } else {
        }
      } catch (err) {
        console.error("Error fetching organization data:", err);
      }
    };

    fetchOrgData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${config.SERVER_URL}/health_org/edit_info`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auth_token: localStorage.getItem("auth_token"),
            name: formData.name,
            description: formData.description,
            url: formData.url,
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setError("");
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

        <form onSubmit={handleSubmit}>
          <Label>{`${lang.Name}`}*</Label>
          <InputField
            name="name"
            placeholder={lang.Name}
            value={formData.name}
            onChange={handleChange}
          />
          <Label>{lang.Description}</Label>
          <TextArea
            name="description"
            placeholder={lang.Description}
            value={formData.description}
            onChange={handleChange}
          />
          <Label>{`${lang.Url}`}</Label>
          <InputField
            name="url"
            placeholder={lang.Url}
            value={formData.url}
            onChange={handleChange}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <SubmitButton type="submit">{lang.SubmitButton}</SubmitButton>
        </form>
      </FormContainer>
    </BasicPageLayout>
  );
}
