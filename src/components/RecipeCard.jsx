import { Link } from "react-router-dom";
import "./RecipeCard.css";

function RecipeCard({ id, title, description, imageUrl }) {
  return (
    <Link to={`/recipe/${id}`} className="recipe-card">
      <div className="recipe-image-container">
        <img src={imageUrl} alt={title} className="recipe-image" />
      </div>
      <div className="recipe-info">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </Link>
  );
}

export default RecipeCard;