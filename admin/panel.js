(function(){
    // Simple guard - ensure admin is logged in via sessionStorage
    if(sessionStorage.getItem('fx_isAdmin') !== '1'){
        alert('Anda harus login sebagai admin. Mengalihkan ke halaman login.');
        window.location.href = 'index.html';
    }

    const STORAGE_KEY = 'fx_admin_data_v1';

    function loadData(){
        try{
            const raw = localStorage.getItem(STORAGE_KEY);
            if(raw) return JSON.parse(raw);
        }catch(e){ console.warn(e); }
        const fx = (typeof tradingFxData !== 'undefined' ? tradingFxData.slice() : []);
        const saham = (typeof sahamData !== 'undefined' ? sahamData.slice() : []);
        return fx.concat(saham);
    }

    function saveData(list){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    // Build UI
    const root = document.getElementById('panelRoot');

    root.innerHTML = `
        <!-- Welcome Banner -->
        <div class="welcome-banner">
            <h1><i class="fas fa-shield-alt"></i> Admin Dashboard</h1>
            <p>Kelola konten dan konfigurasi FX Community</p>
        </div>

        <!-- Statistics Grid -->
        <div class="stats-grid" id="statsGrid"></div>

        <!-- Main Layout -->
        <div class="main-panel-layout">
            <!-- Sidebar -->
            <aside class="panel-section sidebar-nav">
                <div class="sidebar-header-box">
                    <h3 class="sidebar-title">
                        <i class="fas fa-bars"></i>Menu
                    </h3>
                    <p class="sidebar-subtitle">Navigasi panel</p>
                </div>
                <div class="sidebar-btns">
                    <button id="goHome" class="btn btn-secondary">
                        <i class="fas fa-home"></i> Beranda Situs
                    </button>
                    <button id="tabList" class="btn btn-secondary">
                        <i class="fas fa-list"></i> Daftar PDF
                    </button>
                    <button id="tabAdd" class="btn btn-secondary">
                        <i class="fas fa-plus-circle"></i> Tambah PDF
                    </button>
                    <button id="tabImport" class="btn btn-secondary">
                        <i class="fas fa-file-import"></i> Import / Export
                    </button>
                    <button id="tabMaintenance" class="btn btn-secondary">
                        <i class="fas fa-tools"></i> Maintenance
                    </button>
                    <button id="tabSettings" class="btn btn-secondary">
                        <i class="fas fa-cog"></i> Settings
                    </button>
                </div>
                <div class="sidebar-footer">
                    <button id="logout" class="btn btn-danger">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
                <!-- Clock Widget -->
                <div class="clock-widget">
                    <div class="clock-label">
                        <i class="fas fa-clock"></i> Waktu Sekarang
                    </div>
                    <div id="clock" class="clock-time"></div>
                    <div id="date" class="clock-date"></div>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="panel-main-content">
                <div id="viewList" style="display:none"></div>
                <div id="viewAdd" style="display:none"></div>
                <div id="viewImport" style="display:none"></div>
                <div id="viewMaintenance" style="display:none;"></div>
                <div id="viewSettings" style="display:none;"></div>
            </main>
        </div>
    `;

    const data = loadData();

    // Update statistics
    function updateStats() {
        const statsGrid = document.getElementById('statsGrid');
        const totalPDFs = data.length;
        const tradingFX = data.filter(d => d.category === 'trading-fx' || !d.category).length;
        const saham = data.filter(d => d.category === 'saham').length;
        const lastUpdated = new Date().toLocaleDateString('id-ID');

        statsGrid.innerHTML = `
            <div class="stat-card" style="--stat-color: var(--primary);">
                <div class="stat-header">
                    <div class="stat-label">Total PDF</div>
                    <div class="stat-icon"><i class="fas fa-file-pdf"></i></div>
                </div>
                <div class="stat-value">${totalPDFs}</div>
            </div>
            <div class="stat-card" style="--stat-color: var(--success);">
                <div class="stat-header">
                    <div class="stat-label">Trading FX</div>
                    <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                </div>
                <div class="stat-value">${tradingFX}</div>
            </div>
            <div class="stat-card" style="--stat-color: var(--warning);">
                <div class="stat-header">
                    <div class="stat-label">Saham</div>
                    <div class="stat-icon"><i class="fas fa-chart-bar"></i></div>
                </div>
                <div class="stat-value">${saham}</div>
            </div>
            <div class="stat-card" style="--stat-color: var(--info);">
                <div class="stat-header">
                    <div class="stat-label">Last Update</div>
                    <div class="stat-icon"><i class="fas fa-calendar"></i></div>
                </div>
                <div class="stat-value" style="font-size:1.25rem;">${lastUpdated}</div>
            </div>
        `;
    }

    updateStats();

    // Views
    const viewList = document.getElementById('viewList');
    const viewAdd = document.getElementById('viewAdd');
    const viewImport = document.getElementById('viewImport');
    const viewMaintenance = document.getElementById('viewMaintenance');
    const viewSettings = document.getElementById('viewSettings');

    // Home navigation
    document.getElementById('goHome').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    // Tab navigation with active states
    const tabs = {
        list: document.getElementById('tabList'),
        add: document.getElementById('tabAdd'),
        import: document.getElementById('tabImport'),
        maintenance: document.getElementById('tabMaintenance'),
        settings: document.getElementById('tabSettings')
    };

    function setActiveTab(activeTab) {
        Object.values(tabs).forEach(tab => {
            tab.classList.remove('btn-primary');
            tab.classList.add('btn-secondary');
        });
        if (tabs[activeTab]) {
            tabs[activeTab].classList.remove('btn-secondary');
            tabs[activeTab].classList.add('btn-primary');
        }
    }

    function showView(name){
        viewList.style.display = 'none';
        viewAdd.style.display = 'none';
        viewImport.style.display = 'none';
        viewMaintenance.style.display = 'none';
        viewSettings.style.display = 'none';
        
        setActiveTab(name);
        
        if(name === 'list') { renderList(); viewList.style.display = 'block'; }
        if(name === 'add') { renderAdd(); viewAdd.style.display = 'block'; }
        if(name === 'import') { renderImport(); viewImport.style.display = 'block'; }
        if(name === 'maintenance') { renderMaintenance(); viewMaintenance.style.display = 'block'; }
        if(name === 'settings') { renderSettings(); viewSettings.style.display = 'block'; }
    }

    tabs.list.addEventListener('click', () => showView('list'));
    tabs.add.addEventListener('click', () => showView('add'));
    tabs.import.addEventListener('click', () => showView('import'));
    tabs.maintenance.addEventListener('click', () => showView('maintenance'));
    tabs.settings.addEventListener('click', () => showView('settings'));

    // Check URL for page parameter
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page === 'settings') {
        showView('settings');
    } else {
        showView('list');
    }
    
    document.getElementById('logout').addEventListener('click', () => { 
        if(confirm('Yakin ingin logout?')) {
            sessionStorage.removeItem('fx_isAdmin'); 
            window.location.href = 'index.html'; 
        }
    });

    function renderList(){
        viewList.innerHTML = '';
        
        const section = document.createElement('div');
        section.className = 'panel-section';
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <div class="section-title">
                <i class="fas fa-list"></i> Daftar PDF
            </div>
        `;

        const search = document.createElement('input');
        search.placeholder = 'Cari PDF...';
        search.style.cssText = `
            padding: 10px 16px;
            border: 2px solid var(--border);
            border-radius: 10px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 0.95rem;
            width: 300px;
            transition: all 0.3s ease;
        `;
        search.addEventListener('focus', () => {
            search.style.borderColor = 'var(--primary)';
            search.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
        });
        search.addEventListener('blur', () => {
            search.style.borderColor = 'var(--border)';
            search.style.boxShadow = 'none';
        });
        search.addEventListener('input', () => rebuildList(search.value));

        header.appendChild(search);
        section.appendChild(header);

        const listWrap = document.createElement('div');
        section.appendChild(listWrap);
        viewList.appendChild(section);

        function rebuildList(filter){
            listWrap.innerHTML = '';
            const items = data.filter(i => !filter || i.name.toLowerCase().includes(filter.toLowerCase()));
            
            if (items.length === 0) {
                listWrap.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>Tidak ada PDF ditemukan</h3>
                        <p>Coba kata kunci yang berbeda</p>
                    </div>
                `;
                return;
            }

            items.forEach((pdf, idx) => {
                const actualIdx = data.indexOf(pdf);
                const row = document.createElement('div');
                row.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    margin-bottom: 8px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    transition: all 0.3s ease;
                `;
                row.addEventListener('mouseenter', () => {
                    row.style.background = 'var(--bg-hover)';
                    row.style.borderColor = 'var(--primary)';
                    row.style.transform = 'translateX(4px)';
                });
                row.addEventListener('mouseleave', () => {
                    row.style.background = 'var(--bg-secondary)';
                    row.style.borderColor = 'var(--border)';
                    row.style.transform = 'translateX(0)';
                });

                const info = document.createElement('div');
                info.innerHTML = `
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
                        <span style="font-size:24px;">${pdf.thumbnail || '📄'}</span>
                        <div>
                            <div style="font-weight:700;color:var(--text-primary);font-size:1rem;">${pdf.name}</div>
                            <div style="display:flex;gap:8px;margin-top:4px;">
                                <span class="badge badge-${pdf.category === 'saham' ? 'warning' : 'success'}">${pdf.category || 'trading-fx'}</span>
                            </div>
                        </div>
                    </div>
                `;

                const actions = document.createElement('div');
                actions.style.cssText = 'display:flex;gap:8px;flex-shrink:0;';

                const viewBtn = document.createElement('button');
                viewBtn.className = 'btn btn-secondary';
                viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
                viewBtn.title = 'Lihat PDF';
                viewBtn.addEventListener('click', () => window.open(pdf.url,'_blank'));

                const editBtn = document.createElement('button');
                editBtn.className = 'btn btn-primary';
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.title = 'Edit';
                editBtn.addEventListener('click', () => { showView('add'); fillEdit(actualIdx); });

                const delBtn = document.createElement('button');
                delBtn.className = 'btn btn-danger';
                delBtn.innerHTML = '<i class="fas fa-trash"></i>';
                delBtn.title = 'Hapus';
                delBtn.addEventListener('click', () => { 
                    if(confirm(`Hapus "${pdf.name}"?`)){
                        data.splice(actualIdx,1);
                        saveData(data);
                        updateStats();
                        rebuildList(search.value);
                    }
                });

                actions.appendChild(viewBtn);
                actions.appendChild(editBtn);
                actions.appendChild(delBtn);

                row.appendChild(info);
                row.appendChild(actions);
                listWrap.appendChild(row);
            });
        }

        rebuildList('');
    }

    function renderAdd(){
        viewAdd.innerHTML = '';
        
        const section = document.createElement('div');
        section.className = 'panel-section';
        
        section.innerHTML = `
            <div class="section-header">
                <div class="section-title">
                    <i class="fas fa-plus-circle"></i> <span id="formTitle">Tambah PDF Baru</span>
                </div>
            </div>
        `;

        const form = document.createElement('form');
        form.innerHTML = `
            <div style="display:grid;gap:20px;">
                <div class="form-group">
                    <label style="display:block;color:var(--text-secondary);font-weight:600;margin-bottom:8px;font-size:0.9rem;">
                        <i class="fas fa-file-alt"></i> Nama File *
                    </label>
                    <input id="pdfName" type="text" placeholder="Contoh: Analisa Teknikal Dasar" required
                        style="width:100%;padding:12px 16px;background:var(--bg-secondary);border:2px solid var(--border);
                        border-radius:10px;color:var(--text-primary);font-size:1rem;transition:all 0.3s ease;">
                </div>

                <div class="form-group">
                    <label style="display:block;color:var(--text-secondary);font-weight:600;margin-bottom:8px;font-size:0.9rem;">
                        <i class="fas fa-link"></i> URL Google Drive *
                    </label>
                    <input id="pdfUrl" type="url" placeholder="https://drive.google.com/..." required
                        style="width:100%;padding:12px 16px;background:var(--bg-secondary);border:2px solid var(--border);
                        border-radius:10px;color:var(--text-primary);font-size:1rem;transition:all 0.3s ease;">
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div class="form-group">
                        <label style="display:block;color:var(--text-secondary);font-weight:600;margin-bottom:8px;font-size:0.9rem;">
                            <i class="fas fa-folder"></i> Kategori
                        </label>
                        <select id="pdfCategory"
                            style="width:100%;padding:12px 16px;background:var(--bg-secondary);border:2px solid var(--border);
                            border-radius:10px;color:var(--text-primary);font-size:1rem;transition:all 0.3s ease;">
                            <option value="trading-fx">Trading FX</option>
                            <option value="saham">Saham</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label style="display:block;color:var(--text-secondary);font-weight:600;margin-bottom:8px;font-size:0.9rem;">
                            <i class="fas fa-smile"></i> Emoji Thumbnail
                        </label>
                        <input id="pdfThumb" type="text" placeholder="📊" maxlength="2"
                            style="width:100%;padding:12px 16px;background:var(--bg-secondary);border:2px solid var(--border);
                            border-radius:10px;color:var(--text-primary);font-size:1rem;transition:all 0.3s ease;">
                    </div>
                </div>

                <input type="hidden" id="editIndex">

                <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px;">
                    <button type="reset" class="btn btn-secondary">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                    <button type="submit" class="btn btn-success">
                        <i class="fas fa-save"></i> Simpan
                    </button>
                </div>
            </div>
        `;

        // Add focus styles
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.borderColor = 'var(--primary)';
                input.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = 'var(--border)';
                input.style.boxShadow = 'none';
            });
        });

        section.appendChild(form);
        viewAdd.appendChild(section);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('pdfName').value.trim();
            const url = document.getElementById('pdfUrl').value.trim();
            const category = document.getElementById('pdfCategory').value;
            const thumb = document.getElementById('pdfThumb').value.trim();
            const editIdx = document.getElementById('editIndex').value;

            if(!name || !url) return alert('Nama & URL wajib diisi');

            if(editIdx !== ''){
                data[editIdx] = { name, url, category, thumbnail: thumb };
                alert('✅ PDF berhasil diupdate!');
            } else {
                data.unshift({ name, url, category, thumbnail: thumb });
                alert('✅ PDF berhasil ditambahkan!');
            }
            
            saveData(data);
            updateStats();
            form.reset();
            document.getElementById('editIndex').value = '';
            document.getElementById('formTitle').textContent = 'Tambah PDF Baru';
        });

        // fillEdit function used by list
        window.fillEdit = function(i){
            document.getElementById('pdfName').value = data[i].name || '';
            document.getElementById('pdfUrl').value = data[i].url || '';
            document.getElementById('pdfCategory').value = data[i].category || 'trading-fx';
            document.getElementById('pdfThumb').value = data[i].thumbnail || '';
            document.getElementById('editIndex').value = i;
            document.getElementById('formTitle').textContent = 'Edit PDF';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function renderImport(){
        viewImport.innerHTML = '';
        
        const section = document.createElement('div');
        section.className = 'panel-section';
        
        section.innerHTML = `
            <div class="section-header">
                <div class="section-title">
                    <i class="fas fa-file-import"></i> Import / Export Data
                </div>
            </div>

            <div style="display:grid;gap:20px;">
                <!-- Export Section -->
                <div style="padding:20px;background:var(--bg-secondary);border-radius:12px;border:1px solid var(--border);">
                    <h3 style="margin:0 0 12px 0;color:var(--text-primary);display:flex;align-items:center;gap:8px;">
                        <i class="fas fa-file-export" style="color:var(--success);"></i>
                        Export Data
                    </h3>
                    <p style="color:var(--text-secondary);margin-bottom:16px;">Download semua data PDF dalam format JSON</p>
                    <button id="exportBtn" class="btn btn-success" style="width:100%;">
                        <i class="fas fa-download"></i> Export JSON
                    </button>
                </div>

                <!-- Import Section -->
                <div style="padding:20px;background:var(--bg-secondary);border-radius:12px;border:1px solid var(--border);">
                    <h3 style="margin:0 0 12px 0;color:var(--text-primary);display:flex;align-items:center;gap:8px;">
                        <i class="fas fa-file-import" style="color:var(--warning);"></i>
                        Import Data
                    </h3>
                    <p style="color:var(--text-secondary);margin-bottom:16px;">Upload file JSON untuk mengganti semua data (backup terlebih dahulu!)</p>
                    <input type="file" id="importInput" accept="application/json" 
                        style="display:none;">
                    <button id="importBtn" class="btn btn-warning" style="width:100%;">
                        <i class="fas fa-upload"></i> Pilih File JSON
                    </button>
                </div>

                <!-- Info -->
                <div style="padding:16px;background:rgba(59, 130, 246, 0.1);border:1px solid var(--info);border-radius:12px;">
                    <div style="display:flex;gap:12px;">
                        <i class="fas fa-info-circle" style="color:var(--info);font-size:24px;"></i>
                        <div>
                            <h4 style="margin:0 0 8px 0;color:var(--text-primary);">Informasi Penting</h4>
                            <ul style="margin:0;padding-left:20px;color:var(--text-secondary);">
                                <li>Backup data sebelum import</li>
                                <li>Format file harus JSON array</li>
                                <li>Import akan mengganti semua data existing</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        viewImport.appendChild(section);

        // Export handler
        document.getElementById('exportBtn').addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fx_admin_data_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            alert('✅ Data berhasil di-export!');
        });

        // Import handler
        const importInput = document.getElementById('importInput');
        document.getElementById('importBtn').addEventListener('click', () => {
            importInput.click();
        });

        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(!file) return;
            
            const reader = new FileReader();
            reader.onload = () => {
                try{
                    const parsed = JSON.parse(reader.result);
                    if(!Array.isArray(parsed)) throw new Error('Format harus array');
                    
                    if(confirm(`Import ${parsed.length} items? Data existing akan ditimpa!`)) {
                        data.length = 0;
                        parsed.forEach(x => data.push(x));
                        saveData(data);
                        updateStats();
                        alert('✅ Import berhasil!');
                        importInput.value = '';
                    }
                }catch(err){
                    alert('❌ Gagal import: '+err.message);
                }
            };
            reader.readAsText(file);
        });
    }

    function renderMaintenance(){
        const view = document.getElementById('viewMaintenance');
        const cfgKey = 'fx_maintenance_config';
        
        function getCfg(){
            try{
                const raw = localStorage.getItem(cfgKey);
                if(raw) return Object.assign({}, JSON.parse(raw));
            }catch(e){}
            return null;
        }

        function setCfg(obj){
            localStorage.setItem(cfgKey, JSON.stringify(obj));
        }

        const cfg = getCfg() || { enabled:false, maintenancePage:'maintenance.html', allowedIPs:[] };
        
        // Check current access code status
        function getCurrentAccessCode() {
            try {
                const raw = localStorage.getItem('fx_temp_access_code');
                if (!raw) return null;
                const data = JSON.parse(raw);
                if (Date.now() > data.expiry) {
                    localStorage.removeItem('fx_temp_access_code');
                    return null;
                }
                return data;
            } catch (e) {
                return null;
            }
        }

        // Generate new access code
        function generateAccessCode() {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
            
            const codeData = {
                code: code,
                expiry: expiry,
                generated: Date.now()
            };
            
            localStorage.setItem('fx_temp_access_code', JSON.stringify(codeData));
            return codeData;
        }

        // Format time remaining
        function formatTimeRemaining(expiry) {
            const diff = expiry - Date.now();
            if (diff <= 0) return 'Expired';
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            if (hours > 0) {
                return `${hours} jam ${minutes} menit`;
            }
            return `${minutes} menit`;
        }

        const currentCode = getCurrentAccessCode();

        view.innerHTML = `
            <div class="panel-section">
                <div class="section-header">
                    <div class="section-title">
                        <i class="fas fa-tools"></i> Maintenance Mode
                    </div>
                </div>

                <div style="display:grid;gap:20px;">
                    <!-- Status Card -->
                    <div style="padding:20px;background:${cfg.enabled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
                        border:1px solid ${cfg.enabled ? 'var(--danger)' : 'var(--success)'};border-radius:12px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div style="width:48px;height:48px;background:${cfg.enabled ? 'var(--danger)' : 'var(--success)'};
                                border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;">
                                <i class="fas fa-${cfg.enabled ? 'exclamation-triangle' : 'check-circle'}"></i>
                            </div>
                            <div>
                                <h3 style="margin:0;color:var(--text-primary);">
                                    Status: ${cfg.enabled ? 'Maintenance Mode Aktif' : 'Situs Online'}
                                </h3>
                                <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.9rem;">
                                    ${cfg.enabled ? 'Pengguna akan diarahkan ke halaman maintenance' : 'Semua pengguna dapat mengakses situs'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Access Code Generator -->
                    <div style="padding:20px;background:var(--bg-secondary);border-radius:12px;border:1px solid var(--border);">
                        <h3 style="margin:0 0 16px 0;color:var(--text-primary);">
                            <i class="fas fa-key"></i> Kode Akses Sementara
                        </h3>
                        <p style="color:var(--text-secondary);margin-bottom:16px;font-size:0.9rem;">
                            Generate kode 6 digit yang berlaku 24 jam untuk memberikan akses sementara ke pengguna
                        </p>
                        
                        ${currentCode ? `
                            <!-- Active Code Display -->
                            <div style="background:rgba(16, 185, 129, 0.1);border:1px solid var(--success);
                                border-radius:12px;padding:20px;margin-bottom:16px;">
                                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                                    <span style="color:var(--text-secondary);font-size:0.9rem;font-weight:600;">
                                        <i class="fas fa-check-circle" style="color:var(--success);"></i> Kode Aktif
                                    </span>
                                    <span style="color:var(--text-muted);font-size:0.85rem;">
                                        <i class="fas fa-clock"></i> ${formatTimeRemaining(currentCode.expiry)} lagi
                                    </span>
                                </div>
                                <div style="display:flex;align-items:center;gap:12px;">
                                    <input type="text" id="displayCode" value="${currentCode.code}" readonly
                                        style="flex:1;padding:16px;background:white;border:2px solid var(--success);
                                        border-radius:10px;font-size:1.75rem;font-weight:800;text-align:center;
                                        font-family:'Poppins',sans-serif;color:var(--success);letter-spacing:4px;">
                                    <button id="copyCode" class="btn btn-success" style="height:56px;width:56px;padding:0;">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <p style="color:var(--text-muted);font-size:0.85rem;margin:12px 0 0 0;text-align:center;">
                                    <i class="fas fa-info-circle"></i> Kirim kode ini ke pengguna via WhatsApp
                                </p>
                            </div>
                        ` : `
                            <!-- No Active Code -->
                            <div style="background:rgba(245, 158, 11, 0.1);border:1px solid var(--warning);
                                border-radius:12px;padding:20px;margin-bottom:16px;text-align:center;">
                                <i class="fas fa-key" style="font-size:48px;color:var(--warning);margin-bottom:12px;"></i>
                                <p style="color:var(--text-secondary);margin:0;">Belum ada kode aktif</p>
                            </div>
                        `}
                        
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                            <button id="generateCode" class="btn ${currentCode ? 'btn-warning' : 'btn-success'}" style="height:48px;">
                                <i class="fas fa-sync-alt"></i> ${currentCode ? 'Generate Ulang' : 'Generate Kode'}
                            </button>
                            <button id="revokeCode" class="btn btn-danger" style="height:48px;" ${!currentCode ? 'disabled' : ''}>
                                <i class="fas fa-times-circle"></i> Hapus Kode
                            </button>
                        </div>
                    </div>

                    <!-- Configuration -->
                    <div style="padding:20px;background:var(--bg-secondary);border-radius:12px;border:1px solid var(--border);">
                        <h3 style="margin:0 0 16px 0;color:var(--text-primary);">Konfigurasi</h3>
                        
                        <div class="form-group" style="margin-bottom:16px;">
                            <label style="display:flex;align-items:center;gap:12px;cursor:pointer;font-weight:600;">
                                <input type="checkbox" id="mntEnable" ${cfg.enabled ? 'checked' : ''}
                                    style="width:20px;height:20px;cursor:pointer;">
                                <span>Aktifkan Maintenance Mode</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label style="display:block;color:var(--text-secondary);font-weight:600;margin-bottom:8px;font-size:0.9rem;">
                                <i class="fas fa-file"></i> Halaman Maintenance
                            </label>
                            <input id="mntPage" type="text" value="${cfg.maintenancePage || 'maintenance.html'}" placeholder="maintenance.html"
                                style="width:100%;padding:12px 16px;background:var(--bg-primary);border:2px solid var(--border);
                                border-radius:10px;color:var(--text-primary);font-size:1rem;">
                        </div>
                    </div>

                    <!-- Actions -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <button id="saveMnt" class="btn btn-primary" style="height:48px;">
                            <i class="fas fa-save"></i> Simpan Konfigurasi
                        </button>
                        <button id="clearMnt" class="btn btn-secondary" style="height:48px;">
                            <i class="fas fa-undo"></i> Reset ke Default
                        </button>
                    </div>

                    <!-- Quick Actions -->
                    <div style="padding:20px;background:var(--bg-secondary);border-radius:12px;border:1px solid var(--border);">
                        <h3 style="margin:0 0 16px 0;color:var(--text-primary);">Quick Actions</h3>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                            <button id="activateNow" class="btn btn-danger" style="height:48px;">
                                <i class="fas fa-power-off"></i> Aktifkan Sekarang
                            </button>
                            <button id="deactivateNow" class="btn btn-success" style="height:48px;">
                                <i class="fas fa-check"></i> Nonaktifkan
                            </button>
                        </div>
                        <p style="color:var(--text-muted);font-size:0.85rem;margin:12px 0 0 0;text-align:center;">
                            <i class="fas fa-exclamation-triangle"></i> Perubahan akan berlaku segera
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Add focus styles
        const inputs = view.querySelectorAll('input[type="text"]:not([readonly])');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.borderColor = 'var(--primary)';
                input.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = 'var(--border)';
                input.style.boxShadow = 'none';
            });
        });

        // Generate Code Handler
        const generateBtn = document.getElementById('generateCode');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                if (currentCode) {
                    if (!confirm('Generate ulang kode? Kode lama akan tidak berlaku lagi.')) return;
                }
                const newCode = generateAccessCode();
                alert(`✅ Kode akses berhasil di-generate!\n\nKode: ${newCode.code}\nBerlaku: 24 jam\n\nKirim kode ini ke pengguna.`);
                renderMaintenance(); // Refresh view
            });
        }

        // Copy Code Handler
        const copyBtn = document.getElementById('copyCode');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const codeInput = document.getElementById('displayCode');
                codeInput.select();
                document.execCommand('copy');
                
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.style.background = 'var(--success)';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.style.background = '';
                }, 2000);
                
                alert('✅ Kode berhasil disalin ke clipboard!');
            });
        }

        // Revoke Code Handler
        const revokeBtn = document.getElementById('revokeCode');
        if (revokeBtn) {
            revokeBtn.addEventListener('click', () => {
                if (!confirm('Hapus kode akses aktif? Kode tidak akan bisa digunakan lagi.')) return;
                localStorage.removeItem('fx_temp_access_code');
                alert('✅ Kode akses berhasil dihapus!');
                renderMaintenance(); // Refresh view
            });
        }

        // Event handlers
        document.getElementById('saveMnt').addEventListener('click', () => {
            const newCfg = {
                enabled: document.getElementById('mntEnable').checked,
                maintenancePage: document.getElementById('mntPage').value || 'maintenance.html',
                allowedIPs: [] // Keep for backwards compatibility but not used
            };
            setCfg(newCfg);
            alert('✅ Konfigurasi maintenance disimpan!');
            renderMaintenance(); // Refresh view
        });

        document.getElementById('clearMnt').addEventListener('click', () => {
            if(!confirm('Reset konfigurasi maintenance ke default?')) return;
            localStorage.removeItem(cfgKey);
            alert('✅ Konfigurasi direset!');
            renderMaintenance(); // Refresh view
        });

        document.getElementById('activateNow').addEventListener('click', () => {
            if(!confirm('Aktifkan maintenance mode sekarang? Situs akan segera dialihkan ke halaman maintenance.')) return;
            const newCfg = {
                enabled: true,
                maintenancePage: document.getElementById('mntPage').value || 'maintenance.html',
                allowedIPs: []
            };
            setCfg(newCfg);
            
            // Revoke current admin session access so they also get redirected to verify
            sessionStorage.removeItem('maintenanceAccess');
            
            alert('🚧 Maintenance mode diaktifkan! Anda akan dialihkan untuk melihat hasilnya.');
            window.location.href = '../' + (newCfg.maintenancePage);
        });

        document.getElementById('deactivateNow').addEventListener('click', () => {
            if(!confirm('Nonaktifkan maintenance mode? Situs akan kembali online.')) return;
            const newCfg = {
                enabled: false,
                maintenancePage: document.getElementById('mntPage').value || 'maintenance.html',
                allowedIPs: []
            };
            setCfg(newCfg);
            alert('✅ Situs kembali online!');
            renderMaintenance(); // Refresh view
        });
    }

    function renderSettings() {
        viewSettings.innerHTML = '';
        
        const section = document.createElement('div');
        section.className = 'panel-section';
        
        section.innerHTML = `
            <div class="section-header">
                <div class="section-title">
                    <i class="fas fa-cog"></i> Pengaturan Akun
                </div>
            </div>
            
            <div style="display:grid; gap:24px; max-width: 500px;">
                <!-- Change Name -->
                <div class="form-group">
                    <label style="display:block; color:var(--text-secondary); font-weight:600; margin-bottom:8px;">
                        <i class="fas fa-user-tag"></i> Nama Admin
                    </label>
                    <input id="setAdminName" type="text" value="${localStorage.getItem('fx_adminName') || 'Admin'}" 
                        style="width:100%; padding:12px 16px; background:var(--bg-secondary); border:2px solid var(--border); 
                        border-radius:10px; color:var(--text-primary); font-size:1rem;">
                </div>

                <div class="dropdown-divider"></div>

                <!-- Change Password -->
                <div class="form-group">
                    <label style="display:block; color:var(--text-secondary); font-weight:600; margin-bottom:8px;">
                        <i class="fas fa-lock"></i> Password Baru
                    </label>
                    <input id="setAdminPass" type="password" placeholder="Biarkan kosong jika tidak ingin ganti" 
                        style="width:100%; padding:12px 16px; background:var(--bg-secondary); border:2px solid var(--border); 
                        border-radius:10px; color:var(--text-primary); font-size:1rem;">
                </div>

                <div class="form-group">
                    <label style="display:block; color:var(--text-secondary); font-weight:600; margin-bottom:8px;">
                        <i class="fas fa-shield-check"></i> Konfirmasi Password Baru
                    </label>
                    <input id="setAdminPassConf" type="password" placeholder="Ulangi password baru" 
                        style="width:100%; padding:12px 16px; background:var(--bg-secondary); border:2px solid var(--border); 
                        border-radius:10px; color:var(--text-primary); font-size:1rem;">
                </div>

                <div style="margin-top: 10px;">
                    <button id="saveSettings" class="btn btn-primary" style="width:100%; justify-content:center; padding:15px;">
                        <i class="fas fa-save"></i> Simpan Perubahan
                    </button>
                </div>
            </div>
        `;
        
        viewSettings.appendChild(section);

        document.getElementById('saveSettings').addEventListener('click', () => {
            const newName = document.getElementById('setAdminName').value.trim();
            const newPass = document.getElementById('setAdminPass').value;
            const passConf = document.getElementById('setAdminPassConf').value;

            if (!newName) {
                alert('Nama tidak boleh kosong!');
                return;
            }

            if (newPass) {
                if (newPass !== passConf) {
                    alert('Konfirmasi password tidak cocok!');
                    return;
                }
                localStorage.setItem('fx_adminPass', newPass);
            }

            localStorage.setItem('fx_adminName', newName);
            alert('✅ Pengaturan berhasil disimpan!');
            
            // Reload to update UI if necessary
            location.reload();
        });
    }

    // default view
    showView('list');

    // --- Clock & Date ---
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    
    function updateClock(){
        const d = new Date();
        const hh = String(d.getHours()).padStart(2,'0');
        const mm = String(d.getMinutes()).padStart(2,'0');
        const ss = String(d.getSeconds()).padStart(2,'0');
        clockEl.textContent = `${hh}:${mm}:${ss}`;
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = d.toLocaleDateString('id-ID', options);
    }
    
    updateClock();
    setInterval(updateClock, 1000);
})();