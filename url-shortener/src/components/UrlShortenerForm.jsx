import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useUrlContext } from '../context/UrlContext.jsx';
import loggingMiddleware from '../LoggingMiddleware.js';

const UrlShortenerForm = () => {
  const { addShortenedUrl, loading, error, clearError } = useUrlContext();
  const [urls, setUrls] = useState([
    { id: 1, originalUrl: '', validityMinutes: 30, customShortcode: '' }
  ]);
  const [validationErrors, setValidationErrors] = useState({});
  const [results, setResults] = useState([]);

  const addUrlField = () => {
    if (urls.length < 5) {
      const newId = Math.max(...urls.map(u => u.id)) + 1;
      setUrls([...urls, { id: newId, originalUrl: '', validityMinutes: 30, customShortcode: '' }]);
      loggingMiddleware.info('Added new URL field', { totalFields: urls.length + 1 });
    }
  };

  const removeUrlField = (id) => {
    if (urls.length > 1) {
      setUrls(urls.filter(url => url.id !== id));
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
      loggingMiddleware.info('Removed URL field', { remainingFields: urls.length - 1 });
    }
  };

  const updateUrlField = (id, field, value) => {
    setUrls(urls.map(url => 
      url.id === id ? { ...url, [field]: value } : url
    ));
    
    if (validationErrors[id]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    urls.forEach(url => {
      if (!url.originalUrl.trim()) {
        errors[url.id] = 'URL is required';
        isValid = false;
      } else {
        try {
          new URL(url.originalUrl);
        } catch {
          errors[url.id] = 'Invalid URL format';
          isValid = false;
        }
      }

      if (url.validityMinutes && (isNaN(url.validityMinutes) || url.validityMinutes <= 0)) {
        errors[url.id] = 'Validity must be a positive number';
        isValid = false;
      }

      if (url.customShortcode && !/^[a-zA-Z0-9]{3,10}$/.test(url.customShortcode)) {
        errors[url.id] = 'Custom shortcode must be 3-10 alphanumeric characters';
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      loggingMiddleware.warn('Form validation failed', { errors: validationErrors });
      return;
    }

    const newResults = [];
    
    for (const url of urls) {
      try {
        const result = await addShortenedUrl(
          url.originalUrl.trim(),
          parseInt(url.validityMinutes) || 30,
          url.customShortcode.trim() || null
        );
        newResults.push(result);
      } catch (error) {
        loggingMiddleware.error('Failed to shorten URL', { url: url.originalUrl, error: error.message });
      }
    }

    if (newResults.length > 0) {
      setResults(newResults);
      loggingMiddleware.info('URLs shortened successfully', { count: newResults.length });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    loggingMiddleware.info('URL copied to clipboard', { url: text });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        URL Shortener
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Shorten URLs (Up to 5)
          </Typography>
          
          <form onSubmit={handleSubmit}>
            {urls.map((url, index) => (
              <Box key={url.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      URL {index + 1}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Original URL"
                      value={url.originalUrl}
                      onChange={(e) => updateUrlField(url.id, 'originalUrl', e.target.value)}
                      placeholder="https://example.com"
                      error={!!validationErrors[url.id]}
                      helperText={validationErrors[url.id]}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Validity (minutes)"
                      type="number"
                      value={url.validityMinutes}
                      onChange={(e) => updateUrlField(url.id, 'validityMinutes', e.target.value)}
                      placeholder="30"
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode (optional)"
                      value={url.customShortcode}
                      onChange={(e) => updateUrlField(url.id, 'customShortcode', e.target.value)}
                      placeholder="mycode"
                      helperText="3-10 alphanumeric characters"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={1}>
                    {urls.length > 1 && (
                      <IconButton
                        onClick={() => removeUrlField(url.id)}
                        color="error"
                        title="Remove URL"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              {urls.length < 5 && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addUrlField}
                >
                  Add Another URL
                </Button>
              )}
              
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Shortening...' : 'Shorten URLs'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Shortened URLs
            </Typography>
            
            {results.map((result) => (
              <Box key={result.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Original: {result.originalUrl}
                    </Typography>
                    <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>
                      {result.shortUrl}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={`Expires: ${new Date(result.expiresAt).toLocaleString()}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {result.isCustom && (
                        <Chip 
                          label="Custom Code"
                          size="small"
                          color="secondary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="outlined"
                      onClick={() => copyToClipboard(result.shortUrl)}
                      fullWidth
                    >
                      Copy Link
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UrlShortenerForm; 