import { FormatListBulleted, Shuffle, Send, Info } from "@mui/icons-material";

export const navigationConfig = [
  {
    label: "List",
    route: "/",
    icon: FormatListBulleted,
    mobileHidden: false,
  },
  {
    label: "Rank",
    route: "/rank",
    icon: Shuffle,
    mobileHidden: false,
  },
  {
    label: "Submit",
    route: "/submit",
    icon: Send,
    mobileHidden: true,
  },
  {
    label: "About",
    route: "/about",
    icon: Info,
    mobileHidden: true,
  },
];
