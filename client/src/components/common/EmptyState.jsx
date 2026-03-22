const EmptyState = ({ title = "No data found", description = "", action = null }) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      {description ? <p className="mt-2 text-slate-600">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
};

export default EmptyState;
