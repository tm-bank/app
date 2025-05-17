export async function sendDiscordWebhook(url: string, message: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: message
      })
    });

    if (response.ok) {
      console.log('Message sent successfully.');
      return true
    } else {
      console.error('Failed to send message:', response.status, response.statusText);
      return false
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return false
  }
}