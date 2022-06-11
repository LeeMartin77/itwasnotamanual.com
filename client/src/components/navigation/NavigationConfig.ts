import { FormatListBulleted, Shuffle, Send, Info } from "@mui/icons-material";

export const navigationConfig = [
  {
    label: "Rank",
    route: "/",
    icon: Shuffle,
    mobileHidden: false
  },
  {
    label: "List",
    route: "/predictions",
    icon: FormatListBulleted,
    mobileHidden: false
  },
  {
    label: "Submit",
    route: "/submit",
    icon: Send,
    mobileHidden: true
  },
  {
    label: "About",
    route: "/about",
    icon: Info,
    mobileHidden: true
  }
]