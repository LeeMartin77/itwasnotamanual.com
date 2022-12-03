import {
  Card,
  CardContent,
  CardHeader,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Head from "next/head";
import LinkIcon from "@mui/icons-material/Link";

export default function About() {
  const links = [
    { href: "https://www.wikipedia.org/", text: "Wikipedia" },
    { href: "https://openlibrary.org/", text: "Open Library" },
  ];

  return (
    <>
      <Head>
        <title>It Was Not a Manual :: About</title>
        <meta
          name="description"
          content="itwasnotamanual.com is a catalogue of where dystopian fiction has come true."
        />
        <meta property="og:image" content="/logo512.png" />
      </Head>
      <Card>
        <CardHeader title={"About"} />
        <CardContent>
          <p>
            This website was thrown together out of a mix of boredom and a
            desire to thumb my nose at the world a little. It's not intended to
            be taken seriously, however it's certainly a little bit concerning.
          </p>
          <p>
            This site literally wouldn't be possible without the fantastic
            resources of the Wikipedia and Open Library APIs - show them some
            love.
          </p>
          <List>
            {links.map((x, i) => (
              <ListItem key={i}>
                <ListItemButton href={x.href}>
                  <ListItemIcon>
                    <LinkIcon />
                  </ListItemIcon>
                  <ListItemText primary={x.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <p>
            Need to get in touch?{" "}
            <Link href="mailto:admin@itwasnotamanual.com">
              admin@itwasnotamanual.com
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
