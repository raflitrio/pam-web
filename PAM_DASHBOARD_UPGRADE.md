# PAM Dashboard Upgrade

## Overview
Aplikasi PAM telah diupgrade untuk menggunakan desain yang mirip dengan [Argon Dashboard Tailwind](https://themewagon.github.io/argon-dashboard-tailwind/pages/dashboard.html) dengan implementasi glassmorphism dan gradient yang modern.

## Perubahan yang Telah Dibuat

### 1. Layout Utama
- **AppLayout.js**: Mengubah background menjadi gradient dan menambahkan glassmorphism effect
- **TopBar.js**: Menambahkan glassmorphism effect, notifikasi, dan profil user
- **Sidebar.js**: Mengubah desain dengan gradient header dan hover effects yang modern

### 2. Komponen PAM Dashboard
- **PamWrapper.js**: Wrapper untuk memberikan layout konsisten
- **PamCard.js**: Card dengan glassmorphism effect dan gradient icons
- **PamButton.js**: Button dengan gradient dan hover effects
- **PamTable.js**: Table dengan header gradient dan hover effects

### 3. Styling Global
- **pam-styles.css**: File CSS global dengan:
  - Font Inter untuk tipografi modern
  - Gradient backgrounds
  - Glassmorphism effects
  - Custom scrollbar
  - Animation utilities
  - Responsive design

### 4. Tema Material-UI
- **pamTheme.js**: Tema custom untuk Material-UI dengan:
  - Color palette yang konsisten
  - Typography dengan font Inter
  - Component overrides untuk glassmorphism

## Fitur Visual

### Glassmorphism Effect
- Background transparan dengan blur effect
- Border dengan opacity rendah
- Shadow yang lembut

### Gradient Backgrounds
- Primary: `#667eea` to `#764ba2`
- Success: `#4CAF50` to `#45a049`
- Warning: `#FF9800` to `#F57C00`
- Error: `#f44336` to `#d32f2f`
- Info: `#2196F3` to `#1976D2`

### Hover Effects
- Transform translateY untuk lift effect
- Shadow yang lebih dalam saat hover
- Smooth transitions

### Typography
- Font Inter untuk modern look
- Font weights: 300, 400, 500, 600, 700
- Text shadows untuk kontras

## Cara Penggunaan

### Menggunakan PamWrapper
```jsx
import PamWrapper from './component/PamWrapper';

<PamWrapper 
  title="Judul Halaman" 
  subtitle="Deskripsi halaman"
>
  {/* Konten halaman */}
</PamWrapper>
```

### Menggunakan PamCard
```jsx
import PamCard from './component/PamCard';
import PeopleIcon from '@mui/icons-material/People';

<PamCard 
  title="Total Pelanggan"
  subtitle="Jumlah pelanggan aktif"
  icon={<PeopleIcon />}
  gradient="primary"
>
  {/* Konten card */}
</PamCard>
```

### Menggunakan PamButton
```jsx
import PamButton from './component/PamButton';

<PamButton 
  variant="success" 
  loading={isLoading}
  onClick={handleClick}
>
  Simpan Data
</PamButton>
```

### Menggunakan PamTable
```jsx
import PamTable from './component/PamTable';

const columns = [
  { field: 'name', label: 'Nama' },
  { field: 'email', label: 'Email' },
  { 
    field: 'status', 
    label: 'Status',
    render: (value) => <Chip label={value} />
  }
];

<PamTable 
  columns={columns}
  data={data}
  loading={loading}
  error={error}
/>
```

## Responsive Design
- Grid system yang responsive
- Mobile-first approach
- Breakpoints yang konsisten

## Browser Support
- Modern browsers dengan dukungan CSS backdrop-filter
- Fallback untuk browser lama

## Performance
- CSS optimizations
- Minimal JavaScript overhead
- Efficient re-renders

## Maintenance
- Komponen yang reusable
- Consistent naming convention
- Easy to customize

## Next Steps
1. Terapkan komponen PAM ke semua halaman yang ada
2. Optimasi untuk mobile devices
3. Tambahkan dark mode support
4. Implementasi animasi yang lebih advanced 