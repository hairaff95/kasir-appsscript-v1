/**
 * auth.js — Halaman Login, Registrasi, dan Demo Mode
 */
const AuthPage = {
  _view: 'login', // 'login' | 'register'
  _busy: false,
  _tempEmail: '',

  render(container) {
    if (this._view === 'register') {
      container.innerHTML = this._registerHtml();
      this._bindRegister(container);
    } else {
      container.innerHTML = this._loginHtml();
      this._bindLogin(container);
    }
  },

  _loginHtml() {
    return `
      <div class="auth-wrapper" style="min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #f0f3ff 0%, #e6ecff 100%); font-family: 'Plus Jakarta Sans', sans-serif;">
        <div class="auth-card" style="background: rgba(255, 255, 255, 0.9); border: 1.5px solid rgba(16, 74, 240, 0.08); border-radius: 28px; width: 100%; max-width: 400px; padding: 32px 24px; box-shadow: 0 16px 40px rgba(16, 74, 240, 0.08); backdrop-filter: blur(12px); position: relative; overflow: hidden;">
          
          <!-- Decorative Blur Background -->
          <div style="position: absolute; top: -30%; right: -20%; width: 150px; height: 150px; background: rgba(16, 74, 240, 0.06); border-radius: 50%; filter: blur(30px); z-index: 0;"></div>
          <div style="position: absolute; bottom: -20%; left: -20%; width: 120px; height: 120px; background: rgba(16, 74, 240, 0.04); border-radius: 50%; filter: blur(25px); z-index: 0;"></div>
          
          <div style="position: relative; z-index: 1;">
            <!-- Logo & Title -->
            <div style="text-align: center; margin-bottom: 28px;">
              <div style="width: 54px; height: 54px; background: linear-gradient(135deg, #104af0 0%, #2d5bff 100%); border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; box-shadow: 0 4px 12px rgba(16, 74, 240, 0.2)">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h2 style="font-size: 22px; font-weight: 800; color: #131b2e; margin: 0 0 6px;">LanggengMakmur</h2>
              <p style="font-size: 13px; color: #64748b; margin: 0;">Pencatatan Kas & Kasbon Warung</p>
            </div>

            <!-- Form -->
            <form id="login-form" style="display: flex; flex-direction: column; gap: 16px;">
              <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Email</label>
                <input type="email" id="login-email" required class="form-input" value="${this._tempEmail || ''}" placeholder="contoh@gmail.com" style="width: 100%; padding: 12px 14px; border: 1.5px solid rgba(196,197,217,0.4); border-radius: 14px; font-size: 14px; outline: none; transition: all 0.2s;" />
              </div>
              
              <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Password</label>
                <input type="password" id="login-password" required class="form-input" placeholder="Masukkan password" style="width: 100%; padding: 12px 14px; border: 1.5px solid rgba(196,197,217,0.4); border-radius: 14px; font-size: 14px; outline: none; transition: all 0.2s;" />
              </div>

              <button type="submit" id="btn-login-submit" style="width: 100%; padding: 14px; margin-top: 6px; background: linear-gradient(135deg, #104af0 0%, #2d5bff 100%); color: white; border: none; border-radius: 16px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(16, 74, 240, 0.2); display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>Masuk Ke Aplikasi</span>
              </button>
            </form>

            <!-- Toggle Register -->
            <div style="text-align: center; margin-top: 20px; font-size: 13.5px; color: #64748b;">
              Belum punya akun? <a href="#" onclick="AuthPage._setView('register')" style="color: #104af0; font-weight: 700; text-decoration: none;">Daftar Sekarang</a>
            </div>

            <!-- Separator -->
            <div style="display: flex; align-items: center; text-align: center; margin: 20px 0; color: #94a3b8; font-size: 12px;">
              <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
              <span style="padding: 0 10px;">ATAU</span>
              <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
            </div>

            <!-- Bypass to Demo Mode -->
            <button onclick="AuthPage._bypassToDemo()" style="width: 100%; padding: 12px; background: white; border: 1.5px solid rgba(16, 74, 240, 0.2); border-radius: 16px; color: #104af0; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;" onmouseover="this.style.background='rgba(16, 74, 240, 0.04)'" onmouseout="this.style.background='white'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Gunakan Mode Demo (Lokal)
            </button>
          </div>

        </div>
      </div>
    `;
  },

  _registerHtml() {
    return `
      <div class="auth-wrapper" style="min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #f0f3ff 0%, #e6ecff 100%); font-family: 'Plus Jakarta Sans', sans-serif;">
        <div class="auth-card" style="background: rgba(255, 255, 255, 0.9); border: 1.5px solid rgba(16, 74, 240, 0.08); border-radius: 28px; width: 100%; max-width: 400px; padding: 32px 24px; box-shadow: 0 16px 40px rgba(16, 74, 240, 0.08); backdrop-filter: blur(12px); position: relative; overflow: hidden;">
          
          <div style="position: absolute; top: -30%; right: -20%; width: 150px; height: 150px; background: rgba(16, 74, 240, 0.06); border-radius: 50%; filter: blur(30px); z-index: 0;"></div>
          
          <div style="position: relative; z-index: 1;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="font-size: 22px; font-weight: 800; color: #131b2e; margin: 0 0 6px;">Pendaftaran Akun</h2>
              <p style="font-size: 13px; color: #64748b; margin: 0;">Hubungkan ke Database Google Sheets Anda</p>
            </div>

            <!-- Form -->
            <form id="register-form" style="display: flex; flex-direction: column; gap: 14px;">
              <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Nama Pemilik</label>
                <input type="text" id="reg-name" required class="form-input" placeholder="Nama Lengkap" style="width: 100%; padding: 11px 14px; border: 1.5px solid rgba(196,197,217,0.4); border-radius: 14px; font-size: 14px; outline: none; transition: all 0.2s;" />
              </div>

              <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Nama Warung / Toko</label>
                <input type="text" id="reg-storename" required class="form-input" placeholder="Nama Toko Anda" style="width: 100%; padding: 11px 14px; border: 1.5px solid rgba(196,197,217,0.4); border-radius: 14px; font-size: 14px; outline: none; transition: all 0.2s;" />
              </div>
              
              <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Email</label>
                <input type="email" id="reg-email" required class="form-input" placeholder="email@gmail.com" style="width: 100%; padding: 11px 14px; border: 1.5px solid rgba(196,197,217,0.4); border-radius: 14px; font-size: 14px; outline: none; transition: all 0.2s;" />
              </div>
              
              <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Password</label>
                <input type="password" id="reg-password" required class="form-input" placeholder="Min. 6 karakter" minlength="6" style="width: 100%; padding: 11px 14px; border: 1.5px solid rgba(196,197,217,0.4); border-radius: 14px; font-size: 14px; outline: none; transition: all 0.2s;" />
              </div>

              <button type="submit" id="btn-register-submit" style="width: 100%; padding: 13px; margin-top: 6px; background: linear-gradient(135deg, #104af0 0%, #2d5bff 100%); color: white; border: none; border-radius: 16px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(16, 74, 240, 0.2); display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>Daftar Akun Baru</span>
              </button>
            </form>

            <!-- Toggle Login -->
            <div style="text-align: center; margin-top: 18px; font-size: 13.5px; color: #64748b;">
              Sudah punya akun? <a href="#" onclick="AuthPage._setView('login')" style="color: #104af0; font-weight: 700; text-decoration: none;">Masuk (Login)</a>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  _setView(view) {
    this._view = view;
    const container = document.getElementById('auth-container');
    if (container) this.render(container);
  },

  _setBusy(v, formType) {
    this._busy = v;
    const btn = document.getElementById(`btn-${formType}-submit`);
    if (btn) {
      btn.disabled = v;
      btn.style.opacity = v ? '0.7' : '1';
      btn.querySelector('span').innerText = v ? 'Memproses...' : (formType === 'login' ? 'Masuk Ke Aplikasi' : 'Daftar Akun Baru');
    }
  },

  _bindLogin(container) {
    const emailInput = container.querySelector('#login-email');
    const passInput = container.querySelector('#login-password');

    // Focus style
    [emailInput, passInput].forEach(input => {
      input.addEventListener('focus', () => input.style.borderColor = '#104af0');
      input.addEventListener('blur', () => input.style.borderColor = 'rgba(196,197,217,0.4)');
    });

    container.querySelector('#login-form').addEventListener('submit', async e => {
      e.preventDefault();
      if (this._busy) return;

      const email = emailInput.value.trim();
      const password = passInput.value;

      this._setBusy(true, 'login');
      try {
        const user = await Api.login(email, password);
        Toast.success('Selamat datang, ' + user.name + '!');
        
        // Save user session & set production mode
        localStorage.setItem('lm_user', JSON.stringify(user));
        localStorage.setItem('demo_mode', 'false');
        
        // Update profile cache
        localStorage.setItem('lm_profile', JSON.stringify({
          name: user.name,
          storeName: user.name.endsWith('Toko') || user.name.endsWith('Warung') ? user.name : user.name + ' Store',
          email: user.email,
        }));

        // Restart App to refresh shell
        location.reload();
      } catch (err) {
        Toast.error('Login gagal: ' + err.message);
        this._setBusy(false, 'login');
      }
    });
  },

  _bindRegister(container) {
    const nameInput = container.querySelector('#reg-name');
    const storeInput = container.querySelector('#reg-storename');
    const emailInput = container.querySelector('#reg-email');
    const passInput = container.querySelector('#reg-password');

    // Focus style
    [nameInput, storeInput, emailInput, passInput].forEach(input => {
      input.addEventListener('focus', () => input.style.borderColor = '#104af0');
      input.addEventListener('blur', () => input.style.borderColor = 'rgba(196,197,217,0.4)');
    });

    container.querySelector('#register-form').addEventListener('submit', async e => {
      e.preventDefault();
      if (this._busy) return;

      const name = nameInput.value.trim();
      const storeName = storeInput.value.trim();
      const email = emailInput.value.trim();
      const password = passInput.value;

      this._setBusy(true, 'register');
      try {
        const user = await Api.register(name, email, password);
        
        // Save profile locally so it's loaded when they login
        localStorage.setItem('lm_profile', JSON.stringify({
          name: name,
          storeName: storeName,
          email: email,
        }));

        Toast.success('Registrasi berhasil! Silakan masuk dengan akun Anda.');
        
        // Redirect to login screen & pre-fill email
        AuthPage._tempEmail = email;
        this._setBusy(false, 'register');
        AuthPage._setView('login');
      } catch (err) {
        Toast.error('Pendaftaran gagal: ' + err.message);
        this._setBusy(false, 'register');
      }
    });
  },

  _bypassToDemo() {
    // Set mock user for session bypass
    const mockUser = {
      id: 'USR-DEMO',
      name: 'Pemilik Toko (Demo)',
      email: 'demo@lvh.me',
      store_id: 'default',
    };
    
    localStorage.setItem('lm_user', JSON.stringify(mockUser));
    localStorage.setItem('demo_mode', 'true');
    
    // Save demo profile
    localStorage.setItem('lm_profile', JSON.stringify({
      name: 'Pemilik Toko',
      storeName: 'LanggengMakmur',
      email: '',
    }));

    Toast.success('Masuk dengan Mode Demo Lokal');
    location.reload();
  }
};

window.AuthPage = AuthPage;
