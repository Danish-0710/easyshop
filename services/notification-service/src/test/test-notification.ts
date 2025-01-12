import axios from 'axios';

const testNotification = async () => {
  try {
    const response = await axios.post('http://localhost:3006/api/notifications', {
      userId: 'test-user',
      type: 'order',
      channel: 'email',
      title: 'Test Notification',
      message: 'This is a test notification',
      metadata: {
        email: 'rwxsam@gmail.com'
      }
    });

    console.log('Notification sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending notification:', error.response?.data || error.message);
  }
};

testNotification();
