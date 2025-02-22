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

export default function AdminEditInfo() {
  const { language } = useContext(LanguageContext);
  const lang = translations[language]?.AdminEditInfo || {
    Title: "Edit Admin Information",
    FirstName: "First Name",
    LastName: "Last Name",
    SubmitButton: "Submit",
    UpdateSuccess: "Information updated successfully.",
    UpdateFailed: "Failed to update information.",
    BackButton: "Back",
  };

  const [formData, setFormData] = useState({ first_name: "", last_name: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current admin data to pre-fill the form
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${config.SERVER_URL}/admin/get_details?auth_token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const adminData = await response.json();
          setFormData({
            first_name: adminData.first_name || "",
            last_name: adminData.last_name || "",
          });
        } else {
          console.error("Failed to fetch admin data");
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };

    fetchAdminData();
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

    const filteredData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value.trim() !== "")
    );

    try {
      const response = await fetch(`${config.SERVER_URL}/admin/edit_info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_token: localStorage.getItem("auth_token"),
          ...filteredData,
        }),
        credentials: "include",
      });

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
            value={formData.first_name}
            onChange={handleChange}
          />
          <Label>{lang.LastName}</Label>
          <InputField
            name="last_name"
            placeholder={lang.LastName}
            value={formData.last_name}
            onChange={handleChange}
          />
          <SubmitButton type="submit">{lang.SubmitButton}</SubmitButton>
        </form>
      </FormContainer>
    </BasicPageLayout>
  );
}
