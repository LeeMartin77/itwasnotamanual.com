import { FormatListBulleted, Shuffle, Send } from "@mui/icons-material";

export const navigationConfig = [
  {
    label: "Random",
    route: "/",
    icon: Shuffle
  },
  {
    label: "List",
    route: "/predictions",
    icon: FormatListBulleted
  },
  {
    label: "Submit",
    route: "/submit",
    icon: Send
  }
]