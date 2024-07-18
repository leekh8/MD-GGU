import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const HomePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-brand-blue mb-6">
        Welcome to MD GGU
      </h1>
      <p className="text-xl text-center text-brand-grey mb-8">
        {user.username !== "Guest"
          ? `Hello, ${user.username}! Explore our features.`
          : "Explore our features to optimize your markdown documents!"}
      </p>
      <div className="flex justify-center gap-4">
        <Link
          to="/documents"
          className="bg-brand-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-strong"
        >
          View Documents
        </Link>
        <Link
          to="/editor"
          className="bg-brand-yellow hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded shadow-strong"
        >
          Start Editing
        </Link>
      </div>
      <div className="mt-8 text-center">
        {/* <img
          src="path_to_welcome_image.jpg"
          alt="Welcome Image"
          className="mx-auto"
        /> */}
      </div>
    </div>
  );
};

export default HomePage;
