import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  TableSortLabel,
  Checkbox,
  LinearProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const PamTable = ({
  columns = [],
  data = [],
  title,
  subtitle,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  pagination = false,
  page = 0,
  rowsPerPage = 10,
  totalRows = 0,
  onPageChange,
  onRowsPerPageChange,
  sortable = false,
  sortBy = '',
  sortOrder = 'asc',
  onSort,
  sx = {},
  ...props
}) => {
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      onSelectionChange(data.map((row, index) => index));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (index) => {
    const newSelected = selectedRows.includes(index)
      ? selectedRows.filter(i => i !== index)
      : [...selectedRows, index];
    onSelectionChange(newSelected);
  };

  const isSelected = (index) => selectedRows.includes(index);

  const handleSort = (columnId) => {
    if (!sortable) return;
    
    const isAsc = sortBy === columnId && sortOrder === 'asc';
    onSort(columnId, isAsc ? 'desc' : 'asc');
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ 
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      overflow: 'hidden',
      ...sx
    }} {...props}>
      {(title || subtitle) && (
        <Box sx={{ p: 3, pb: 2 }}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: subtitle ? 0.5 : 0 }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      
      {loading && <LinearProgress />}
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 600,
                    border: 'none'
                  }}
                >
                  {sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortOrder : 'asc'}
                      onClick={() => handleSort(column.id)}
                      sx={{ color: 'white', '&.MuiTableSortLabel-active': { color: 'white' } }}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableCell
                  align="center"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 600,
                    border: 'none'
                  }}
                >
                  Aksi
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              const isItemSelected = isSelected(index);
              return (
                <TableRow
                  key={index}
                  hover
                  selected={isItemSelected}
                  sx={{
                    '&:hover': {
                      background: 'rgba(102, 126, 234, 0.05)',
                    },
                  }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleSelectRow(index)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'left'}>
                      {column.render ? column.render(row[column.id], row, index) : row[column.id]}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {onView && (
                          <Tooltip title="Lihat">
                            <IconButton
                              size="small"
                              onClick={() => onView(row, index)}
                              sx={{ color: 'primary.main' }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(row, index)}
                              sx={{ color: 'warning.main' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Hapus">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(row, index)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && (
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
        />
      )}
    </Paper>
  );
};

export default PamTable; 