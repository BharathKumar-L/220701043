import { createContext, useContext, useReducer, useEffect } from 'react';
import loggingMiddleware from '../LoggingMiddleware.js';

const initialState = {
  shortenedUrls: [],
  loading: false,
  error: null
};

const ACTIONS = {
  ADD_URL: 'ADD_URL',
  UPDATE_CLICKS: 'UPDATE_CLICKS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_URLS: 'LOAD_URLS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

function urlReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_URL:
      return {
        ...state,
        shortenedUrls: [...state.shortenedUrls, action.payload],
        error: null
      };
    
    case ACTIONS.UPDATE_CLICKS:
      return {
        ...state,
        shortenedUrls: state.shortenedUrls.map(url => 
          url.shortcode === action.payload.shortcode 
            ? { ...url, clicks: [...url.clicks, action.payload.clickData] }
            : url
        )
      };
    
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case ACTIONS.LOAD_URLS:
      return {
        ...state,
        shortenedUrls: action.payload,
        error: null
      };
    
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

const UrlContext = createContext();

export function UrlProvider({ children }) {
  const [state, dispatch] = useReducer(urlReducer, initialState);

  useEffect(() => {
    loadUrlsFromStorage();
    loggingMiddleware.info('URL Context initialized');
  }, []);

  const loadUrlsFromStorage = () => {
    try {
      const storedUrls = localStorage.getItem('shortenedUrls');
      if (storedUrls) {
        const urls = JSON.parse(storedUrls);
        dispatch({ type: ACTIONS.LOAD_URLS, payload: urls });
        loggingMiddleware.info('URLs loaded from localStorage', { count: urls.length });
      }
    } catch (error) {
      loggingMiddleware.error('Failed to load URLs from localStorage', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load saved URLs' });
    }
  };

  const saveUrlsToStorage = (urls) => {
    try {
      localStorage.setItem('shortenedUrls', JSON.stringify(urls));
    } catch (error) {
      loggingMiddleware.error('Failed to save URLs to localStorage', error);
    }
  };

  const generateShortcode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortcode;
    do {
      shortcode = '';
      for (let i = 0; i < 6; i++) {
        shortcode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (state.shortenedUrls.some(url => url.shortcode === shortcode));
    
    return shortcode;
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateShortcode = (shortcode) => {
    const regex = /^[a-zA-Z0-9]{3,10}$/;
    return regex.test(shortcode);
  };

  const addShortenedUrl = (originalUrl, validityMinutes = 30, customShortcode = null) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      if (!validateUrl(originalUrl)) {
        throw new Error('Invalid URL format');
      }

      if (customShortcode && !validateShortcode(customShortcode)) {
        throw new Error('Invalid shortcode format. Use 3-10 alphanumeric characters.');
      }

      if (customShortcode && state.shortenedUrls.some(url => url.shortcode === customShortcode)) {
        throw new Error('Shortcode already exists. Please choose a different one.');
      }

      const shortcode = customShortcode || generateShortcode();
      const now = new Date();
      const expiryDate = new Date(now.getTime() + validityMinutes * 60000);

      const newUrl = {
        id: Date.now().toString(),
        originalUrl,
        shortcode,
        shortUrl: `${window.location.origin}/${shortcode}`,
        createdAt: now.toISOString(),
        expiresAt: expiryDate.toISOString(),
        validityMinutes,
        clicks: [],
        isCustom: !!customShortcode
      };

      dispatch({ type: ACTIONS.ADD_URL, payload: newUrl });
      
      const updatedUrls = [...state.shortenedUrls, newUrl];
      saveUrlsToStorage(updatedUrls);
      
      loggingMiddleware.info('New shortened URL created', {
        shortcode,
        originalUrl,
        validityMinutes,
        isCustom: !!customShortcode
      });

      return newUrl;
    } catch (error) {
      loggingMiddleware.error('Failed to create shortened URL', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const recordClick = async (shortcode) => {
    try {
      const url = state.shortenedUrls.find(u => u.shortcode === shortcode);
      if (!url) {
        throw new Error('URL not found');
      }

      if (new Date() > new Date(url.expiresAt)) {
        throw new Error('URL has expired');
      }

      const clickData = {
        timestamp: new Date().toISOString(),
        source: document.referrer || 'Direct',
        location: await getLocationData()
      };

      dispatch({ type: ACTIONS.UPDATE_CLICKS, payload: { shortcode, clickData } });
      
      const updatedUrls = state.shortenedUrls.map(u => 
        u.shortcode === shortcode 
          ? { ...u, clicks: [...u.clicks, clickData] }
          : u
      );
      saveUrlsToStorage(updatedUrls);

      loggingMiddleware.info('Click recorded', {
        shortcode,
        clickData
      });

      return url.originalUrl;
    } catch (error) {
      loggingMiddleware.error('Failed to record click', error);
      throw error;
    }
  };

  const getLocationData = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        country: data.country_name || 'Unknown',
        city: data.city || 'Unknown',
        region: data.region || 'Unknown'
      };
    } catch (error) {
      loggingMiddleware.warn('Failed to get location data', error);
      return {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown'
      };
    }
  };

  const getUrlByShortcode = (shortcode) => {
    return state.shortenedUrls.find(url => url.shortcode === shortcode);
  };

  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  const getValidUrls = () => {
    const now = new Date();
    return state.shortenedUrls.filter(url => new Date(url.expiresAt) > now);
  };

  const getExpiredUrls = () => {
    const now = new Date();
    return state.shortenedUrls.filter(url => new Date(url.expiresAt) <= now);
  };

  const value = {
    ...state,
    addShortenedUrl,
    recordClick,
    getUrlByShortcode,
    clearError,
    getValidUrls,
    getExpiredUrls,
    validateUrl,
    validateShortcode
  };

  return (
    <UrlContext.Provider value={value}>
      {children}
    </UrlContext.Provider>
  );
}

export function useUrlContext() {
  const context = useContext(UrlContext);
  if (!context) {
    throw new Error('useUrlContext must be used within a UrlProvider');
  }
  return context;
} 