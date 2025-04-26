import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../client";
import "./Post.css";

function NewRecipe() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to post a recipe.");
      return;
    }

    const { error } = await supabase.from("recipes").insert([
      {
        title,
        description,
        image_url: imageUrl,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Failed to post recipe.");
    } else {
      alert("Recipe posted!");
      navigate("/");
    }
  };

  return (
    <div className="post-container">
      <h1>Post a New Recipe</h1>
      <form onSubmit={handleSubmit} className="post-form">
        <input
          type="text"
          placeholder="Recipe Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Recipe Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button type="submit">Post Recipe</button>
      </form>
    </div>
  );
}

export default NewRecipe;
