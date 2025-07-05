import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { UrlProvider } from './context/UrlContext.jsx';
import ShortenerPage from './pages/ShortenerPage.jsx';
import StatsPage from './pages/StatsPage.jsx';
import RedirectionHandler from './components/RedirectionHandler.jsx';
import loggingMiddleware from './LoggingMiddleware.js';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  loggingMiddleware.info('App initialized');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UrlProvider>
        <Router>
          <Routes>
            <Route path="/" element={<ShortenerPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/:shortcode" element={<RedirectionHandler />} />
          </Routes>
        </Router>
      </UrlProvider>
    </ThemeProvider>
  );
}

export default App; 