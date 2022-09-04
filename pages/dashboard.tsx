import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import * as colors from "@mui/material/colors";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import { useState } from "react";
import { Lists } from "../components/dashboard/Lists";
import { RecentItems } from "../components/dashboard/RecentItems";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

function Recipe({ recipe }: any) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        PaperProps={{
          sx: {
            borderRadius: "30px 30px 0 0",
          },
        }}
        disableSwipeToOpen
      >
        <Box
          sx={{
            maxHeight: "90vh",
            height: "90vh",
            borderRadius: "30px 30px 0 0",
            overflow: "scroll!important",
          }}
        >
          {recipe.strYoutube ? (
            <iframe
              src={recipe.strYoutube.replace("/watch?v=", "/embed/")}
              width="100%"
              height="300"
              style={{ borderRadius: "30px 30px 0 0" }}
              frameBorder="0"
            />
          ) : (
            <picture>
              <img
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "cover",
                }}
                src={recipe.strMealThumb}
                alt={recipe.strMeal}
              />
            </picture>
          )}
          <Box sx={{ p: 4 }}>
            <Typography variant="body1" component="div">
              <Typography variant="h5" component="div" gutterBottom>
                {recipe.strMeal}
              </Typography>
              {recipe.strInstructions.split("\n").map(function (item, idx) {
                return (
                  <span
                    key={idx}
                    style={{ marginBottom: "10px", display: "block" }}
                  >
                    {item}
                  </span>
                );
              })}
              <Typography variant="h5" sx={{ mb: 2 }}>
                <b>Ingredients</b>
              </Typography>
              {[...new Array(19)].map((_, i) => {
                if (recipe[`strIngredient${i + 1}`]) {
                  return (
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                        gap: 2,
                      }}
                    >
                      <div>
                        <span
                          className="material-symbols-outlined"
                          style={{ userSelect: "none" }}
                        >
                          radio_button_unchecked
                        </span>
                      </div>
                      <Box>
                        <div style={{ fontWeight: "500" }}>
                          {recipe[`strIngredient${i + 1}`]}
                        </div>
                        {recipe[`strMeasure${i + 1}`]}
                      </Box>
                    </Typography>
                  );
                }
              })}
              <Button
                href={recipe.strSource}
                target="_blank"
                fullWidth
                variant="outlined"
                sx={{
                  gap: 2,
                  borderWidth: "2px!important",
                  borderRadius: 5,
                  mt: 3,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    userSelect: "none",
                    marginRight: "auto",
                    opacity: 0,
                    visibility: "hidden",
                  }}
                >
                  open_in_new
                </span>
                Source
                <span
                  className="material-symbols-outlined"
                  style={{ userSelect: "none", marginLeft: "auto" }}
                >
                  open_in_new
                </span>
              </Button>
            </Typography>
          </Box>
        </Box>
      </SwipeableDrawer>

      <Card sx={{ mt: 2, background: "rgba(200,200,200,.3)", borderRadius: 5 }}>
        <CardActionArea onClick={() => setOpen(true)}>
          <CardMedia
            component="img"
            height="180"
            image={recipe.strMealThumb}
            alt={recipe.strMeal}
          />
          <CardContent>
            <Typography
              variant="h5"
              gutterBottom
              component="div"
              sx={{ fontWeight: "600" }}
            >
              {recipe.strMeal}
            </Typography>
            <Typography variant="body2" gutterBottom color="text.secondary">
              {recipe.strInstructions.slice(0, 100).trim()}...
            </Typography>
            <Chip sx={{ mt: 1, px: 1, mr: 1 }} label={recipe.strCategory} />
            <Chip sx={{ mt: 1, px: 1, mr: 1 }} label={recipe.strArea} />
          </CardContent>
        </CardActionArea>
      </Card>
    </>
  );
}

function Recipes() {
  const [recipes, setRecipes] = useState<any>([]);
  const [recipe, setRecipe] = useState(null);
  const handleClick = () => {
    fetch("https://www.themealdb.com/api/json/v1/1/random.php")
      .then((res) => res.json())
      .then((res: any) => {
        const d: any = [res.meals[0], ...recipes];
        setRecipes(d);
      });
  };

  return (
    <Box>
      <Button
        onClick={handleClick}
        variant="contained"
        sx={{ borderRadius: 999, width: "100%", gap: 2 }}
        disableElevation
        size="large"
      >
        <span className="material-symbols-rounded">shuffle</span>Random
      </Button>
      {recipes.map((recipe: any, id: number) => (
        <Recipe recipe={recipe} key={id} />
      ))}
    </Box>
  );
}
export default function Dashboard() {
  const styles = {
    mr: 1,
    px: 0.7,
    transition: "transform .1s!important",
    boxShadow: "none!important",
    "&:active": {
      transform: "scale(0.95)",
      transition: "none !important",
    },
  };
  const activeTabStyles = {
    background: colors[themeColor]["800"] + "!important",
    color: "#fff",
  };
  const [activeTab, setActiveTab] = useState("lists");

  return (
    <>
      <Head>
        <title>
          Dashboard &bull;{" "}
          {global.property.propertyName.replace(/./, (c) => c.toUpperCase())}{" "}
          &bull; Carbon
        </title>
      </Head>
      <Container sx={{ mt: 4 }}>
        <Box sx={{ pb: 3, pl: 1 }}>
          {["Recent", "Lists", "Tips", "Recipes"].map((item) => (
            <Chip
              key={item}
              label={item}
              onClick={() => setActiveTab(item.toLowerCase())}
              sx={{
                ...styles,
                ...(activeTab === item.toLowerCase() && activeTabStyles),
              }}
            />
          ))}
        </Box>
        {activeTab === "lists" && <Lists />}
        {activeTab === "recent" && <RecentItems />}
        {activeTab === "tips" && <RecentItems />}
        {activeTab === "recipes" && <Recipes />}
      </Container>
    </>
  );
}
