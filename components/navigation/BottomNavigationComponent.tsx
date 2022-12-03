import {
  BottomNavigation,
  BottomNavigationAction,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import Link from "next/link";
import MenuIcon from "@mui/icons-material/Menu";

import styles from "./BottomNavigationComponent.module.css";
import { navigationConfig } from "./NavigationConfig";
import { useState } from "react";

export function BottomNavigationComponent() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <BottomNavigation showLabels className={styles.bottomNavigationMenu}>
        {navigationConfig
          .filter((x) => !x.mobileHidden)
          .map((x, i) => (
            <BottomNavigationAction
              key={i}
              label={x.label}
              component={Link}
              href={x.route}
              icon={<x.icon />}
            />
          ))}
        <BottomNavigationAction
          icon={<MenuIcon />}
          onClick={handleClick}
          label="More"
        />
      </BottomNavigation>
      <Menu
        id="more-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {navigationConfig
          .filter((x) => x.mobileHidden)
          .map((x, i) => {
            return (
              <MenuItem
                key={i}
                component={Link}
                onClick={handleClose}
                href={x.route}
              >
                <ListItemIcon>
                  <x.icon />
                </ListItemIcon>
                <ListItemText>{x.label}</ListItemText>
              </MenuItem>
            );
          })}
      </Menu>
    </>
  );
}
