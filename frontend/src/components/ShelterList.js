import React from "react";

const ShelterList = ({ shelters, onShelterSelect }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {shelters.map((shelter) => (
        <div
          key={shelter.id}
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300 ease-in-out flex cursor-pointer"
          onClick={() => onShelterSelect(shelter)}
        >
          <div className="w-[150px] h-full flex-shrink-0 flex items-center justify-center ">
            <div className="w-[150px] h-[150px] overflow-hidden my-2 ml-4 rounded-md">
              <img
                src={
                  shelter.photo_urls[0] ||
                  "/placeholder.svg?height=150&width=150"
                }
                alt={shelter.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="p-5 flex-grow">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
              {shelter.name}
            </h3>
            <p className="text-sm text-gray-500 mb-1">{shelter.address}</p>
            <p className="text-sm text-gray-500 mb-2">
              {shelter.city}, {shelter.state} {shelter.zip_code}
            </p>
            <p className="text-sm text-gray-600 mb-2">{shelter.phone_number}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-gray-500">
                Last updated:{" "}
                {new Date(shelter.update_datetime).toLocaleDateString()}
              </span>
              <span className="text-xs text-[#5d7598] hover:text-[#427acd]">
                View Details →
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShelterList;
