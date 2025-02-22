import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import translations from "../assets/translations.json";
import { LanguageContext } from "../App";
import { useContext } from "react";

const BasicFlexBox = styled.div`
  height: 100vh;
  background-color: #c6e8d6;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  justify-content: space-between;
`;
const Header = styled.div`
  display: flex;
  height: 20%;
  align-items: center;
  justify-content: center;
  background-color: #0d99ff;
  color: white;
  font-weight: bold;
  font-size: 20px;
  flex-shrink: 0;
  @media (min-width: 600px) {
    font-size: 24px;
  }
  @media (min-width: 1000px) {
    font-size: 30px;
  }
`;

const NavBarContainer = styled.div`
  display: flex;
  height: 7%;
  justify-content: space-evenly;
  flex-shrink: 0;

  background-color: #0d99ff;
  color: white;
  font-weight: bold;
  align-items: center;
`;

const ChildrenContainer = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
`;

const NavBar = ({ userType, handleNavBarClicks }) => {
  const { language } = useContext(LanguageContext);
  const lang = translations[language];
  const navBarLinks = {
    user: ["Home", "My Account", "Health Services", "Settings"],
    admin: ["Home", "My Account", "Settings"],
    health_navigator: ["Home", "My Account", "Settings"],
    health_org: ["Home", "My Account", "Settings"],
  };

  return (
    <NavBarContainer>
      {navBarLinks[userType].map((link) => {
        return (
          <Links onClick={handleNavBarClicks} id={link} key={link}>
            {lang ? lang.navBarLinks[link] : link}
          </Links>
        );
      })}
    </NavBarContainer>
  );
};

const linkToRoutes = {
  Home: "home",
  "My Account": "my_account",
  "Health Services": "health_services",
  Settings: "settings",
};

const routeToLink = {
  home: "Home",
  my_account: "My Account",
  health_services: "Health Services",
  settings: "Settings",
};

const typePrettyPrint = {
  admin: "Admin",
  health_org: "Health Organisation",
  user: "User",
  health_navigator: "Health Navigator",
};

const Links = styled.span`
  padding: 2px;
  cursor: pointer;
  font-size: 12px;
  @media (min-width: 470px) {
    padding: 8px;
  }
  @media (min-width: 800px) {
    font-size: 20px;
  }
  &:hover {
    background-color: navy;
  }
`;
const UserType = styled.span`
  color: #000072;
  position: absolute;
  font-weight: bold;
  left: 5px;
  top: 5px;
  font-size: 20px;
  max-width: 40%;
  @media (min-width: 600px) {
    font-size: 24px;
    left: 15px;
    top: 15px;
  }
  @media (min-width: 1000px) {
    font-size: 40px;
  }
`;

export default function BasicPageLayout({ children }) {
  // the basic layout for all pages have a nav bar and header
  // i.e user home page, user my account, health navigator home
  // Assumes  pathname is   prefixed by one of the following
  // [/{user_type}/home/, /{user_type}/settings/, /{user_type}/my_account/, user/health_services/]
  // where {user_type} is any one of the following [user, admin, health_navigator, health_org]

  const location = useLocation();
  const navigate = useNavigate();
  const splitPaths = location.pathname.split("/");
  const userType = splitPaths[1];
  const { language } = useContext(LanguageContext);
  const lang = translations[language];

  let mainSubPage = routeToLink[splitPaths[2]];

  function handleNavBarClicks(e) {
    navigate(`/${userType}/${linkToRoutes[e.target.id]}`);
  }

  return (
    <BasicFlexBox>
      <UserType>{typePrettyPrint[userType]}</UserType>
      <Header>{lang ? lang.subPages[mainSubPage] : mainSubPage}</Header>
      <ChildrenContainer>{children}</ChildrenContainer>
      <NavBar userType={userType} handleNavBarClicks={handleNavBarClicks} />
    </BasicFlexBox>
  );
}
