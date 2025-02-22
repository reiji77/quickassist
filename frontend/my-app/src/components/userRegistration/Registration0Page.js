import React from "react";
import styled from "styled-components";
import translations from "../../assets/translations.json";
import { LanguageContext } from "../../App";
import { useContext } from "react";

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;

  @media (min-width: 480px) {
    width: 90%;
    padding: 10px;
  }

  @media (min-width: 768px) {
    width: 60%;
    font-size: 12px;
    padding: 10px;
  }

  @media (min-width: 1200px) {
    width: 50%;
    font-size: 16px;
    padding: 12px;
  }
`;

function Registration0Page({ data, onChange }) {
  const { language } = useContext(LanguageContext);
  const lang = translations[language];
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <form>
      <FormContainer>
        <FieldWrapper>
          <Label>
            {lang ? lang.Registration0Page.FirstName : "First name *"}
          </Label>
          <Input
            type="text"
            name="first_name"
            value={data.first_name || ""}
            onChange={handleChange}
            required
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>
            {lang ? lang.Registration0Page.LastName : "Last name *"}
          </Label>
          <Input
            type="text"
            name="last_name"
            value={data.last_name || ""}
            onChange={handleChange}
            required
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>{lang ? lang.Registration0Page.Email : "Email *"}</Label>
          <Input
            type="email"
            name="email"
            value={data.email || ""}
            onChange={handleChange}
            required
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>
            {lang ? lang.Registration0Page.MobileNumber : "Mobile Number"}
          </Label>
          <Input
            type="text"
            name="phone_number"
            value={data.phone_number || ""}
            onChange={handleChange}
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>{lang ? lang.Registration0Page.Password : "Password *"}</Label>
          <Input
            type="password"
            name="password"
            value={data.password || ""}
            onChange={handleChange}
            required
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>
            {lang ? lang.Registration0Page.RePassword : "Re-enter password *"}
          </Label>
          <Input
            type="password"
            name="reEnterPassword"
            value={data.reEnterPassword || ""}
            onChange={handleChange}
            required
          />
        </FieldWrapper>
      </FormContainer>
    </form>
  );
}

export default Registration0Page;
