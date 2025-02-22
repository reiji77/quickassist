import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    sex: "",
    language: "",
    phone_number: "",
    current_medical_conditions: [],
    current_medications: [],
    other_medical_info: "",
    address: "",
    dob: "",
    emergency_contacts: [],
  });

  // Update user data function
  const updateUserData = (newData) => {
    setUserData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  return (
    <UserContext.Provider value={{ userData, setUserData: updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};
