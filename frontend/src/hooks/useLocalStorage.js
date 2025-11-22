import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state to localStorage
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if not in localStorage
 * @returns {[any, function]} - State value and setter function
 */
export function useLocalStorage(key, initialValue) {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Clear localStorage item
 * @param {string} key - localStorage key to clear
 */
export function clearLocalStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing localStorage for key "${key}":`, error);
  }
}

/**
 * Clear all localStorage items
 */
export function clearAllLocalStorage() {
  try {
    window.localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
