import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../client";
import "./Home.css";

function Home({ searchTerm }) {
  const [recipes, setRecipes] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data, error } = await supabase.from("recipes").select("*");
      if (error) console.error(error);
      else {
        setRecipes(data);
        setFiltered(data);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFiltered(recipes);
    } else {
      const term = searchTerm.toLowerCase();
      const result = recipes.filter((r) =>
        r.title.toLowerCase().includes(term)
      );
      setFiltered(result);
    }
  }, [searchTerm, recipes]); 

  return (
    <div className="home-container">
      <div className="recipe-grid">
        {filtered.length === 0 ? (
          <p>No recipes found.</p>
        ) : (
          filtered.map((recipe) => (
            <Link
              to={`/recipe/${recipe.id}`}
              key={recipe.id}
              className="recipe-card"
            >
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="recipe-image"
              />
              <h2>{recipe.title}</h2>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
