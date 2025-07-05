import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import StatsTable from '../components/StatsTable.jsx';
import loggingMiddleware from '../LoggingMiddleware.js';

const StatsPage = () => {
  loggingMiddleware.info('Stats page loaded');

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            sx={{ mr: 2 }}
          >
            Shorten URLs
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/stats"
          >
            Statistics
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg">
        <StatsTable />
      </Container>
    </Box>
  );
};

export default StatsPage; 