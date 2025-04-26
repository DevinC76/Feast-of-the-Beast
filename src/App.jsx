import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import RecipePage from "./pages/RecipePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewRecipe from "./pages/NewRecipe";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <Navbar setSearchTerm={setSearchTerm} />
      <Routes>
        <Route path="/" element={<Home searchTerm={searchTerm} />} />
        <Route path="/recipe/:id" element={<RecipePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/new-recipe" element={<NewRecipe />} />
      </Routes>
    </>
  );
}

export default App;
