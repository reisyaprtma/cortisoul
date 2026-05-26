const aiServiceBaseUrl =
  process.env.AI_SERVICE_URL || 'https://cortisoul-production.up.railway.app';

export const predictText = async (text) => {
  const response = await fetch(`${aiServiceBaseUrl}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `AI prediction request failed: ${response.status} ${response.statusText} - ${errorBody}`
    );
  }

  const result = await response.json();
  return result;
};
