import { createContext, useState, useContext } from "react";
import {
  Route,
  Routes,
  BrowserRouter,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import UserSettings from "./components/UserSettings";
import Home from "./components/Home";
import LanguageSelectionPage from "./components/LanguageSelectionPage";
import { isLoggedIn, getTokenPayload } from "./utils/authHelpers";
import HealthNavigatorHome from "./components/HealthNavigatorHome";
import UserHome from "./components/UserHome";
import AdminHome from "./components/AdminHome";
import AdminMyAccount from "./components/AdminMyAccount";
import HealthOrgHome from "./components/HealthOrgHome";
import ProtectedRoute from "./components/ProtectedRoute";
import UserHealthServices from "./components/UserHealthServices";
import UserMyAccount from "./components/UserMyAccount";
import { UserProvider } from "./components/UserContext"; // Import UserProvider for global state
import RegistrationFlow from "./components/userRegistration/RegistrationFlow";
import EmergencyChat from "./components/EmergencyChat";
import ChangePassword from "./components/ChangePassword";
import HealthNavigatorMyAccount from "./components/HealthNavigatorMyAccount";
import HealthNavEditInfo from "./components/HealthNavEditInfo";
import ChangeEmail from "./components/ChangeEmail";

import EmergencyVideoCall from "./components/EmergencyVideoCall";
import RegisterOptions from "./components/RegisterOptions";
import HealthOrgMyAccount from "./components/HealthOrgMyAccount";
import HealthOrgEditInfo from "./components/HealthOrgEditInfo";

import RegistrationPage from "./components/userRegistration/RegistrationPage";
import Registration0Page from "./components/userRegistration/Registration0Page";
import MedInfoPage from "./components/userRegistration/MedInfoPage";
import EmergencyContact from "./components/userRegistration/EmergencyContact";
import VerificationPage from "./components/userRegistration/VerificationPage";
import User from "./components/User";
import HealthNavigator from "./components/HealthNavigator";
import HealthNavRegistration from "./components/HealthNavRegistration";
import EmergencyRequest from "./components/EmergencyRequest";
import UserEditInfo from "./components/UserEditInfo";
import AdminEditInfo from "./components/AdminEditInfo";
import HealthOrgRegistration from "./components/HealthOrgRegistration";
import HealthOrg from "./components/HealthOrg";
import HealthOrgMakePostPage from "./components/HealthOrgMakePostPage";
import AdminRegistration from "./components/AdminRegistration";
import UnprotectedRoute from "./components/UnprotectedRoute";
export const LanguageContext = createContext(
  localStorage.getItem("language_chosen")
    ? localStorage.getItem("language_chosen")
    : "English"
);

function App() {
  const [language, setLanguage] = useState(useContext(LanguageContext));

  return (
    <UserProvider>
      <LanguageContext.Provider value={{ language, setLanguage }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route element={<UnprotectedRoute />}>
              <Route
                path="/language-selection"
                element={<LanguageSelectionPage />}
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register_options" element={<RegisterOptions />} />
              <Route
                path="/health_org_registration"
                element={<HealthOrgRegistration />}
              />
              <Route
                path="/admin_registration"
                element={<AdminRegistration />}
              />

              <Route path="/registration" element={<RegistrationFlow />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/user" element={<User />}>
                <Route path="home" element={<UserHome />} />
                <Route path="settings" element={<UserSettings />} />
                <Route path="my_account" element={<UserMyAccount />} />
                <Route
                  path="my_account/change_password"
                  element={<ChangePassword />}
                />
                <Route path="my_account/edit_info" element={<UserEditInfo />} />
                <Route
                  path="my_account/change_email"
                  element={<ChangeEmail />}
                />

                <Route
                  path="health_services"
                  element={<UserHealthServices />}
                />
                <Route
                  path="emergency_request"
                  element={<EmergencyRequest />}
                />
                <Route path="emergency_chat" element={<EmergencyChat />} />
                <Route
                  path="emergency_video_call"
                  element={<EmergencyVideoCall />}
                />
              </Route>

              <Route path="/health_navigator" element={<HealthNavigator />}>
                <Route path="home" element={<HealthNavigatorHome />} />
                <Route path="settings" element={<UserSettings />} />
                <Route
                  path="my_account"
                  element={<HealthNavigatorMyAccount />}
                />
                <Route
                  path="my_account/change_password"
                  element={<ChangePassword />}
                />
                <Route
                  path="my_account/edit_info"
                  element={<HealthNavEditInfo />}
                />
                <Route
                  path="my_account/change_email"
                  element={<ChangeEmail />}
                />

                <Route path="emergency_chat" element={<EmergencyChat />} />
                <Route
                  path="emergency_video_call"
                  element={<EmergencyVideoCall />}
                />
              </Route>

              <Route path="/health_org" element={<HealthOrg />}>
                <Route path="home" element={<HealthOrgHome />} />
                <Route path="my_account" element={<HealthOrgMyAccount />} />
                <Route
                  path="my_account/change_password"
                  element={<ChangePassword />}
                />
                <Route
                  path="my_account/edit_info"
                  element={<HealthOrgEditInfo />}
                />
                <Route
                  path="my_account/change_email"
                  element={<ChangeEmail />}
                />
                <Route path="settings" element={<UserSettings />} />
                <Route path="make_post" element={<HealthOrgMakePostPage />} />
              </Route>

              <Route path="/admin">
                <Route path="home" element={<AdminHome />} />
                <Route path="my_account" element={<AdminMyAccount />} />
                <Route
                  path="my_account/change_password"
                  element={<ChangePassword />}
                />
                <Route
                  path="my_account/edit_info"
                  element={<AdminEditInfo />}
                />
                <Route
                  path="my_account/change_email"
                  element={<ChangeEmail />}
                />
                <Route path="settings" element={<UserSettings />} />
                <Route
                  path="register-health-navigator"
                  element={<HealthNavRegistration />}
                />
              </Route>
            </Route>
            <Route path="*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </LanguageContext.Provider>
    </UserProvider>
  );
}

export default App;
