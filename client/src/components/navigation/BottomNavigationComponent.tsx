import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { Link } from "react-router-dom";

import './BottomNavigationComponent.css';
import { navigationConfig } from "./NavigationConfig";

export function BottomNavigationComponent() {
  return (<BottomNavigation showLabels className="bottom-navigation-menu">
      {navigationConfig.filter(x => x.mobile).map((x, i) => 
      <BottomNavigationAction key={i} label={x.label} component={Link} to={x.route} icon={<x.icon />} />)}
    </BottomNavigation>)
}