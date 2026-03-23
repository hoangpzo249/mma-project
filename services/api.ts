import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_IP = '10.147.143.240';

export const API_BASE_URL = `http://${LOCAL_IP}:9999/api`;

/* AUTHENTICATION */
export const loginUser = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  const data = await response.json();
  if (data.token) {
    try { 
      await AsyncStorage.setItem('userToken', data.token); 
      if (data.user) {
        await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));
      }
    } catch(e) { console.warn('AsyncStorage error in setItem:', e); }
  }
  return data;
};

export const registerUser = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  return await response.json();
};

export const logoutUser = async () => {
    try { 
      await AsyncStorage.removeItem('userToken'); 
      await AsyncStorage.removeItem('userInfo');
    } catch(e) { console.warn('AsyncStorage error in removeItem:', e); }
}

export const getUserData = async () => {
  try {
    const userInfoStr = await AsyncStorage.getItem('userInfo');
    if (userInfoStr) {
      return JSON.parse(userInfoStr);
    }
  } catch(e) { console.warn('AsyncStorage error in getItem:', e); }
  return null;
};

/* STORIES */
export const fetchStories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stories`);
    if (!response.ok) throw new Error('Failed to fetch stories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
};

export const fetchRandomStories = async () => {
  try {
    const response = await fetch(API_BASE_URL + '/stories/random');
    if (!response.ok) throw new Error('Failed to fetch random stories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching random stories:', error);
    return [];
  }
};

export const fetchRecentUpdates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stories/recent`);
    if (!response.ok) throw new Error('Failed to fetch recent updates');
    return await response.json();
  } catch (error) {
    console.error('Error fetching recent updates:', error);
    return [];
  }
};

export const searchStories = async (keyword: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stories/search?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) throw new Error('Failed to fetch searched stories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching searched stories:', error);
    return [];
  }
};

export const fetchHotStories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stories/hot`);
    if (!response.ok) throw new Error('Failed to fetch hot stories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching hot stories:', error);
    return [];
  }
};

export const fetchStoryById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stories/${id}`);
    if (!response.ok) throw new Error('Failed to fetch story metadata');
    return await response.json();
  } catch (error) {
    console.error('Error fetching story by ID:', error);
    return null;
  }
};

/* CHAPTERS */
export const fetchChaptersByStoryId = async (storyId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chapters/story/${storyId}`);
    if (!response.ok) throw new Error('Failed to fetch chapters');
    return await response.json();
  } catch (error) {
    console.error('Error fetching chapters by story ID:', error);
    return [];
  }
};

export const fetchChapterContent = async (chapterId: string) => {
  let token = null;
  try {
    token = await AsyncStorage.getItem('userToken');
  } catch (e) {
    console.warn('AsyncStorage error in fetchChapterContent:', e);
  }
  const headers: any = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/chapters/${chapterId}`, {
     headers
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // If VIP requires auth
    throw {
      message: data.message || 'Failed to fetch chapter content',
      requiresVip: data.requiresVip || false,
      status: response.status
    };
  }
  
  return data;
};

export const upgradeToVip = async () => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) throw new Error('No token found');
  const response = await fetch(`${API_BASE_URL}/users/upgrade-vip`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Payment failed');
  }
  return await response.json();
};

/* HISTORY */
export const syncReadingHistory = async (storyId: string, chapterId: string) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return; // Ignore if not logged in

    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ storyId, chapterId })
    });
    
    if (!response.ok) {
      console.warn('Failed to sync history to server');
    }
  } catch (error) {
    console.error('Error syncing history:', error);
  }
};

export const getReadingHistory = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return [];

    const response = await fetch(`${API_BASE_URL}/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};

export const deleteReadingHistory = async (storyId: string) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    await fetch(`${API_BASE_URL}/history/${storyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Error deleting history:', error);
  }
};
