// Green Africa Hub Login System JavaScript
class GreenAfricaHubAuth {
    constructor() {
        this.currentForm = 'login';
        this.selectedTier = null;
        this.init();
    }

    init() {
        console.log('🔐 Green Africa Hub Authentication - Initializing...');
        
        this.setupEventListeners();
        this.checkExistingSession();
        
        console.log('✅ Authentication system initialized');
    }

    setupEventListeners() {
        // Form switching
        document.getElementById('showSignupBtn')?.addEventListener('click', () => this.showSignupForm());
        document.getElementById('showLoginBtn')?.addEventListener('click', () => this.showLoginForm());
        
        // Password visibility toggles
        document.getElementById('togglePassword')?.addEventListener('click', () => this.togglePasswordVisibility('login'));
        document.getElementById('toggleSignupPassword')?.addEventListener('click', () => this.togglePasswordVisibility('signup'));
        
        // Form submissions
        document.getElementById('loginBtn')?.addEventListener('click', (e) => this.handleLogin(e));
        document.getElementById('signupBtn')?.addEventListener('click', (e) => this.handleSignup(e));
        
        // Tier selection
        document.querySelectorAll('.tier-card').forEach(card => {
            card.addEventListener('click', () => this.selectTier(card.dataset.tier));
        });
        
        // Password strength checker
        document.getElementById('signupPassword')?.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        
        // Enter key submissions
        document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin(e);
        });
        
        document.getElementById('signupConfirmPassword')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSignup(e);
        });
    }

    checkExistingSession() {
        const memberId = localStorage.getItem('gah_memberId') || sessionStorage.getItem('gah_memberId');
        
        if (memberId) {
            // Validate session
            this.validateSession(memberId);
        }
    }

    async validateSession(memberId) {
        try {
            const response = await this.callBackend('validateSession', { memberId });
            
            if (response.success && response.data.valid) {
                // Session is valid, redirect to dashboard
                this.redirectToDashboard();
            } else {
                // Session invalid, clear it
                this.clearSession();
            }
        } catch (error) {
            console.error('❌ Session validation failed:', error);
            this.clearSession();
        }
    }

    showLoginForm() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
        this.currentForm = 'login';
    }

    showSignupForm() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupForm').classList.remove('hidden');
        this.currentForm = 'signup';
    }

    togglePasswordVisibility(form) {
        const passwordInput = form === 'login' ? 
            document.getElementById('loginPassword') : 
            document.getElementById('signupPassword');
        
        const toggleBtn = form === 'login' ? 
            document.getElementById('togglePassword') : 
            document.getElementById('toggleSignupPassword');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            passwordInput.type = 'password';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }

    selectTier(tier) {
        // Remove previous selection
        document.querySelectorAll('.tier-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to clicked tier
        const selectedCard = document.querySelector(`[data-tier="${tier}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.selectedTier = tier;
        }
    }

    checkPasswordStrength(password) {
        const strengthBar = document.getElementById('passwordStrength');
        const strengthText = document.getElementById('passwordStrengthText');
        
        if (!password) {
            strengthBar.className = 'password-strength';
            strengthText.textContent = 'Password strength';
            return;
        }
        
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // Complexity checks
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        // Update UI
        if (strength <= 2) {
            strengthBar.className = 'password-strength strength-weak';
            strengthText.textContent = 'Weak password';
            strengthText.className = 'text-xs text-red-500 mt-1';
        } else if (strength <= 4) {
            strengthBar.className = 'password-strength strength-medium';
            strengthText.textContent = 'Medium strength';
            strengthText.className = 'text-xs text-yellow-500 mt-1';
        } else {
            strengthBar.className = 'password-strength strength-strong';
            strengthText.textContent = 'Strong password';
            strengthText.className = 'text-xs text-green-500 mt-1';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Validation
        if (!this.validateLoginForm(email, password)) {
            return;
        }
        
        try {
            this.showLoading(true);
            
            const response = await this.callBackend('login', {
                email: email,
                password: password,
                rememberMe: rememberMe
            });
            
            if (response.success) {
                this.handleLoginSuccess(response.data, rememberMe);
            } else {
                this.showError(response.message || 'Login failed. Please check your credentials.');
            }
            
        } catch (error) {
            console.error('❌ Login error:', error);
            this.showError('Login failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const formData = this.getSignupFormData();
        
        // Validation
        if (!this.validateSignupForm(formData)) {
            return;
        }
        
        try {
            this.showLoading(true);
            
            const response = await this.callBackend('signup', formData);
            
            if (response.success) {
                this.handleSignupSuccess(response.data);
            } else {
                this.showError(response.message || 'Signup failed. Please try again.');
            }
            
        } catch (error) {
            console.error('❌ Signup error:', error);
            this.showError('Signup failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    getSignupFormData() {
        return {
            name: document.getElementById('signupName').value,
            email: document.getElementById('signupEmail').value,
            password: document.getElementById('signupPassword').value,
            confirmPassword: document.getElementById('signupConfirmPassword').value,
            tier: this.selectedTier || 'basic',
            referralCode: document.getElementById('referralCode').value,
            agreeTerms: document.getElementById('agreeTerms').checked
        };
    }

    validateLoginForm(email, password) {
        if (!email || !password) {
            this.showError('Please fill in all fields');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }
        
        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return false;
        }
        
        return true;
    }

    validateSignupForm(data) {
        // Check required fields
        if (!data.name || !data.email || !data.password || !data.confirmPassword) {
            this.showError('Please fill in all required fields');
            return false;
        }
        
        // Email validation
        if (!this.isValidEmail(data.email)) {
            this.showError('Please enter a valid email address');
            return false;
        }
        
        // Password validation
        if (data.password.length < 8) {
            this.showError('Password must be at least 8 characters');
            return false;
        }
        
        // Password confirmation
        if (data.password !== data.confirmPassword) {
            this.showError('Passwords do not match');
            return false;
        }
        
        // Terms agreement
        if (!data.agreeTerms) {
            this.showError('Please agree to the Terms of Service and Privacy Policy');
            return false;
        }
        
        // Tier selection
        if (!data.tier) {
            this.showError('Please select a membership tier');
            return false;
        }
        
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleLoginSuccess(userData, rememberMe) {
        // Store session
        if (rememberMe) {
            localStorage.setItem('gah_memberId', userData.memberId);
            localStorage.setItem('gah_memberData', JSON.stringify(userData));
        } else {
            sessionStorage.setItem('gah_memberId', userData.memberId);
            sessionStorage.setItem('gah_memberData', JSON.stringify(userData));
        }
        
        this.showSuccess('Login successful! Redirecting to dashboard...');
        
        // Redirect to dashboard
        setTimeout(() => {
            this.redirectToDashboard();
        }, 1500);
    }

    handleSignupSuccess(userData) {
        this.showSuccess('Account created successfully! Redirecting to dashboard...');
        
        // Store session
        localStorage.setItem('gah_memberId', userData.memberId);
        localStorage.setItem('gah_memberData', JSON.stringify(userData));
        
        // Redirect to dashboard
        setTimeout(() => {
            this.redirectToDashboard();
        }, 1500);
    }

    clearSession() {
        localStorage.removeItem('gah_memberId');
        localStorage.removeItem('gah_memberData');
        sessionStorage.removeItem('gah_memberId');
        sessionStorage.removeItem('gah_memberData');
    }

    redirectToDashboard() {
        window.location.href = '/dashboard.html';
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type) {
        const toastId = type === 'success' ? 'successMessage' : 'errorMessage';
        const textId = type === 'success' ? 'successText' : 'errorText';
        
        const toast = document.getElementById(toastId);
        const textElement = document.getElementById(textId);
        
        if (toast && textElement) {
            textElement.textContent = message;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('translate-x-full');
                setTimeout(() => {
                    toast.classList.add('hidden');
                    toast.classList.remove('translate-x-full');
                }, 300);
            }, 5000);
        }
    }

    // Backend communication
    async callBackend(functionName, params) {
        console.log(`🔧 Auth calling backend: ${functionName}`, params);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        switch (functionName) {
            case 'validateSession':
                return { success: true, data: { valid: false } };
                
            case 'login':
                // Simulate login validation
                if (params.email === 'demo@greenafricahub.org.uk' && params.password === 'demo123') {
                    return {
                        success: true,
                        data: {
                            memberId: 'GAH-B-26-PRO-2025-0001',
                            email: params.email,
                            name: 'Demo Member',
                            tier: 'pro'
                        }
                    };
                } else {
                    return { success: false, message: 'Invalid email or password' };
                }
                
            case 'signup':
                // Simulate signup
                const memberId = this.generateMemberId(params.tier);
                return {
                    success: true,
                    data: {
                        memberId: memberId,
                        email: params.email,
                        name: params.name,
                        tier: params.tier
                    }
                };
                
            default:
                return { success: false, message: 'Unknown function' };
        }
    }

    generateMemberId(tier) {
        const tierCodes = {
            'basic': 'GAH-C-26',
            'pro': 'GAH-B-26-PRO',
            'proplus': 'GAH-S-26-SUP',
            'enterprise': 'GAH-E-26-ORG'
        };
        
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        return `${tierCodes[tier]}-${year}-${random}`;
    }
}

// Initialize authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GreenAfricaHubAuth();
});
