import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { isLoggedIn } from "../utils/authHelpers";
import { Navigate } from "react-router-dom";
import { LanguageContext } from "../App";
import { useContext, useEffect } from "react";
import { getTokenPayload } from "../utils/authHelpers";

export default function ProtectedRoute() {
  const { setLanguage } = useContext(LanguageContext);
  const location = useLocation();
  const splitPaths = location.pathname.split("/");
  const userType = splitPaths[1];

  if (isLoggedIn()) {
    let payload = getTokenPayload(localStorage["auth_token"]);
    let type = payload["account_type"];
    if ("Notification" in window) {
      if (Notification.permission !== "granted") {
        // ask the user for permission
        Notification.requestPermission();
      }
    }

    if (type !== userType) {
      return <Navigate to={`/${type}/home`} />;
    }
    return <Outlet />;
  } else {
    return <Navigate to={"/"} />;
  }
}
