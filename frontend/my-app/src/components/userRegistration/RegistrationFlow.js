import React, { useState, useContext, useEffect } from "react";
import Registration0Page from "./Registration0Page";
import RegistrationPage from "./RegistrationPage";
import MedInfoPage from "./MedInfoPage";
import EmergencyContact from "./EmergencyContact";
import VerificationPage from "./VerificationPage";
import RegistrationPageLayout from "./RegistrationPageLayout";
import config from "../../config";
import { LanguageContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import WaitingPage from "../WaitingPage";
import translations from "../../assets/translations.json";

function RegistrationFlow() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const ref = useRef(null);
  const [showWaitingPage, setShowWaitingPage] = useState(false);
  const lang = translations[language];

  const [stepIndex, setStepIndex] = useState(0);
  const [registrationData, setRegistrationData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    reEnterPassword: "",
    sex: "",
    language: language,
    DOB: "",
    address: "",
    suburb: "",
    postcode: "",
    current_medical_conditions: "",
    current_medications: "",
    other_medical_info: "",
    emergency_contacts: [],
  });

  const steps = [
    {
      component: (
        <Registration0Page
          data={registrationData}
          onChange={handleDataChange}
        />
      ),
      title: lang
        ? lang.RegistrationFlow.UserRegistration
        : "User Registration",
    },
    {
      component: (
        <RegistrationPage data={registrationData} onChange={handleDataChange} />
      ),
      title: lang
        ? lang.RegistrationFlow.UserRegistration
        : "User Registration",
    },
    {
      component: (
        <MedInfoPage data={registrationData} onChange={handleDataChange} />
      ),
      title: lang
        ? lang.RegistrationFlow.UserRegistration
        : "User Registration",
    },
    {
      component: (
        <EmergencyContact
          data={registrationData}
          onChange={handleDataChange}
          onSubmit={handleFinalSubmit}
        />
      ),
      title: lang
        ? lang.RegistrationFlow.UserRegistration
        : "User Registration",
    },
    {
      component: <VerificationPage />,
      title: lang
        ? lang.RegistrationFlow.UserRegistration
        : "User Registration",
    },
  ];

  function handleDataChange(updatedData) {
    setRegistrationData((prevData) => ({
      ...prevData,
      ...updatedData,
    }));
  }

  function checkPasswordValid(password, first_name, last_name) {
    let error_id = -1;

    if (password.length < 8) {
      error_id = 5;
    }
    if (
      !(
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password)
      )
    ) {
      error_id = 6;
    }

    if (password.toLowerCase().includes(first_name.toLowerCase())) {
      error_id = 7;
    }

    if (password.toLowerCase().includes(last_name.toLowerCase())) {
      error_id = 8;
    }

    return error_id;
  }

  async function checkEmailAlreadyRegistered(email) {
    try {
      const response = await fetch(
        `${config.SERVER_URL}/email-already-registered?email=${encodeURIComponent(email)}`
      );
      const result = await response.json();
      return result.is_registered;
    } catch (error) {
      console.error("Error checking if email is registered:", error);
      return -1;
    }
  }

  async function validateCurrentStep() {
    const requiredFieldsByStep = [
      ["first_name", "last_name", "email", "password", "reEnterPassword"], // Registration0Page required fields
      ["sex", "DOB", "address", "suburb", "postcode"], // RegistrationPage required fields
      [], // MedInfoPage has no required fields
      ["emergency_contacts"], // EmergencyContact page has at least one contact required
    ];

    const currentRequiredFields = requiredFieldsByStep[stepIndex];
    for (const field of currentRequiredFields) {
      if (
        !registrationData[field] ||
        (Array.isArray(registrationData[field]) &&
          registrationData[field].length === 0)
      ) {
        alert(
          lang
            ? lang.RegistrationFlow.AlertFillFields
            : `Please fill in the required field: ${field}`
        );
        return false; // Stop if a required field is missing
      }
    }

    if (stepIndex === 0) {
      if (registrationData.password !== registrationData.reEnterPassword) {
        alert(
          lang ? lang.RegistrationFlow.PasswordMatch : "Passwords do not match."
        );
        return false;
      }

      const isEmailRegistered = await checkEmailAlreadyRegistered(
        registrationData.email
      );
      if (isEmailRegistered === -1) {
        alert("couldn't connect to server to check if email is registered");
        return false;
      }
      if (isEmailRegistered) {
        alert(
          lang
            ? lang.RegistrationFlow.EmailRegistered
            : "This email is already registered. Please use a different email."
        );
        return false;
      }

      const error_id = checkPasswordValid(
        registrationData.password,
        registrationData.first_name,
        registrationData.last_name
      );

      if (error_id === 5) {
        alert(
          lang
            ? lang.RegistrationFlow.PasswordCharacters
            : "Password must be at least 8 characters long."
        );
        return false;
      }
      if (error_id === 6) {
        alert(
          lang
            ? lang.RegistrationFlow.PasswordCaseNumber
            : "Password must contain an upper case, lowercase and number."
        );
        return false;
      }
      if (error_id === 7) {
        alert(
          lang
            ? lang.RegistrationFlow.PasswordFirstName
            : "Password cannot contain your first name."
        );
        return false;
      }
      if (error_id === 8) {
        alert(
          lang
            ? lang.RegistrationFlow.PasswordLastName
            : "Password cannot contain your last name."
        );
        return false;
      }
    }
    if (stepIndex == 1) {
      registrationData.DOB = registrationData.DOB.trim();
      if (
        !/^([0-2][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/.test(
          registrationData.DOB
        )
      ) {
        alert(
          lang
            ? lang.RegistrationFlow.InvalidDOB
            : "date of birth is not a valid date. Make sure you enter the date in the specified format"
        );
        return false;
      }
      const date_split = registrationData.DOB.split("/");
      let day = date_split[0];
      let month = date_split[1];
      let year = date_split[2];
      const date = new Date(`${month}/${day}/${year}`);
      if (isNaN(date)) {
        alert(
          lang
            ? lang.RegistrationFlow.InvalidDOB
            : "date of birth is not a valid date. Make sure you enter the date in the specified format"
        );
        return false;
      }

      day = date.getDate();
      month = date.getMonth() + 1;
      year = date.getFullYear();
      if (day < 10) day = "0" + day;
      if (month < 10) month = "0" + month;
      if (year < 1000) year = "0" + year;

      registrationData.DOB = `${day}/${month}/${year}`;
    }

    return true;
  }

  async function handleNext() {
    const isValid = await validateCurrentStep();

    if (isValid) {
      if (stepIndex < steps.length - 1) {
        setStepIndex(stepIndex + 1);
      }
      window.scrollTo(0, 0);
    }
  }

  function handleBack() {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
    window.scrollTo(0, 0);
  }

  function handleBackFirstPage() {
    navigate(-1);
  }

  async function handleFinalSubmit() {
    setShowWaitingPage(true);

    try {
      const response = await fetch(
        `${config.SERVER_URL}/user/register-request`,
        {
          method: "POST",
          credentials: "include",
          body: JSON.stringify(registrationData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setShowWaitingPage(false);
        setStepIndex(stepIndex + 1);
      } else {
        setShowWaitingPage(false);
        const errorData = await response.json();
        console.error("Fetch error:", errorData);

        alert(errorData?.error_id || "Registration failed.");
      }
    } catch (error) {
      setShowWaitingPage(false);
      console.error("Fetch failed:", error);

      alert(
        lang
          ? lang.RegistrationFlow.TryAgain
          : "Failed to send request. Please try again."
      );
    }
  }

  return (
    <>
      {showWaitingPage ? (
        <WaitingPage>
          <h3>
            {" "}
            {lang
              ? lang.RegistrationFlow.RegisteringAccount
              : "Registering your account... "}
          </h3>
        </WaitingPage>
      ) : (
        <RegistrationPageLayout
          title={steps[stepIndex].title}
          onNext={stepIndex < steps.length - 2 ? handleNext : null}
          onBack={
            stepIndex > 0
              ? handleBack
              : stepIndex === 0
                ? handleBackFirstPage
                : null
          }
        >
          {steps[stepIndex].component}
        </RegistrationPageLayout>
      )}
    </>
  );
}

export default RegistrationFlow;
