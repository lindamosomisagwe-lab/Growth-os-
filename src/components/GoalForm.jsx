// src/components/GoalForm.jsx
// Modal overlay for adding or editing a Big Goal.
// "goal" prop = null means "Add" mode. Otherwise "Edit" mode.

import React, { useState, useEffect, useRef } from "react";

const CATEGORIES = ["career", "health", "fun", "learning", "other"];

export default function GoalForm({ goal, onSave, onClose }) {
  const isEdit = Boolean(goal);
  const titleRef = useRef(null);

  const [fields, setFields] = useState({
    title:       goal?.title       ?? "",
    description: goal?.description ?? "",
    dueDate:     goal?.dueDate     ?? "",
    category:    goal?.category    ?? "other",
  });

  const [errors, setErrors] = useState({});

  // Auto-focus title on mount
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!fields.title.trim()) errs.title = "Title is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      title:       fields.title.trim(),
      description: fields.description.trim(),
      dueDate:     fields.dueDate || null,
      category:    fields.category,
    });
  };

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ── Modal panel ── */}
      <div
        className="bg-white w-full max-w-lg mx-4"
        style={{ border: "1px solid #000", animation: "fadeUp 180ms ease forwards" }}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit Goal" : "Add Goal"}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #000" }}
        >
          <span className="label-caps" style={{ letterSpacing: "0.15em" }}>
            {isEdit ? "Edit Goal" : "New Goal"}
          </span>
          <button
            className="btn-icon"
            onClick={onClose}
            aria-label="Close"
            style={{ border: "none", background: "transparent", width: "auto", height: "auto" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="#000" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-6 flex flex-col gap-5">

            {/* Title */}
            <div>
              <label className="label-caps block mb-2" htmlFor="goal-title">
                Goal Title *
              </label>
              <input
                id="goal-title"
                ref={titleRef}
                className="input-field"
                type="text"
                value={fields.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="What is your big goal?"
                maxLength={120}
              />
              {errors.title && (
                <p className="body-sm mt-1" style={{ color: "#CC0000" }}>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="label-caps block mb-2" htmlFor="goal-desc">
                Description
              </label>
              <textarea
                id="goal-desc"
                className="input-field"
                value={fields.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Measurable outcome, target metric, context…"
                rows={3}
                maxLength={500}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Category + Due Date — side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-caps block mb-2" htmlFor="goal-category">
                  Category
                </label>
                <select
                  id="goal-category"
                  className="select-field"
                  value={fields.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-caps block mb-2" htmlFor="goal-due">
                  Due Date
                </label>
                <input
                  id="goal-due"
                  className="input-field"
                  type="date"
                  value={fields.dueDate}
                  onChange={(e) => set("dueDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Footer actions ── */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: "1px solid #E5E5E5" }}
          >
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-solid">
              {isEdit ? "Save Changes" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
