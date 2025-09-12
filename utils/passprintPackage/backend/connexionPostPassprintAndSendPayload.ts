export async function connexionPostPassprintAndSendPayload(payload: string) {
  try {
    const response = await fetch('https://your-api-url.com/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json(); // Parse JSON response
    console.log('Response data:', responseData);
    if (!responseData.success) {
      throw new Error(responseData.message);
    }
    return responseData;
  } catch (error) {
    console.error('Error sending POST request:', error);
    throw error;
  }
}
