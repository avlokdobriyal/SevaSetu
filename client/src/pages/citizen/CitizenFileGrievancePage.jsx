import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getAllWardsRequest } from "../../api/wardApi";
import { createGrievanceRequest } from "../../api/grievanceApi";
import { CATEGORY_OPTIONS } from "../../utils/grievanceMeta";
import useAuth from "../../hooks/useAuth";

const CitizenFileGrievancePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wards, setWards] = useState([]);
  const [isLoadingWards, setIsLoadingWards] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    ward: "",
  });

  useEffect(() => {
    const fetchWards = async () => {
      try {
        setIsLoadingWards(true);
        const response = await getAllWardsRequest();
        const wardList = response?.data || [];
        setWards(wardList);

        const wardIdFromProfile = typeof user?.ward === "object" ? user.ward?._id : user?.ward;
        if (wardIdFromProfile) {
          setFormData((prev) => ({ ...prev, ward: wardIdFromProfile }));
        } else if (wardList.length > 0) {
          setFormData((prev) => ({ ...prev, ward: wardList[0]._id }));
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load wards");
      } finally {
        setIsLoadingWards(false);
      }
    };

    fetchWards();
  }, [user]);

  const canSubmit = useMemo(() => {
    return formData.title && formData.description && formData.category && formData.ward;
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 3) {
      toast.error("You can upload up to 3 images only");
      event.target.value = "";
      return;
    }

    const isInvalidType = selectedFiles.some(
      (file) => file.type !== "image/jpeg" && file.type !== "image/png"
    );

    if (isInvalidType) {
      toast.error("Only JPG and PNG images are allowed");
      event.target.value = "";
      return;
    }

    const hasLargeFile = selectedFiles.some((file) => file.size > 5 * 1024 * 1024);

    if (hasLargeFile) {
      toast.error("Each image must be 5MB or smaller");
      event.target.value = "";
      return;
    }

    setImages(selectedFiles);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("category", formData.category);
      payload.append("ward", formData.ward);

      images.forEach((file) => {
        payload.append("images", file);
      });

      const response = await createGrievanceRequest(payload);
      const grievanceId = response?.data?._id;

      toast.success("Grievance filed successfully");
      if (grievanceId) {
        navigate(`/citizen/grievances/${grievanceId}`);
      } else {
        navigate("/citizen/grievances");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to file grievance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-800">File New Grievance</h2>
      <p className="mt-1 text-sm text-slate-600">
        You can upload up to 3 images (JPG/PNG, max 5MB each).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-primary"
            placeholder="Short summary of the issue"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-primary"
            placeholder="Explain the issue in detail"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-primary"
          >
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="ward">
            Ward
          </label>
          <select
            id="ward"
            name="ward"
            value={formData.ward}
            onChange={handleChange}
            disabled={isLoadingWards}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-primary disabled:bg-slate-100"
          >
            {wards.map((ward) => (
              <option key={ward._id} value={ward._id}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="images">
            Images (optional, max 3)
          </label>
          <input
            id="images"
            name="images"
            type="file"
            multiple
            accept="image/jpeg,image/png"
            onChange={handleImagesChange}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          {images.length > 0 ? (
            <p className="mt-2 text-sm text-slate-600">Selected files: {images.length}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="rounded bg-primary px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : "Submit Grievance"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CitizenFileGrievancePage;
