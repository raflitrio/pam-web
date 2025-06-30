# Panduan Implementasi PAM Dashboard

## Langkah-langkah Implementasi

### 1. Persiapan
Pastikan semua file yang diperlukan sudah ada:
- `src/pam-styles.css` - Styling global
- `src/theme/pamTheme.js` - Tema Material-UI
- `src/component/PamWrapper.js` - Wrapper komponen
- `src/component/PamCard.js` - Komponen card
- `src/component/PamButton.js` - Komponen button
- `src/component/PamTable.js` - Komponen table

### 2. Import CSS Global
Pastikan file CSS sudah diimport di `src/index.js`:
```javascript
import './pam-styles.css';
```

### 3. Menggunakan Tema PAM
Pastikan tema sudah diterapkan di `src/App.js`:
```javascript
import pamTheme from './theme/pamTheme';

<ThemeProvider theme={pamTheme}>
  <CssBaseline />
  {/* ... */}
</ThemeProvider>
```

### 4. Implementasi di Halaman

#### Contoh Struktur Halaman
```javascript
import React from 'react';
import PamWrapper from './component/PamWrapper';
import PamCard from './component/PamCard';
import PamButton from './component/PamButton';
import PamTable from './component/PamTable';

function MyPage() {
  return (
    <PamWrapper 
      title="Judul Halaman"
      subtitle="Deskripsi halaman"
    >
      {/* Form Input */}
      <PamCard 
        title="Form Input"
        subtitle="Masukkan data"
        icon={<AddIcon />}
        gradient="success"
        sx={{ mb: 3 }}
      >
        {/* Form content */}
        <PamButton variant="success">
          Simpan
        </PamButton>
      </PamCard>

      {/* Data Table */}
      <PamCard 
        title="Data Table"
        subtitle="Daftar data"
        icon={<ListIcon />}
        gradient="primary"
      >
        <PamTable 
          columns={columns}
          data={data}
          loading={loading}
          error={error}
        />
      </PamCard>
    </PamWrapper>
  );
}
```

### 5. Konfigurasi Table
```javascript
const columns = [
  { field: 'name', label: 'Nama' },
  { field: 'email', label: 'Email' },
  { 
    field: 'status', 
    label: 'Status',
    render: (value) => (
      <Chip 
        label={value} 
        color={value === 'active' ? 'success' : 'error'}
      />
    )
  },
  {
    field: 'actions',
    label: 'Aksi',
    render: (value, row) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton onClick={() => handleEdit(row.id)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => handleDelete(row.id)}>
          <DeleteIcon />
        </IconButton>
      </Box>
    )
  }
];
```

### 6. Gradient Options
- `primary` - Biru ke ungu (#667eea → #764ba2)
- `success` - Hijau (#4CAF50 → #45a049)
- `warning` - Oranye (#FF9800 → #F57C00)
- `error` - Merah (#f44336 → #d32f2f)
- `info` - Biru (#2196F3 → #1976D2)

### 7. Button Variants
- `primary` - Default gradient
- `success` - Hijau gradient
- `warning` - Oranye gradient
- `error` - Merah gradient
- `info` - Biru gradient

## Best Practices

### 1. Layout Structure
```javascript
<PamWrapper title="..." subtitle="...">
  {/* Form Section */}
  <PamCard title="..." gradient="success">
    {/* Form content */}
  </PamCard>

  {/* Divider */}
  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

  {/* Data Section */}
  <PamCard title="..." gradient="primary">
    {/* Table or data content */}
  </PamCard>
</PamWrapper>
```

### 2. Responsive Design
- Gunakan Grid system Material-UI
- Test di berbagai ukuran layar
- Gunakan breakpoints yang konsisten

### 3. Loading States
```javascript
<PamButton 
  variant="success" 
  loading={isLoading}
  disabled={!formValid}
>
  Simpan Data
</PamButton>
```

### 4. Error Handling
```javascript
<PamTable 
  columns={columns}
  data={data}
  loading={loading}
  error={error}
  emptyMessage="Tidak ada data"
/>
```

### 5. Form Validation
```javascript
const [formValid, setFormValid] = useState(false);

useEffect(() => {
  setFormValid(
    nama && 
    alamat && 
    nomorMeteran && 
    selectedKelompok
  );
}, [nama, alamat, nomorMeteran, selectedKelompok]);
```

## Customization

### 1. Custom Colors
```javascript
// Di pamTheme.js
const customTheme = createTheme({
  palette: {
    custom: {
      main: '#your-color',
      light: '#your-light-color',
      dark: '#your-dark-color',
    }
  }
});
```

### 2. Custom Gradients
```javascript
// Di PamCard.js atau PamButton.js
const customGradients = {
  custom: 'linear-gradient(135deg, #your-color1 0%, #your-color2 100%)'
};
```

### 3. Custom Styling
```javascript
<PamCard 
  sx={{ 
    background: 'your-custom-background',
    borderRadius: 'your-custom-radius'
  }}
>
  {/* content */}
</PamCard>
```

## Troubleshooting

### 1. CSS tidak ter-load
- Pastikan import CSS di `index.js`
- Check browser console untuk error
- Clear browser cache

### 2. Tema tidak diterapkan
- Pastikan `ThemeProvider` membungkus aplikasi
- Check import path untuk `pamTheme`
- Restart development server

### 3. Komponen tidak render
- Check import path untuk komponen PAM
- Pastikan semua dependencies terinstall
- Check console untuk error

### 4. Responsive issues
- Test di berbagai device
- Check breakpoints Material-UI
- Gunakan browser dev tools

## Performance Tips

### 1. Lazy Loading
```javascript
const LazyComponent = React.lazy(() => import('./LazyComponent'));

<Suspense fallback={<CircularProgress />}>
  <LazyComponent />
</Suspense>
```

### 2. Memoization
```javascript
const MemoizedComponent = React.memo(MyComponent);
```

### 3. Optimized Re-renders
```javascript
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

## Testing

### 1. Visual Testing
- Test di berbagai browser
- Test responsive design
- Test dark/light mode (jika ada)

### 2. Functionality Testing
- Test form submission
- Test data loading
- Test error handling

### 3. Performance Testing
- Test loading times
- Test memory usage
- Test bundle size 