import React, { useState, useContext } from "react";
import styled from "styled-components";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import translations from "../../assets/translations.json";
import { LanguageContext } from "../../App";

// Styled components
const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 30px;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  box-sizing: border-box;
  max-width: 400px;
  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

const Label = styled.p`
  margin: 0px;
  line-height: normal;
  font-weight: initial;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;

  margin-top: 10px;
`;
const AddContactButton = styled.button`
  background-color: ${(props) => (props.cancel ? "#ff4d4d" : "#0d99ff")};
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 25%;
  max-width: 200px;
  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

const Button = styled.button`
  background-color: ${(props) => (props.cancel ? "#ff4d4d" : "#0277bd")};
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 25%;
  max-width: 200px;
  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

function EmergencyContact({ data, onChange, onSubmit }) {
  const { language } = useContext(LanguageContext);
  const lang = translations[language];

  const [contact, setContact] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact({ ...contact, [name]: value });
  };

  const handleAddContact = () => {
    if (contact.first_name && contact.last_name && contact.phone_number) {
      const updatedContacts = [...(data.emergency_contacts || []), contact];
      onChange({ emergency_contacts: updatedContacts });
      setContact({ first_name: "", last_name: "", phone_number: "" });
    } else {
      alert(
        lang
          ? lang.RegistrationFlow.AlertFillFields
          : "Please fill in all contact fields."
      );
    }
  };

  const handleRemoveContact = (index) => {
    const updatedContacts = data.emergency_contacts.filter(
      (_, i) => i !== index
    );
    onChange({ emergency_contacts: updatedContacts });
  };

  return (
    <>
      <Form>
        <p style={{ maxWidth: "80%", lineHeight: "initial" }}>
          {lang
            ? lang.EmergencyContacts.FormTitle
            : "Emergency Contacts (we will inform these contacts whenever you request emergency assistance)"}
        </p>
        {data.emergency_contacts && data.emergency_contacts.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexDirection: "column",
                marginBottom: "25px",
              }}
            >
              {data.emergency_contacts.map((contact, index) => (
                <div>
                  <span
                    style={{ color: "gray", lineHeight: "initial" }}
                    key={index}
                  >
                    {contact.first_name} {contact.last_name} -{" "}
                    {contact.phone_number}
                  </span>
                  <span
                    style={{ color: "red", cursor: "pointer" }}
                    onClick={() => handleRemoveContact(index)}
                  >
                    {"\u00A0"} X
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
        <InputGroup>
          <Label>
            {lang
              ? lang.EmergencyContacts.ContactFirstName
              : "Contact First Name"}{" "}
            *
          </Label>
          <Input
            type="text"
            name="first_name"
            value={contact.first_name}
            onChange={handleChange}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>
            {lang
              ? lang.EmergencyContacts.ContactLastName
              : "Contact Last Name"}{" "}
            *
          </Label>
          <Input
            type="text"
            name="last_name"
            value={contact.last_name}
            onChange={handleChange}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>
            {lang
              ? lang.EmergencyContacts.ContactPhoneNumber
              : "Contact Phone Number"}{" "}
            *
          </Label>
          <Input
            type="text"
            name="phone_number"
            value={contact.phone_number}
            onChange={handleChange}
            required
          />
        </InputGroup>
        <ButtonGroup>
          <AddContactButton type="button" onClick={handleAddContact}>
            {lang ? lang.EmergencyContacts.AddContact : "Add Contact"}
          </AddContactButton>
        </ButtonGroup>
      </Form>
      <Button type="button" onClick={onSubmit}>
        {lang ? lang.EmergencyContacts.Next : "Next"}
      </Button>
    </>
  );
}

export default EmergencyContact;
