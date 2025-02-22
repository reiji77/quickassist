import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BasicPageLayout from "./BasicPageLayout";
import translations from "../assets/translations.json";
import supportedLanguages from "../assets/supported_languages.json";

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

const LanguageSelector = styled.select`
  padding: 5px;
  margin-right: 10px;
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
  box-sizing: border-box;
`;

const Label = styled.label`
  font-size: 14px;
  color: #333;
  margin-top: 10px;
  display: block;
`;

const SelectField = styled.select`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
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

const EmergencyContactsBox = styled.div`
  border: 1px solid #ccc;
  padding: 20px;
  margin-top: 20px;
`;

const ContactList = styled.div`
  margin-top: 10px;
`;

const ContactItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
`;

const ContactButton = styled.button`
  padding: 5px 10px;
  margin-left: 5px;
  font-size: 14px;
  cursor: pointer;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
  resize: vertical;
  height: 100px;
`;

export default function UserEditInfo() {
  const { language, setLanguage } = useContext(LanguageContext);
  const lang = translations[language]?.EditInfo || {
    Title: "Edit Information",
    FirstName: "First Name",
    LastName: "Last Name",
    Sex: "Sex",
    PhoneNumber: "Phone Number",
    Language: "Language",
    Address: "Address",
    Suburb: "Suburb",
    Postcode: "Postcode",
    DOB: "Date of Birth (DD/MM/YYYY)",
    CurrentMedicalConditions: "Current Medical Conditions",
    CurrentMedications: "Current Medications",
    OtherMedicalInfo: "Other Medical Information",
    EmergencyContacts: "Emergency Contacts",
    SubmitButton: "Submit",
    UpdateSuccess: "Information updated successfully.",
    UpdateFailed: "Failed to update information.",
    BackButton: "Back",
    NotSet: "Not set",
    AddContact: "Add Contact",
    Edit: "Edit",
    Done: "Done",
    Delete: "Delete",
  };

  const [formData, setFormData] = useState({ language });
  const [error, setError] = useState("");
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [editingContactIndex, setEditingContactIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${config.SERVER_URL}/user/get_details?auth_token=${token}`,
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
          setFormData(userData);
          setContacts(userData.emergency_contacts || []);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      language: language,
    }));
  }, [language]);

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;

    setFormData((prevData) => ({
      ...prevData,
      language: selectedLanguage,
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setNewContact((prev) => ({ ...prev, [name]: value }));
  };

  const addOrUpdateContact = () => {
    if (editingContactIndex !== null) {
      const updatedContacts = [...contacts];
      updatedContacts[editingContactIndex] = newContact;
      setContacts(updatedContacts);
      setEditingContactIndex(null);
    } else {
      setContacts([...contacts, newContact]);
    }
    setNewContact({ first_name: "", last_name: "", phone_number: "" });
  };

  const editContact = (index) => {
    setNewContact(contacts[index]);
    setEditingContactIndex(index);
  };

  const deleteContact = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filteredData = {
      ...formData,
      emergency_contacts: contacts,
    };

    try {
      const response = await fetch(`${config.SERVER_URL}/user/edit-info`, {
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
        setError("");
        alert(lang.UpdateSuccess);
        localStorage.setItem("language_chosen", formData.language);
        setLanguage(formData.language);
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
          <Label>{lang.FirstName + "*"}</Label>
          <InputField
            name="first_name"
            placeholder={lang.FirstName}
            value={formData.first_name || ""}
            onChange={handleChange}
          />
          <Label>{lang.LastName + "*"}</Label>
          <InputField
            name="last_name"
            placeholder={lang.LastName}
            value={formData.last_name || ""}
            onChange={handleChange}
          />
          <Label>{lang.Sex}</Label>
          <SelectField
            name="sex"
            value={formData.sex || ""}
            onChange={handleChange}
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </SelectField>
          <Label>{lang.PhoneNumber}</Label>
          <InputField
            name="phone_number"
            placeholder={lang.PhoneNumber}
            value={formData.phone_number || ""}
            onChange={handleChange}
          />
          <Label>{lang.Language}</Label>
          <SelectField
            name="language"
            value={formData.language || ""}
            onChange={handleLanguageChange} // This function sets both language state and formData.
          >
            {supportedLanguages.map(([langName, langCode]) => (
              <option key={langName} value={langName}>
                {`${langName} (${langCode})`}{" "}
                {/* This displays both the name and abbreviation */}
              </option>
            ))}
          </SelectField>

          <Label>{lang.Address + "*"}</Label>
          <InputField
            name="address"
            placeholder={lang.Address}
            value={formData.address || ""}
            onChange={handleChange}
          />
          <Label>{lang.Suburb + "*"}</Label>
          <InputField
            name="suburb"
            placeholder={lang.Suburb}
            value={formData.suburb || ""}
            onChange={handleChange}
          />
          <Label>{lang.Postcode + "*"}</Label>
          <InputField
            name="postcode"
            placeholder={lang.Postcode}
            value={formData.postcode || ""}
            onChange={handleChange}
          />
          <Label>{lang.DOB + "*"}</Label>
          <InputField
            name="DOB"
            placeholder={lang.DOB}
            value={formData.DOB || ""}
            onChange={handleChange}
          />

          <Label>
            {lang.CurrentMedicalConditions || "Current Medical Conditions"}
          </Label>
          <TextArea
            name="current_medical_conditions"
            placeholder={
              lang.CurrentMedicalConditions ||
              "Enter current medical conditions"
            }
            value={formData.current_medical_conditions || ""}
            onChange={handleChange}
          />

          <Label>{lang.CurrentMedications || "Current Medications"}</Label>
          <TextArea
            name="current_medications"
            placeholder={lang.CurrentMedications || "Enter current medications"}
            value={formData.current_medications || ""}
            onChange={handleChange}
          />

          <Label>{lang.OtherMedicalInfo || "Other Medical Information"}</Label>
          <TextArea
            name="other_medical_info"
            placeholder={
              lang.OtherMedicalInfo || "Enter other medical information"
            }
            value={formData.other_medical_info || ""}
            onChange={handleChange}
          />

          <EmergencyContactsBox>
            <h3>{lang.EmergencyContacts}</h3>
            <ContactList>
              {contacts.map((contact, index) => (
                <ContactItem key={index}>
                  <div>
                    {contact.first_name} {contact.last_name} -{" "}
                    {contact.phone_number}
                  </div>
                  <div>
                    <ContactButton
                      type="button"
                      onClick={() => editContact(index)}
                    >
                      {lang.Edit}
                    </ContactButton>
                    <ContactButton
                      type="button"
                      onClick={() => deleteContact(index)}
                    >
                      {lang.Delete}
                    </ContactButton>
                  </div>
                </ContactItem>
              ))}
            </ContactList>

            <h4>
              {editingContactIndex !== null ? lang.Edit : lang.AddContact}
            </h4>
            <InputField
              name="first_name"
              placeholder="First Name"
              value={newContact.first_name}
              onChange={handleContactChange}
            />
            <InputField
              name="last_name"
              placeholder="Last Name"
              value={newContact.last_name}
              onChange={handleContactChange}
            />
            <InputField
              name="phone_number"
              placeholder="Phone Number"
              value={newContact.phone_number}
              onChange={handleContactChange}
            />
            <ContactButton type="button" onClick={addOrUpdateContact}>
              {editingContactIndex !== null ? lang.Done : lang.AddContact}
            </ContactButton>
          </EmergencyContactsBox>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <SubmitButton type="submit">{lang.SubmitButton}</SubmitButton>
        </form>
      </FormContainer>
    </BasicPageLayout>
  );
}
