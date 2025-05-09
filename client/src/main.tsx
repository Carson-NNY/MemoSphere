import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import fonts
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/500-italic.css";

// Import font awesome for icons
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBookOpen,
  faHome,
  faPenSquare,
  faCalendar,
  faChartLine,
  faHeart,
  faUserGroup,
  faBars,
  faSearch,
  faMoon,
  faSun,
  faBell,
  faPlus,
  faCog,
  faQuoteLeft,
  faFaceSmile,
  faLock,
  faGlobe,
  faStar,
  faEllipsisVertical,
  faImage,
  faRobot,
  faClockRotateLeft,
  faCheckCircle,
  faCircleHalfStroke,
  faFaceMeh,
  faFaceSadTear,
  faFaceAngry,
  faFaceLaughBeam,
  faFaceGrimace,
  faFaceMehBlank,
  faBrain,
  faLightbulb,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

// Add all icons to the library
library.add(
  faBookOpen,
  faHome,
  faPenSquare,
  faCalendar,
  faChartLine,
  faHeart,
  faUserGroup,
  faBars,
  faSearch,
  faMoon,
  faSun,
  faBell,
  faPlus,
  faCog,
  faQuoteLeft,
  faFaceSmile,
  faLock,
  faGlobe,
  faStar,
  faEllipsisVertical,
  faImage,
  faRobot,
  faClockRotateLeft,
  faCheckCircle,
  faCircleHalfStroke,
  faFaceMeh,
  faFaceSadTear,
  faFaceAngry,
  faFaceLaughBeam,
  faFaceGrimace,
  faFaceMehBlank,
  faBrain,
  faLightbulb,
  faCheck
);

createRoot(document.getElementById("root")!).render(<App />);
