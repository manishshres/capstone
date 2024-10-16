import React from "react";
import { Link, useNavigate } from "react-router-dom";

const ShelterDetails = ({ shelter }) => {
  const navigate = useNavigate();

  if (!shelter) {
    navigate("/");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="text-glaucous hover:underline mb-4 inline-block">
        ← Back
      </Link>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900">{shelter.name}</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {shelter.address}, {shelter.city}, {shelter.state}{" "}
                {shelter.zip_code}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {shelter.phone_number}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {shelter.email_address || "N/A"}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Website</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {shelter.official_website ? (
                  <a
                    href={shelter.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-glaucous hover:underline"
                  >
                    {shelter.official_website}
                  </a>
                ) : (
                  "N/A"
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {shelter.description || "No description available."}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Images</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex flex-wrap gap-4">
                  {shelter.photo_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${shelter.name} - ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  ))}
                </div>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Last Updated
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(shelter.update_datetime).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ShelterDetails;
