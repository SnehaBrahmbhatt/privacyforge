export const generateData = async (url: string) => {
  const response = await fetch("http://127.0.0.1:8000/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error("Backend error");
  }

  return await response.json();
};