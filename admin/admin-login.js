(function(){
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'sayanguci1';

    const form = document.getElementById('adminForm');
    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');
    const msg = document.getElementById('adminMessage');

    function showMessage(text, type){
        msg.className = 'message';
        if(type === 'success') msg.classList.add('success');
        else if(type === 'error') msg.classList.add('error');
        else msg.classList.add('info');
        msg.textContent = text;
        msg.style.display = 'flex';
        setTimeout(() => { msg.style.display = 'none'; }, 3500);
    }

    form.addEventListener('submit', function(e){
        e.preventDefault();
        const u = usernameEl.value.trim();
        const p = passwordEl.value;

        const dynamicUser = localStorage.getItem('fx_adminName') || ADMIN_USER;
        const dynamicPass = localStorage.getItem('fx_adminPass') || ADMIN_PASS;

        if(u === dynamicUser && p === dynamicPass){
            sessionStorage.setItem('fx_isAdmin', '1');
            showMessage('Login berhasil. Mengarahkan ke panel...', 'success');
            setTimeout(() => { window.location.href = 'panel.html'; }, 700);
        } else {
            showMessage('Username atau password salah.', 'error');
        }
    });
})();
