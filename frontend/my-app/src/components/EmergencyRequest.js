import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import { createContext, useState, useEffect, useContext } from "react";
import config from "../config";
import { io } from "socket.io-client";
import WaitingPage from "./WaitingPage";
import styled from "styled-components";
import translations from "../assets/translations.json";
import { LanguageContext } from "../App";

const CancelButton = styled.button`
  background-color: #0277bd;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  width: 100%;
  max-width: 100px;
  font-size: 15px;

  margin-top: 20px;
`;

export default function EmergencyRequest() {
  const { language } = useContext(LanguageContext);
  const lang = translations[language];
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (state == null) {
      navigate("/user/home");
      return;
    }

    const { mode } = state;
    const emergencyRequestSocket = io(
      `${config.SERVER_URL}/user-emergency-request`,
      {
        query: { auth_token: localStorage.getItem("auth_token"), mode },
        withCredentials: true,
        autoConnect: false,
      }
    );
    emergencyRequestSocket.connect();
    emergencyRequestSocket.on("request_accepted", (data) => {
      if (mode === "chat") {
        navigate("/user/emergency_chat", {
          state: {
            roomId: data["request_id"],
            userDetails: data["user_details"],
          },
        });
      } else if (mode === "video call") {
        navigate("/user/emergency_video_call", {
          state: {
            roomId: data["request_id"],
            userDetails: data["user_details"],
          },
        });
      }
    });

    return () => {
      emergencyRequestSocket.off();
      emergencyRequestSocket.disconnect();
    };
  }, []);
  return (
    <WaitingPage>
      <p style={{ textAlign: "center" }}>
        {lang
          ? lang.EmergencyRequest.WaitingPage
          : `Please wait while we connect you to one of our ${localStorage.getItem("language_chosen")} speaking health navigators...`}
      </p>

      <CancelButton
        onClick={() => {
          navigate("/user/home");
        }}
      >
        {" "}
        {lang ? lang.EmergencyRequest.CancelButton : "Cancel"}
      </CancelButton>
    </WaitingPage>
  );
}
