import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { useUrlContext } from '../context/UrlContext.jsx';
import loggingMiddleware from '../LoggingMiddleware.js';

const RedirectionHandler = () => {
  const { shortcode } = useParams();
  const navigate = useNavigate();
  const { getUrlByShortcode, recordClick } = useUrlContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    handleRedirection();
  }, [shortcode]);

  const handleRedirection = async () => {
    try {
      setLoading(true);
      setError(null);

      loggingMiddleware.info('Processing redirection request', { shortcode });

      const url = getUrlByShortcode(shortcode);
      
      if (!url) {
        throw new Error('URL not found');
      }

      if (new Date() > new Date(url.expiresAt)) {
        throw new Error('This URL has expired');
      }

      const originalUrl = await recordClick(shortcode);
      
      setRedirecting(true);
      
      setTimeout(() => {
        loggingMiddleware.info('Redirecting user', { 
          shortcode, 
          originalUrl,
          referrer: document.referrer 
        });
        
        window.location.href = originalUrl;
      }, 1500);

    } catch (error) {
      loggingMiddleware.error('Redirection failed', { 
        shortcode, 
        error: error.message 
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToStats = () => {
    navigate('/stats');
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 2
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Processing your request...
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Please wait while we redirect you to your destination.
        </Typography>
      </Box>
    );
  }

  if (redirecting) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 2
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Redirecting...
        </Typography>
        <Typography variant="body2" color="textSecondary">
          You will be redirected to your destination shortly.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 2
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom color="error">
              Redirect Failed
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            
            <Typography variant="body1" gutterBottom>
              The shortened URL you're trying to access could not be processed.
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              This could be because:
            </Typography>
            
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography variant="body2" color="textSecondary">
                • The URL doesn't exist
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • The URL has expired
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • There was an error processing the request
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={handleGoHome}
              >
                Go to URL Shortener
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleGoToStats}
              >
                View Statistics
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return null;
};

export default RedirectionHandler; 