export const timestampToMilliseconds = (value?: string | null): number => {
  if (!value) return 0;
  const milliseconds = /^\d+$/.test(value) ? Number(value) : Date.parse(value);
  return Number.isFinite(milliseconds) ? milliseconds : 0;
};

export const formatTimestamp = (value?: string | null): string => {
  const milliseconds = timestampToMilliseconds(value);
  return milliseconds
    ? new Date(milliseconds).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : value || "";
};

