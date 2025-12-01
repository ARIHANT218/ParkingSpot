// src/pages/ManagerAddParking.jsx
import { useState } from "react";
import axios from "../api/axios";

export default function ManagerAddParking() {
  const [name, setName] = useState("");
  const [locationText, setLocationText] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [amenities, setAmenities] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAdd = async () => {
    setError("");
    setSuccessMsg("");

    if (!name || !city || !price || !capacity) {
      setError("Please fill required fields: name, city, price, capacity.");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        location: locationText?.trim() || "",
        city: city.trim(),
        latitude: latitude !== "" ? Number(latitude) : undefined,
        longitude: longitude !== "" ? Number(longitude) : undefined,
        pricePerHour: Number(price),
        capacity: Number(capacity),
        availableSlots: Number(capacity),
        amenities: amenities
          ? amenities
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : [],
      };

      await axios.post("/manager/parking-lot", payload);
      setSuccessMsg("Parking lot added successfully.");

      setName("");
      setLocationText("");
      setCity("");
      setPrice("");
      setCapacity("");
      setAmenities("");
      setLatitude("");
      setLongitude("");
    } catch (err) {
      console.error("add parking error", err);
      setError(err.response?.data?.message || "Failed to add parking lot");
    }
  };

  return (
    <div className="card bg-white dark:bg-sky-800 text-slate-900 dark:text-slate-100 border p-4 rounded-lg shadow">
      <h2 className="font-semibold mb-3">Add Parking Lot</h2>

      {error && (
        <div className="mb-2 p-2 rounded bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-2 p-2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
          {successMsg}
        </div>
      )}

      <input
        className="border p-2 rounded w-full mb-2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-2 rounded w-full mb-2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <input
        placeholder="Location / Address"
        value={locationText}
        onChange={(e) => setLocationText(e.target.value)}
        className="border p-2 rounded w-full mb-2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
      />

      <div className="flex gap-2 mb-2">
        <input
          className="border rounded mb-2 p-2 bg-white text-slate-900 dark:text-slate-100 dark:bg-sky-700"
          placeholder="Latitude (optional)"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
        />
        <input
          placeholder="Longitude (optional)"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="border p-2 rounded w-1/2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="flex gap-2">
        <input
          className="border p-2 rounded w-1/2 mb-2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
          placeholder="Price per hour"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          className="border p-2 rounded w-1/2 mb-2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </div>

      <input
        className="border p-2 rounded w-full mb-3 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
        placeholder="Amenities (comma separated)"
        value={amenities}
        onChange={(e) => setAmenities(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={handleAdd}
          className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 transition"
        >
          Add Parking
        </button>
        <button
          onClick={() => {
            setName("");
            setLocationText("");
            setCity("");
            setPrice("");
            setCapacity("");
            setAmenities("");
            setLatitude("");
            setLongitude("");
          }}
          className="bg-slate-100 dark:bg-sky-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
