import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
  TablePagination,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenIcon
} from '@mui/icons-material';
import { useUrlContext } from '../context/UrlContext.jsx';
import loggingMiddleware from '../LoggingMiddleware.js';

const StatsTable = () => {
  const { shortenedUrls, getValidUrls, getExpiredUrls } = useUrlContext();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  const validUrls = getValidUrls();
  const expiredUrls = getExpiredUrls();

  const filteredUrls = shortenedUrls.filter(url =>
    url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleRowExpansion = (urlId) => {
    setExpandedRows(prev => ({
      ...prev,
      [urlId]: !prev[urlId]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    loggingMiddleware.info('URL copied to clipboard from stats', { url: text });
  };

  const openUrl = (url) => {
    window.open(url, '_blank');
    loggingMiddleware.info('URL opened in new tab', { url });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusChip = (url) => {
    const isExpired = new Date() > new Date(url.expiresAt);
    return (
      <Chip
        label={isExpired ? 'Expired' : 'Active'}
        color={isExpired ? 'error' : 'success'}
        size="small"
      />
    );
  };

  const getTotalClicks = (url) => {
    return url.clicks ? url.clicks.length : 0;
  };

  const paginatedUrls = filteredUrls.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        URL Statistics
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total URLs
            </Typography>
            <Typography variant="h4">
              {shortenedUrls.length}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active URLs
            </Typography>
            <Typography variant="h4" color="success.main">
              {validUrls.length}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Expired URLs
            </Typography>
            <Typography variant="h4" color="error.main">
              {expiredUrls.length}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Clicks
            </Typography>
            <Typography variant="h4" color="primary.main">
              {shortenedUrls.reduce((total, url) => total + getTotalClicks(url), 0)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search URLs, shortcodes, or original URLs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {shortenedUrls.length === 0 && (
        <Alert severity="info">
          No shortened URLs found. Create some URLs first!
        </Alert>
      )}

      {shortenedUrls.length > 0 && (
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Short URL</TableCell>
                    <TableCell>Original URL</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Clicks</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUrls.map((url) => (
                    <>
                      <TableRow key={url.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {url.shortUrl}
                            </Typography>
                            {url.isCustom && (
                              <Chip label="Custom" size="small" color="secondary" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: 200, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={url.originalUrl}
                          >
                            {url.originalUrl}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(url)}
                        </TableCell>
                        <TableCell>
                          {formatDate(url.createdAt)}
                        </TableCell>
                        <TableCell>
                          {formatDate(url.expiresAt)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getTotalClicks(url)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(url.shortUrl)}
                              title="Copy URL"
                            >
                              <CopyIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => openUrl(url.originalUrl)}
                              title="Open original URL"
                            >
                              <OpenIcon />
                            </IconButton>
                            {getTotalClicks(url) > 0 && (
                              <IconButton
                                size="small"
                                onClick={() => toggleRowExpansion(url.id)}
                                title="View click details"
                              >
                                <ExpandMoreIcon 
                                  sx={{ 
                                    transform: expandedRows[url.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s'
                                  }} 
                                />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                          <Collapse in={expandedRows[url.id]} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Typography variant="h6" gutterBottom>
                                Click Details
                              </Typography>
                              {url.clicks && url.clicks.length > 0 ? (
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Timestamp</TableCell>
                                      <TableCell>Source</TableCell>
                                      <TableCell>Location</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {url.clicks.map((click, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {formatDate(click.timestamp)}
                                        </TableCell>
                                        <TableCell>
                                          {click.source}
                                        </TableCell>
                                        <TableCell>
                                          {click.location ? 
                                            `${click.location.city}, ${click.location.region}, ${click.location.country}` :
                                            'Unknown'
                                          }
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <Typography variant="body2" color="textSecondary">
                                  No clicks recorded yet.
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredUrls.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StatsTable; 