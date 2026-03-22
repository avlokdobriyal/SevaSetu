import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  addGrievanceCommentRequest,
  addGrievanceRatingRequest,
  getGrievanceByIdRequest,
} from "../../api/grievanceApi";
import useAuth from "../../hooks/useAuth";
import { getStatusLabel } from "../../utils/grievanceMeta";

const statusSequence = [
  "submitted",
  "assigned_to_officer",
  "worker_assigned",
  "in_progress",
  "resolved",
  "closed",
  "appealed",
];

const CitizenGrievanceDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [grievance, setGrievance] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [rating, setRating] = useState(grievance?.rating || 0);
  const [ratingComment, setRatingComment] = useState(grievance?.ratingComment || "");
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const response = await getGrievanceByIdRequest(id);
        setGrievance(response?.data || null);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load grievance detail");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const timelineMap = useMemo(() => {
    const map = {};
    (grievance?.statusHistory || []).forEach((entry) => {
      if (!map[entry.status]) {
        map[entry.status] = entry;
      }
    });
    return map;
  }, [grievance]);

  useEffect(() => {
    setRating(grievance?.rating || 0);
    setRatingComment(grievance?.ratingComment || "");
  }, [grievance]);

  const canRate =
    grievance?.status === "closed" &&
    user?.role === "citizen" &&
    user?._id === grievance?.citizen?._id;

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setIsCommentSubmitting(true);
      const response = await addGrievanceCommentRequest(id, { text: commentText.trim() });
      setGrievance(response?.data || grievance);
      setCommentText("");
      toast.success("Comment added");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add comment");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleRatingSubmit = async (event) => {
    event.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5");
      return;
    }

    try {
      setIsRatingSubmitting(true);
      const response = await addGrievanceRatingRequest(id, {
        rating,
        ratingComment,
      });
      setGrievance(response?.data || grievance);
      toast.success("Rating submitted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit rating");
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-slate-600">Loading grievance detail...</p>;
  }

  if (!grievance) {
    return <p className="text-red-600">Grievance not found.</p>;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-800">{grievance.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{grievance.grievanceId}</p>
        <p className="mt-3 text-slate-700">{grievance.description}</p>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <div>
            <span className="font-medium text-slate-700">Current Status: </span>
            <span>{getStatusLabel(grievance.status)}</span>
          </div>
          <div>
            <span className="font-medium text-slate-700">Category: </span>
            <span>{grievance.category}</span>
          </div>
          <div>
            <span className="font-medium text-slate-700">Ward: </span>
            <span>{grievance?.ward?.name || "N/A"}</span>
          </div>
        </div>

        {grievance.imageUrls?.length > 0 ? (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-medium text-slate-700">Uploaded Images</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {grievance.imageUrls.map((url) => (
                <img
                  key={url}
                  src={`http://localhost:5000${url}`}
                  alt="Grievance evidence"
                  className="h-36 w-full rounded border object-cover"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-800">Status Timeline</h3>
        <p className="mt-1 text-sm text-slate-600">
          Track each stage of your grievance like an order tracker.
        </p>

        <div className="mt-6 space-y-4">
          {statusSequence.map((status) => {
            const entry = timelineMap[status];
            const isCompleted = Boolean(entry);

            return (
              <div key={status} className="flex gap-3">
                <div className="mt-0.5">
                  <div
                    className={`h-4 w-4 rounded-full ${
                      isCompleted ? "bg-primary" : "bg-slate-300"
                    }`}
                  />
                </div>
                <div className="flex-1 rounded border border-slate-200 p-3">
                  <p className="font-medium text-slate-800">{getStatusLabel(status)}</p>
                  {entry ? (
                    <>
                      <p className="mt-1 text-xs text-slate-600">
                        {new Date(entry.timestamp).toLocaleString()} by {entry.updatedBy?.name || "System"}
                      </p>
                      {entry.note ? <p className="mt-1 text-sm text-slate-700">{entry.note}</p> : null}
                    </>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">Pending</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-800">Comments & Updates</h3>

        <form onSubmit={handleCommentSubmit} className="mt-4 space-y-3">
          <textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            rows={3}
            placeholder="Add an update or comment"
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={isCommentSubmitting}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isCommentSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </form>

        <div className="mt-5 space-y-3">
          {(grievance.comments || []).length === 0 ? (
            <p className="text-sm text-slate-500">No comments yet.</p>
          ) : (
            grievance.comments
              .slice()
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((comment, index) => (
                <div key={`${comment.timestamp}-${index}`} className="rounded border border-slate-200 p-3">
                  <p className="text-sm text-slate-700">{comment.text}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {comment.user?.name || "User"} ({comment.user?.role || "-"}) - {" "}
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
          )}
        </div>
      </div>

      {canRate ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-800">Rate Resolution</h3>
          <p className="mt-1 text-sm text-slate-600">
            Please rate your grievance resolution after closure.
          </p>

          <form onSubmit={handleRatingSubmit} className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`rounded px-3 py-1 text-sm ${
                    rating >= value ? "bg-accent text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <textarea
              value={ratingComment}
              onChange={(event) => setRatingComment(event.target.value)}
              rows={3}
              placeholder="Optional feedback"
              className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-primary"
            />

            <button
              type="submit"
              disabled={isRatingSubmitting}
              className="rounded bg-accent px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRatingSubmitting ? "Submitting..." : "Submit Rating"}
            </button>
          </form>

          {grievance.rating ? (
            <p className="mt-3 text-sm text-slate-600">
              Current rating: {grievance.rating}/5
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default CitizenGrievanceDetailPage;
