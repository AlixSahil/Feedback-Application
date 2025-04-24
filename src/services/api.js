import { auth } from '../firebase';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const getFeedbacks = async () => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_URL}/feedbacks`, {
    headers
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch feedbacks');
  }
  
  return response.json();
};

export const addFeedback = async (feedbackData) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_URL}/feedbacks`, {
    method: 'POST',
    headers,
    body: JSON.stringify(feedbackData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to add feedback');
  }
  
  return response.json();
};

export const deleteFeedback = async (id) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_URL}/feedbacks/${id}`, {
    method: 'DELETE',
    headers
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete feedback');
  }
  
  return response.json();
}; 