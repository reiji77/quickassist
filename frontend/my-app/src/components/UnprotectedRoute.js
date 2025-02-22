import { isLoggedIn, getTokenPayload } from "../utils/authHelpers";
import { Navigate, useLocation, Outlet } from "react-router-dom";

export default function UnprotectedRoute() {
  const location = useLocation();

  if (isLoggedIn()) {
    let payload = getTokenPayload(localStorage["auth_token"]);
    let type = payload["account_type"];

    return <Navigate to={"/" + type + "/home"} />;
  } else if (!localStorage.getItem("language_chosen")) {
    if (location.pathname === "/language-selection") {
      return <Outlet />;
    } else {
      return <Navigate to={"/language-selection"} />;
    }
  } else {
    return <Outlet />;
  }
}
