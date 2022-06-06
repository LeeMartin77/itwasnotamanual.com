import { Card, CardContent, CardHeader, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import LinkIcon from '@mui/icons-material/Link';

export function AboutPageComponent() {

  const links = [
    { href: "https://www.wikipedia.org/", text: "Wikipedia"},
    { href: "https://openlibrary.org/", text: "Open Library"}
  ]

  return (<Card>
    <CardHeader title={"About"}/>
    <CardContent>
      <p>This website was thrown together out of a mix of boredom and a desire to thumb my nose at the world a little. It's not intended to be taken seriously, however it's certainly a little bit concerning.</p>
      <p>This site literally wouldn't be possible without the fantastic resources of the Wikipedia and Open Library APIs - show them some love.</p>
      {
        links.map(x => <List>
          <ListItem>
            <ListItemButton href={x.href}>
              <ListItemIcon>
                <LinkIcon />
              </ListItemIcon>
              <ListItemText primary={x.text} />
            </ListItemButton>
          </ListItem>
      </List>)
      }
      <p>Need to get in touch? <Link href="mailto:admin@itwasnotamanual.com">admin@itwasnotamanual.com</Link></p>
    </CardContent>
  </Card>)
}