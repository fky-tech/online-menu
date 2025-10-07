import React from "react";

const ItemCard = ({ item }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Image section */}
      {item.image_url && (
        <div className="relative w-full aspect-[16/9]">
          <img
            src={
              item.image_url.startsWith("/uploads/")
                ? `http://localhost:5000${item.image_url}`
                : item.image_url
            }
            alt={item.name}
            className="w-full h-full object-cover rounded-t-2xl"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          {/* Availability Badge */}
          <span
            className={`absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-full ${
              item.is_available
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {item.is_available ? "Available" : "Not Available"}
          </span>
        </div>
      )}


      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title + Price */}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-stone-800 capitalize">
            {item.name}
          </h3>
          <span className="text-lg font-bold text-amber-700 whitespace-nowrap">
            {item.price} BIRR
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-stone-600 line-clamp-2">{item.description}</p>

        {/* CTA Button */}
        {/* <div className="flex justify-end">
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full text-white bg-amber-600 hover:bg-amber-700 transition-colors duration-300 shadow-md">
            Order Now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ItemCard;
