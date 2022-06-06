import { FormatListBulleted, Shuffle, Send, Info } from "@mui/icons-material";

export const navigationConfig = [
  {
    label: "Rank",
    route: "/",
    icon: Shuffle,
    mobile: true
  },
  {
    label: "List",
    route: "/predictions",
    icon: FormatListBulleted,
    mobile: true
  },
  {
    label: "Submit",
    route: "/submit",
    icon: Send,
    mobile: true
  },
  {
    label: "About",
    route: "/about",
    icon: Info,
    mobile: false
  }
]