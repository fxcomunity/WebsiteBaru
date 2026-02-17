# 404 Error Page - FX Community

Folder ini berisi halaman error 404 yang custom dan responsif untuk website FX Community.

## 📁 Struktur

```
404/
├── index.html          # Halaman error 404 utama (diakses via /404/)
../404.html            # Redirect fallback (akar root)
../.htaccess          # Konfigurasi Apache
../vercel.json        # Konfigurasi Vercel
```

## 🎯 Fitur

✅ **Responsif** - Bekerja sempurna di desktop, tablet, dan mobile
✅ **Animated** - Animasi menarik dengan shapes floating dan gradient text
✅ **User-Friendly** - Saran jelas dan tombol navigasi yang intuitif
✅ **SEO-Ready** - Properly configured untuk search engines
✅ **Cross-Platform** - Kompatibel dengan Vercel dan Apache servers

## 🚀 Deployment

### Vercel (Cloud Hosting) - Sudah dikonfigurasi
- Vercel.json sudah updated dengan rewrites otomatis
- Halaman 404 akan ditampilkan untuk semua route yang tidak ditemukan

### Apache Hosting (Lokal/Custom Server)
- .htaccess sudah dikonfigurasi
- ErrorDocument 404 mengarah ke /404/index.html
- Rewrite engine menangani URL cleanup

### Nginx
Jika menggunakan Nginx, tambahkan di server configuration:
```nginx
error_page 404 /404/index.html;
location = /404/index.html {
    internal;
}
```

## 📱 Responsive Breakpoints

| Device | Width | Grid | Font |
|--------|-------|------|------|
| Mobile | <480px | 1 kolom | Adaptif |
| Tablet | 480-768px | Responsif | Adaptif |
| Desktop | >768px | 2+ kolom | Standar |

## 🎨 Styling

- Menggunakan CSS custom properties dari style.css utama
- Gradient animasi dengan 8 detik loop
- Floating shapes dengan parallax effect
- Bounce animation pada icon

## 🔗 Links

Halaman ini dapat diakses melalui:
- `/404/` atau `/404/index.html` - Direct access
- `/any-non-existent-page` - Automatic redirect (Vercel)
- Root `/404.html` - Fallback untuk some hosting

## ✏️ Customization

Untuk mengubah pesan atau styling:

1. Edit `/404/index.html` untuk mengubah teks pesan
2. Modifikasi CSS di `<style>` tag untuk styling custom
3. Update links ke halaman yang relevan (saat ini: `/index.html`)

## 📞 Support

Jika ada issue dengan 404 page:
- Periksa konfigurasi server (.htaccess atau nginx config)
- Verifikasi links dalam halaman 404 sudah benar
- Clear browser cache jika tidak terupdate

---
Created with ❤️ for FX Community
