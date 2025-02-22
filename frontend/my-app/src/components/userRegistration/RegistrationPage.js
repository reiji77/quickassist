import React from "react";
import styled from "styled-components";
import translations from "../../assets/translations.json";
import { LanguageContext } from "../../App";
import { useContext } from "react";

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
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
    font-size: 16px;
    padding: 10px;
  }

  @media (min-width: 1200px) {
    width: 50%;
    font-size: 18px;
    padding: 12px;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 0px;
  margin-bottom: 10px;
  flex-direction: column;
`;

function RegistrationPage({ onChange, data }) {
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
          <Label>{lang ? lang.RegistrationPage.Sex : "Sex *"}</Label>
          <RadioGroup>
            <label>
              <input
                type="radio"
                name="sex"
                value="M"
                onChange={handleChange}
                checked={data.sex === "M"}
              />{" "}
              {lang ? lang.RegistrationPage.Male : "Male"}
            </label>
            <label>
              <input
                type="radio"
                name="sex"
                value="F"
                onChange={handleChange}
                checked={data.sex === "F"}
              />{" "}
              {lang ? lang.RegistrationPage.Female : "Female"}
            </label>
            <label>
              <input
                type="radio"
                name="sex"
                value="O"
                onChange={handleChange}
                checked={data.sex === "O"}
              />{" "}
              {lang ? lang.RegistrationPage.Other : "Other"}
            </label>
          </RadioGroup>
        </FieldWrapper>

        <FieldWrapper>
          <Label>{lang ? lang.RegistrationPage.DOB : "Date of Birth"} *</Label>
          <Input
            type="text"
            name="DOB"
            placeholder="DD/MM/YYYY"
            value={data.DOB || ""}
            onChange={handleChange}
            required
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>
            {lang ? lang.RegistrationPage.Address : "Street Address"} *
          </Label>
          <Input
            type="text"
            name="address"
            value={data.address || ""}
            onChange={handleChange}
            required
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>{lang ? lang.RegistrationPage.Suburb : "Suburb "}*</Label>
          <Input
            type="text"
            name="suburb"
            value={data.suburb || ""}
            onChange={handleChange}
            required
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>{lang ? lang.RegistrationPage.Postcode : "Postcode"} *</Label>
          <Input
            type="text"
            name="postcode"
            value={data.postcode || ""}
            onChange={handleChange}
            required
          />
        </FieldWrapper>
      </FormContainer>
    </form>
  );
}

export default RegistrationPage;
