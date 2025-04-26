import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../client";
import "./RecipePage.css";

function RecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [hasUpvoted, setHasUpvoted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionUser } = await supabase.auth.getUser();
      setUser(sessionUser.user);

      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (recipeError) {
        console.error("Error fetching recipe:", recipeError);
      } else {
        setRecipe(recipeData);
        setEditedTitle(recipeData.title);
        setEditedDescription(recipeData.description);
        setEditedImageUrl(recipeData.image_url || "");
      }

      const { data: commentData, error: commentError } = await supabase
        .from("comments")
        .select("*")
        .eq("recipe_id", id)
        .order("created_at", { ascending: true });

      if (commentError) {
        console.error("Error fetching comments:", commentError);
      } else {
        setComments(commentData);
      }

      if (sessionUser.user) {
        const { data: upvoteData } = await supabase
          .from("upvotes")
          .select("*")
          .eq("recipe_id", id)
          .eq("user_id", sessionUser.user.id)
          .single();

        setHasUpvoted(!!upvoteData);
      }
    };

    fetchData();
  }, [id]);

  const isOwner = user && recipe && recipe.user_id === user.id;

  const handleDelete = async () => {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe.");
    } else {
      alert("Recipe deleted.");
      navigate("/");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("recipes")
      .update({
        title: editedTitle,
        description: editedDescription,
        image_url: editedImageUrl,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating recipe:", error);
      alert("Failed to update recipe.");
    } else {
      alert("Recipe updated.");
      setEditing(false);
      window.location.reload();
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      alert("You must be logged in to vote.");
      return;
    }

    if (hasUpvoted) {
      const { error: deleteError } = await supabase
        .from("upvotes")
        .delete()
        .eq("recipe_id", id)
        .eq("user_id", user.id);

      const { error: updateError } = await supabase
        .from("recipes")
        .update({ upvotes: (recipe.upvotes || 1) - 1 })
        .eq("id", id);

      if (deleteError || updateError) {
        console.error("Failed to remove vote:", deleteError || updateError);
      } else {
        setHasUpvoted(false);
        setRecipe((prev) => ({ ...prev, upvotes: prev.upvotes - 1 }));
      }

    } else {
      const { error: insertError } = await supabase
        .from("upvotes")
        .insert([{ recipe_id: id, user_id: user.id }]);

      const { error: updateError } = await supabase
        .from("recipes")
        .update({ upvotes: (recipe.upvotes || 0) + 1 })
        .eq("id", id);

      if (insertError || updateError) {
        console.error("Failed to add vote:", insertError || updateError);
      } else {
        setHasUpvoted(true);
        setRecipe((prev) => ({ ...prev, upvotes: prev.upvotes + 1 }));
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }

    const { error } = await supabase
      .from("comments")
      .insert([
        {
          recipe_id: id,
          user_id: user.id,
          content: newComment,
        },
      ]);

    if (error) {
      console.error("Error posting comment:", error);
    } else {
      setNewComment("");
      window.location.reload();
    }
  };

  if (!recipe) return <p>Loading recipe...</p>;

  return (
    <div className="recipe-detail-container">
      {editing ? (
        <form onSubmit={handleEdit} className="edit-form">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            required
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            required
          />
          <input
            type="text"
            value={editedImageUrl}
            onChange={(e) => setEditedImageUrl(e.target.value)}
          />
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <h1>{recipe.title}</h1>
          {recipe.image_url && (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="recipe-detail-image"
            />
          )}
          <p>{recipe.description}</p>
          <p><strong>Upvotes:</strong> {recipe.upvotes || 0}</p>
          <button onClick={handleUpvote}>
            {hasUpvoted ? "Remove Upvote" : "Upvote"} ({recipe.upvotes || 0})
          </button>

          {isOwner && (
            <div className="owner-actions">
              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </>
      )}

      <div className="comment-section">
        <h3>Comments</h3>

        {user && (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
            <button type="submit">Post Comment</button>
          </form>
        )}

        <div className="comment-list">
          {comments.length === 0 && <p>No comments yet.</p>}
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <p>{comment.content}</p>
              <small>{new Date(comment.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecipePage;
