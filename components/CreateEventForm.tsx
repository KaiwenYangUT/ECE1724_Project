"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type TicketTierInput = {
  name: string;
  price: string;
  quantityLimit: string;
};

type TicketTierError = {
  name: string;
  price: string;
  quantityLimit: string;
};

type CreateEventResponse = {
  message?: string;
  error?: string;
  details?: {
    formErrors?: string[];
    fieldErrors?: {
      title?: string[];
      description?: string[];
      dateTime?: string[];
      location?: string[];
      bannerImageUrl?: string[];
      ticketTiers?: string[];
    };
  };
};

const emptyTier = (): TicketTierInput => ({
  name: "",
  price: "",
  quantityLimit: "",
});

const emptyTierError = (): TicketTierError => ({
  name: "",
  price: "",
  quantityLimit: "",
});

function validateTitle(value: string) {
  return value.trim() ? "" : "Title is required.";
}

function validateDescription(value: string) {
  return value.trim() ? "" : "Description is required.";
}

function validateDateTime(value: string) {
  if (!value.trim()) {
    return "Date and time are required.";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "The event date and time format is invalid.";
  }

  if (parsedDate.getTime() <= Date.now()) {
    return "The event date and time must be in the future.";
  }

  return "";
}

function validateLocation(value: string) {
  return value.trim() ? "" : "Location is required.";
}

function validateBannerImageUrl(value: string) {
  if (!value.trim()) {
    return "";
  }

  try {
    new URL(value.trim());
    return "";
  } catch {
    return "Banner image URL must be valid.";
  }
}

function validateTierName(value: string) {
  return value.trim() ? "" : "Ticket tier name is required.";
}

function validateTierPrice(value: string) {
  if (!value.trim()) {
    return "Price is required.";
  }

  const parsedPrice = Number(value);

  if (Number.isNaN(parsedPrice)) {
    return "Price must be a number.";
  }

  return parsedPrice >= 0 ? "" : "Price cannot be negative.";
}

function validateTierQuantityLimit(value: string) {
  if (!value.trim()) {
    return "Quantity limit is required.";
  }

  const parsedQuantity = Number(value);

  if (!Number.isInteger(parsedQuantity)) {
    return "Quantity must be a whole number.";
  }

  return parsedQuantity >= 1 ? "" : "Quantity must be at least 1.";
}

export default function CreateEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [ticketTiers, setTicketTiers] = useState<TicketTierInput[]>([emptyTier()]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [dateTimeError, setDateTimeError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [bannerImageUrlError, setBannerImageUrlError] = useState("");
  const [bannerUploadError, setBannerUploadError] = useState("");
  const [ticketTierErrors, setTicketTierErrors] = useState<TicketTierError[]>([emptyTierError()]);

  function clearFormErrorIfResolved(nextFormErrors: {
    title: string;
    description: string;
    dateTime: string;
    location: string;
    bannerImageUrl: string;
    ticketTierErrors: TicketTierError[];
  }) {
    const hasTierError = nextFormErrors.ticketTierErrors.some(
      (tierError) => tierError.name || tierError.price || tierError.quantityLimit,
    );

    const hasAnyError =
      Boolean(nextFormErrors.title) ||
      Boolean(nextFormErrors.description) ||
      Boolean(nextFormErrors.dateTime) ||
      Boolean(nextFormErrors.location) ||
      Boolean(nextFormErrors.bannerImageUrl) ||
      hasTierError;

    if (!hasAnyError && errorMessage === "Please fix the highlighted fields.") {
      setErrorMessage("");
    }
  }

  function validateAllFields() {
    const nextTitleError = validateTitle(title);
    const nextDescriptionError = validateDescription(description);
    const nextDateTimeError = validateDateTime(dateTime);
    const nextLocationError = validateLocation(location);
    const nextBannerImageUrlError = validateBannerImageUrl(bannerImageUrl);
    const nextTierErrors = ticketTiers.map((tier) => ({
      name: validateTierName(tier.name),
      price: validateTierPrice(tier.price),
      quantityLimit: validateTierQuantityLimit(tier.quantityLimit),
    }));

    setTitleError(nextTitleError);
    setDescriptionError(nextDescriptionError);
    setDateTimeError(nextDateTimeError);
    setLocationError(nextLocationError);
    setBannerImageUrlError(nextBannerImageUrlError);
    setTicketTierErrors(nextTierErrors);

    return (
      !nextTitleError &&
      !nextDescriptionError &&
      !nextDateTimeError &&
      !nextLocationError &&
      !nextBannerImageUrlError &&
      nextTierErrors.every(
        (tierError) => !tierError.name && !tierError.price && !tierError.quantityLimit,
      )
    );
  }

  function updateTier(index: number, field: keyof TicketTierInput, value: string) {
    const nextTicketTiers = ticketTiers.map((tier, i) =>
      i === index ? { ...tier, [field]: value } : tier,
    );
    const nextTierErrors = ticketTierErrors.map((tierError, i) => {
      if (i !== index) {
        return tierError;
      }

      const updatedTier = nextTicketTiers[index];

      return {
        name: validateTierName(updatedTier.name),
        price: validateTierPrice(updatedTier.price),
        quantityLimit: validateTierQuantityLimit(updatedTier.quantityLimit),
      };
    });

    setTicketTiers(nextTicketTiers);
    setTicketTierErrors(nextTierErrors);
    clearFormErrorIfResolved({
      title: titleError,
      description: descriptionError,
      dateTime: dateTimeError,
      location: locationError,
      bannerImageUrl: bannerImageUrlError,
      ticketTierErrors: nextTierErrors,
    });
  }

  function addTier() {
    setTicketTiers((prev) => [...prev, emptyTier()]);
    setTicketTierErrors((prev) => [...prev, emptyTierError()]);
  }

  function removeTier(index: number) {
    if (ticketTiers.length === 1) {
      return;
    }

    const nextTicketTiers = ticketTiers.filter((_, i) => i !== index);
    const nextTierErrors = ticketTierErrors.filter((_, i) => i !== index);

    setTicketTiers(nextTicketTiers);
    setTicketTierErrors(nextTierErrors);
    clearFormErrorIfResolved({
      title: titleError,
      description: descriptionError,
      dateTime: dateTimeError,
      location: locationError,
      bannerImageUrl: bannerImageUrlError,
      ticketTierErrors: nextTierErrors,
    });
  }
  
  async function uploadBannerIfNeeded() {
    if (!bannerFile) {
      return bannerImageUrl.trim() || "";
    }

    setUploadingBanner(true);
    setBannerUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", bannerFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload banner image.");
      }

      const uploadedUrl = data.url as string;
      setBannerImageUrl(uploadedUrl);
      return uploadedUrl;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload banner image.";
      setBannerUploadError(message);
      return null;
    } finally {
      setUploadingBanner(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setDateTime("");
    setLocation("");
    setBannerImageUrl("");
    setBannerFile(null);
    setBannerUploadError("");
    setTicketTiers([emptyTier()]);
    setTitleError("");
    setDescriptionError("");
    setDateTimeError("");
    setLocationError("");
    setBannerImageUrlError("");
    setTicketTierErrors([emptyTierError()]);
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateAllFields()) {
      setErrorMessage("Please fix the highlighted fields.");
      setLoading(false);
      return;
    }

    const uploadedBannerUrl = await uploadBannerIfNeeded();

    if (bannerFile && !uploadedBannerUrl) {
      setErrorMessage("Banner image upload failed.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      setErrorMessage("Please log in as an organizer first.");
      return;
    }

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          dateTime,
          location,
          bannerImageUrl: uploadedBannerUrl ?? bannerImageUrl,
          ticketTiers: ticketTiers.map((tier) => ({
            name: tier.name,
            price: Number(tier.price),
            quantityLimit: Number(tier.quantityLimit),
          })),
        }),
      });

      const data: CreateEventResponse = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to create event.");

        if (data.details?.fieldErrors?.title?.[0]) {
          setTitleError(data.details.fieldErrors.title[0]);
        }

        if (data.details?.fieldErrors?.description?.[0]) {
          setDescriptionError(data.details.fieldErrors.description[0]);
        }

        if (data.details?.fieldErrors?.dateTime?.[0]) {
          setDateTimeError(data.details.fieldErrors.dateTime[0]);
        }

        if (data.details?.fieldErrors?.location?.[0]) {
          setLocationError(data.details.fieldErrors.location[0]);
        }

        if (data.details?.fieldErrors?.bannerImageUrl?.[0]) {
          setBannerImageUrlError(data.details.fieldErrors.bannerImageUrl[0]);
        }

        return;
      }

      setSuccessMessage("Event created successfully. Returning to the home page in 3 seconds...");
      resetForm();

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 3000);
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl border p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={title}
          onChange={(e) => {
            const nextValue = e.target.value;
            const nextError = validateTitle(nextValue);
            setTitle(nextValue);
            setTitleError(nextError);
            clearFormErrorIfResolved({
              title: nextError,
              description: descriptionError,
              dateTime: dateTimeError,
              location: locationError,
              bannerImageUrl: bannerImageUrlError,
              ticketTierErrors,
            });
          }}
          placeholder="Event title"
        />
        {titleError ? <p className="mt-1 text-sm text-red-600">{titleError}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          className="w-full rounded-lg border px-3 py-2"
          value={description}
          onChange={(e) => {
            const nextValue = e.target.value;
            const nextError = validateDescription(nextValue);
            setDescription(nextValue);
            setDescriptionError(nextError);
            clearFormErrorIfResolved({
              title: titleError,
              description: nextError,
              dateTime: dateTimeError,
              location: locationError,
              bannerImageUrl: bannerImageUrlError,
              ticketTierErrors,
            });
          }}
          placeholder="Event description"
          rows={4}
        />
        {descriptionError ? (
          <p className="mt-1 text-sm text-red-600">{descriptionError}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Date and Time</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          type="datetime-local"
          value={dateTime}
          onChange={(e) => {
            const nextValue = e.target.value;
            const nextError = validateDateTime(nextValue);
            setDateTime(nextValue);
            setDateTimeError(nextError);
            clearFormErrorIfResolved({
              title: titleError,
              description: descriptionError,
              dateTime: nextError,
              location: locationError,
              bannerImageUrl: bannerImageUrlError,
              ticketTierErrors,
            });
          }}
        />
        {dateTimeError ? <p className="mt-1 text-sm text-red-600">{dateTimeError}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Location</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={location}
          onChange={(e) => {
            const nextValue = e.target.value;
            const nextError = validateLocation(nextValue);
            setLocation(nextValue);
            setLocationError(nextError);
            clearFormErrorIfResolved({
              title: titleError,
              description: descriptionError,
              dateTime: dateTimeError,
              location: nextError,
              bannerImageUrl: bannerImageUrlError,
              ticketTierErrors,
            });
          }}
          placeholder="Event location"
        />
        {locationError ? <p className="mt-1 text-sm text-red-600">{locationError}</p> : null}
      </div>

      <div className="space-y-3">
        <label className="mb-1 block text-sm font-medium">Banner Image</label>

        <input
          className="w-full rounded-lg border px-3 py-2"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;

            if (!file) {
              setBannerFile(null);
              return;
            }

            const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
              setBannerFile(null);
              setBannerUploadError("Only PNG, JPG, and WEBP images are allowed.");
              return;
            }

            if (file.size > 5 * 1024 * 1024) {
              setBannerFile(null);
              setBannerUploadError("Banner image must be 5MB or smaller.");
              return;
            }

            setBannerFile(file);
            setBannerUploadError("");
          }}
        />

        <div>
          <label className="mb-1 block text-sm font-medium">Banner Image URL</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={bannerImageUrl}
            onChange={(e) => {
              const nextValue = e.target.value;
              const nextError = validateBannerImageUrl(nextValue);
              setBannerImageUrl(nextValue);
              setBannerImageUrlError(nextError);
              clearFormErrorIfResolved({
                title: titleError,
                description: descriptionError,
                dateTime: dateTimeError,
                location: locationError,
                bannerImageUrl: nextError,
                ticketTierErrors,
              });
            }}
            placeholder="Optional image URL or uploaded image URL"
          />
        </div>

        {uploadingBanner ? (
          <p className="text-sm text-gray-600">Uploading banner image...</p>
        ) : null}

        {bannerUploadError ? (
          <p className="text-sm text-red-600">{bannerUploadError}</p>
        ) : null}

        {bannerImageUrlError ? (
          <p className="text-sm text-red-600">{bannerImageUrlError}</p>
        ) : null}

        {bannerImageUrl ? (
          <img
            src={bannerImageUrl}
            alt="Banner preview"
            className="h-48 w-full rounded-lg border object-cover"
          />
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Ticket Tiers</h2>
          <button
            type="button"
            onClick={addTier}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Add Tier
          </button>
        </div>

        {ticketTiers.map((tier, index) => (
          <div key={index} className="space-y-3 rounded-xl border p-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tier Name</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={tier.name}
                onChange={(e) => updateTier(index, "name", e.target.value)}
                placeholder="General / VIP / Early Bird"
              />
              {ticketTierErrors[index]?.name ? (
                <p className="mt-1 text-sm text-red-600">{ticketTierErrors[index].name}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Price</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                type="number"
                min="0"
                step="0.01"
                value={tier.price}
                onChange={(e) => updateTier(index, "price", e.target.value)}
                placeholder="0"
              />
              {ticketTierErrors[index]?.price ? (
                <p className="mt-1 text-sm text-red-600">{ticketTierErrors[index].price}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Quantity Limit</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                type="number"
                min="1"
                step="1"
                value={tier.quantityLimit}
                onChange={(e) => updateTier(index, "quantityLimit", e.target.value)}
                placeholder="50"
              />
              {ticketTierErrors[index]?.quantityLimit ? (
                <p className="mt-1 text-sm text-red-600">
                  {ticketTierErrors[index].quantityLimit}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => removeTier(index)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Remove Tier
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Event"}
      </button>

      {successMessage ? (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}
