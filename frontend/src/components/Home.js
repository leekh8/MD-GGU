import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Welcome to MD GGU
      </h1>
      <p className="text-xl text-center text-gray-600 mb-8">
        Explore our features to optimize your markdown documents for blogging!
      </p>
      <div className="flex justify-center gap-4">
        <Link
          to="/documents"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          View Documents
        </Link>
        <Link
          to="/editor"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
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
