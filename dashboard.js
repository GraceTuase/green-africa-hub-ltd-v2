// Green Africa Hub Dashboard JavaScript
// Frontend integration with Wix Velo backend

class GreenAfricaHubDashboard {
    constructor() {
        this.memberId = null;
        this.memberData = null;
        this.refreshInterval = null;
        this.init();
    }

    async init() {
        console.log('🌿 Green Africa Hub Dashboard - Initializing...');
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize dashboard if authenticated
        if (this.memberId) {
            await this.initializeDashboard();
        } else {
            this.showLoginSection();
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start auto-refresh
        this.startAutoRefresh();
        
        console.log('✅ Dashboard initialized successfully');
    }

    async checkAuthentication() {
        try {
            // Try to get current member from session/localStorage
            this.memberId = this.getCurrentMemberId();
            
            if (this.memberId) {
                // Validate member exists
                const memberData = await this.fetchMemberData(this.memberId);
                if (memberData) {
                    this.memberData = memberData;
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('❌ Authentication check failed:', error);
            return false;
        }
    }

    getCurrentMemberId() {
        // Try multiple sources for member ID
        return localStorage.getItem('gah_memberId') ||
               sessionStorage.getItem('gah_memberId') ||
               new URLSearchParams(window.location.search).get('memberId') ||
               null;
    }

    async initializeDashboard() {
        try {
            this.showLoading(true);
            
            // Load all dashboard data
            await Promise.all([
                this.loadMemberData(),
                this.loadCarbonImpact(),
                this.loadReferralStats(),
                this.loadAllergenSettings(),
                this.loadAccessPermissions()
            ]);
            
            // Update UI
            this.updateDashboardUI();
            
            // Hide loading
            this.showLoading(false);
            
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showError('Failed to load dashboard data');
            this.showLoading(false);
        }
    }

    async loadMemberData() {
        try {
            // In Wix, this would call the backend
            const response = await this.callBackend('getMemberProfile', { memberId: this.memberId });
            
            if (response.success) {
                this.memberData = response.data;
                this.saveMemberId(this.memberId);
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load member data');
            }
        } catch (error) {
            console.error('❌ Error loading member data:', error);
            // Fallback to demo data for development
            return this.getDemoMemberData();
        }
    }

    async loadCarbonImpact() {
        try {
            const response = await this.callBackend('getCarbonImpactDashboard', { memberId: this.memberId });
            
            if (response.success) {
                this.carbonData = response.data;
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load carbon data');
            }
        } catch (error) {
            console.error('❌ Error loading carbon data:', error);
            return this.getDemoCarbonData();
        }
    }

    async loadReferralStats() {
        try {
            const response = await this.callBackend('getReferralStats', { memberId: this.memberId });
            
            if (response.success) {
                this.referralData = response.data;
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load referral data');
            }
        } catch (error) {
            console.error('❌ Error loading referral data:', error);
            return this.getDemoReferralData();
        }
    }

    async loadAllergenSettings() {
        try {
            const response = await this.callBackend('getAllergenSettings', { memberId: this.memberId });
            
            if (response.success) {
                this.allergenData = response.data;
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load allergen data');
            }
        } catch (error) {
            console.error('❌ Error loading allergen data:', error);
            return this.getDemoAllergenData();
        }
    }

    async loadAccessPermissions() {
        try {
            const [cookbookAccess, businessAccess] = await Promise.all([
                this.callBackend('checkCookbookAccess', { memberId: this.memberId }),
                this.callBackend('checkBusinessSuiteAccess', { memberId: this.memberId })
            ]);
            
            this.accessData = {
                cookbook: cookbookAccess,
                business: businessAccess
            };
            
            return this.accessData;
        } catch (error) {
            console.error('❌ Error loading access data:', error);
            return this.getDemoAccessData();
        }
    }

    updateDashboardUI() {
        // Update member info
        this.updateMemberInfo();
        
        // Update carbon impact
        this.updateCarbonImpact();
        
        // Update referral stats
        this.updateReferralStats();
        
        // Update access buttons
        this.updateAccessButtons();
        
        // Update green badge
        this.updateGreenBadge();
    }

    updateMemberInfo() {
        if (!this.memberData) return;
        
        this.updateElement('memberName', this.memberData.name || 'Member');
        this.updateElement('navMemberName', this.memberData.name || 'Member');
        this.updateElement('memberId', this.memberData.uniqueMemberId || 'N/A');
        this.updateElement('memberTier', this.formatTierName(this.memberData.tier));
        this.updateElement('trustScore', `${this.memberData.trustScore || 100}%`);
        this.updateElement('creditsRemaining', this.memberData.monthlyMealCredits || 0);
        this.updateElement('lifetimeCarbonSaved', `${(this.memberData.lifetimeCarbonSaved || 0).toFixed(2)} kg`);
    }

    updateCarbonImpact() {
        if (!this.carbonData) return;
        
        const monthlySaved = this.carbonData.monthlyCarbonSaved || 0;
        const lifetimeSaved = this.carbonData.lifetimeCarbonSaved || 0;
        const targetSavings = 100; // kg CO2 monthly target
        const percentage = Math.min((monthlySaved / targetSavings) * 100, 100);
        
        this.updateElement('monthlyCarbonSaved', `${monthlySaved.toFixed(2)} kg`);
        this.updateElement('carbonProgressBar', null, { width: `${percentage}%` });
        this.updateElement('carbonPercentage', `${percentage.toFixed(1)}%`);
        
        // Update impact message
        const message = monthlySaved > 0 
            ? `Great job! You've saved ${monthlySaved.toFixed(2)} kg CO₂ this month!`
            : 'Check in at an event to start tracking your carbon impact!';
        this.updateElement('impactMessage', message);
    }

    updateReferralStats() {
        if (!this.referralData) return;
        
        this.updateElement('walletBalance', `£${(this.referralData.walletBalance || 0).toFixed(2)}`);
        this.updateElement('totalReferrals', this.referralData.totalReferrals || 0);
        this.updateElement('totalReferralEarnings', `£${(this.referralData.totalReferralEarnings || 0).toFixed(2)}`);
    }

    updateAccessButtons() {
        if (!this.accessData) return;
        
        const cookbookBtn = document.getElementById('cookbookButton');
        const businessBtn = document.getElementById('businessButton');
        
        // Update cookbook access
        if (cookbookBtn) {
            if (this.accessData.cookbook?.allowed) {
                cookbookBtn.style.display = 'block';
                cookbookBtn.disabled = false;
            } else {
                cookbookBtn.style.display = 'none';
            }
        }
        
        // Update business access
        if (businessBtn) {
            if (this.accessData.business?.allowed) {
                businessBtn.style.display = 'block';
                businessBtn.disabled = false;
            } else {
                businessBtn.style.display = 'none';
            }
        }
    }

    updateGreenBadge() {
        const badgeContainer = document.getElementById('activeBadgeContainer');
        const redeemButton = document.getElementById('redeemButton');
        
        if (this.memberData?.attendanceStatus === 'CheckedIn') {
            badgeContainer.style.display = 'block';
            redeemButton.style.display = 'none';
        } else {
            badgeContainer.style.display = 'none';
            
            if (this.memberData?.monthlyMealCredits > 0) {
                redeemButton.style.display = 'block';
                redeemButton.textContent = `Redeem Monthly Buffet (${this.memberData.monthlyMealCredits} credits)`;
            } else {
                redeemButton.style.display = 'none';
            }
        }
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Redeem button
        const redeemBtn = document.getElementById('redeemButton');
        if (redeemBtn) {
            redeemBtn.addEventListener('click', () => this.redeemMeal());
        }
        
        // Cookbook button
        const cookbookBtn = document.getElementById('cookbookButton');
        if (cookbookBtn) {
            cookbookBtn.addEventListener('click', () => this.openCookbook());
        }
        
        // Business button
        const businessBtn = document.getElementById('businessButton');
        if (businessBtn) {
            businessBtn.addEventListener('click', () => this.openBusinessSuite());
        }
        
        // Generate QR button
        const generateQRBtn = document.getElementById('generateQRButton');
        if (generateQRBtn) {
            generateQRBtn.addEventListener('click', () => this.generateQRCode());
        }
        
        // Allergen settings button
        const allergenBtn = document.getElementById('allergenSettingsButton');
        if (allergenBtn) {
            allergenBtn.addEventListener('click', () => this.openAllergenSettings());
        }
        
        // Navigation smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    async redeemMeal() {
        try {
            this.showLoading(true);
            
            const response = await this.callBackend('redeemMeal', { memberId: this.memberId });
            
            if (response.success) {
                this.showSuccess(response.message || 'Meal redeemed successfully!');
                // Refresh dashboard data
                await this.initializeDashboard();
            } else {
                this.showError(response.message || 'Failed to redeem meal');
            }
        } catch (error) {
            console.error('❌ Error redeeming meal:', error);
            this.showError('Failed to redeem meal. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async generateQRCode() {
        try {
            this.showLoading(true);
            
            const response = await this.callBackend('generateAllergenMatrixUrl', { memberId: this.memberId });
            
            if (response.success) {
                // Update QR code image
                const qrImage = document.getElementById('qrCodeImage');
                const qrPlaceholder = document.getElementById('qrPlaceholder');
                const matrixUrl = document.getElementById('allergenMatrixUrl');
                const urlContainer = document.getElementById('matrixUrlContainer');
                
                if (qrImage && qrPlaceholder) {
                    qrImage.src = response.qrCodeUrl;
                    qrImage.style.display = 'block';
                    qrPlaceholder.style.display = 'none';
                }
                
                if (matrixUrl && urlContainer) {
                    matrixUrl.value = response.matrixUrl;
                    urlContainer.style.display = 'block';
                }
                
                this.showSuccess('QR code generated successfully!');
            } else {
                this.showError(response.message || 'Failed to generate QR code');
            }
        } catch (error) {
            console.error('❌ Error generating QR code:', error);
            this.showError('Failed to generate QR code. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    openCookbook() {
        if (!this.accessData?.cookbook?.allowed) {
            this.showError(this.accessData?.cookbook?.message || 'Access denied');
            return;
        }
        
        // Navigate to cookbook
        window.location.href = '/digital-cookbook';
    }

    openBusinessSuite() {
        if (!this.accessData?.business?.allowed) {
            this.showError(this.accessData?.business?.message || 'Access denied');
            return;
        }
        
        // Navigate to business suite
        window.location.href = '/business-dashboard';
    }

    openAllergenSettings() {
        // Open allergen settings modal/lightbox
        this.showAllergenSettingsModal();
    }

    showAllergenSettingsModal() {
        // Create modal for allergen settings
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h3 class="text-xl font-bold mb-4">Allergen Settings</h3>
                <div class="allergen-grid" id="allergenGrid">
                    <!-- Allergen items will be populated here -->
                </div>
                <div class="flex justify-end gap-4 mt-6">
                    <button class="btn btn-secondary" onclick="this.closest('.fixed').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="dashboard.saveAllergenSettings()">Save Settings</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.populateAllergenGrid();
    }

    populateAllergenGrid() {
        const grid = document.getElementById('allergenGrid');
        if (!grid) return;
        
        const allergens = [
            { key: 'gluten', name: 'Gluten', code: 'GL' },
            { key: 'dairy', name: 'Dairy', code: 'DA' },
            { key: 'eggs', name: 'Eggs', code: 'EG' },
            { key: 'soy', name: 'Soy', code: 'SO' },
            { key: 'peanuts', name: 'Peanuts', code: 'PN' },
            { key: 'treeNuts', name: 'Tree Nuts', code: 'TN' },
            { key: 'shellfish', name: 'Shellfish', code: 'SF' },
            { key: 'fish', name: 'Fish', code: 'FS' },
            { key: 'sesame', name: 'Sesame', code: 'SE' },
            { key: 'mustard', name: 'Mustard', code: 'MU' },
            { key: 'celery', name: 'Celery', code: 'CE' },
            { key: 'lupin', name: 'Lupin', code: 'LU' },
            { key: 'molluscs', name: 'Molluscs', code: 'MO' },
            { key: 'sulphites', name: 'Sulphites', code: 'SU' }
        ];
        
        const currentSettings = this.allergenData?.settings || {};
        
        grid.innerHTML = allergens.map(allergen => `
            <div class="allergen-item ${currentSettings[allergen.key] ? 'active' : 'inactive'}" 
                 data-allergen="${allergen.key}"
                 onclick="dashboard.toggleAllergen('${allergen.key}')">
                <div class="font-semibold">${allergen.name}</div>
                <div class="text-sm opacity-75">${allergen.code}</div>
            </div>
        `).join('');
    }

    toggleAllergen(allergenKey) {
        const item = document.querySelector(`[data-allergen="${allergenKey}"]`);
        if (item) {
            item.classList.toggle('active');
            item.classList.toggle('inactive');
        }
    }

    async saveAllergenSettings() {
        try {
            this.showLoading(true);
            
            // Collect all allergen states
            const allergenItems = document.querySelectorAll('.allergen-item');
            const settings = {};
            
            allergenItems.forEach(item => {
                const key = item.dataset.allergen;
                settings[key] = item.classList.contains('active');
            });
            
            const response = await this.callBackend('updateAllergenSettings', {
                memberId: this.memberId,
                allergenData: settings
            });
            
            if (response.success) {
                this.showSuccess('Allergen settings updated successfully!');
                // Close modal
                document.querySelector('.fixed').remove();
                // Refresh data
                await this.loadAllergenSettings();
            } else {
                this.showError(response.message || 'Failed to update allergen settings');
            }
        } catch (error) {
            console.error('❌ Error saving allergen settings:', error);
            this.showError('Failed to save allergen settings. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    logout() {
        // Clear stored member ID
        localStorage.removeItem('gah_memberId');
        sessionStorage.removeItem('gah_memberId');
        
        // Redirect to login
        window.location.href = '/login';
    }

    startAutoRefresh() {
        // Refresh data every 5 minutes
        this.refreshInterval = setInterval(() => {
            if (this.memberId) {
                this.initializeDashboard();
            }
        }, 5 * 60 * 1000);
    }

    // Helper methods
    updateElement(id, text, styles = {}) {
        const element = document.getElementById(id);
        if (element) {
            if (text !== null) {
                element.textContent = text;
            }
            Object.assign(element.style, styles);
        }
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
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 5000);
        }
    }

    showLoginSection() {
        // Redirect to login or show login form
        window.location.href = '/login';
    }

    saveMemberId(memberId) {
        localStorage.setItem('gah_memberId', memberId);
        sessionStorage.setItem('gah_memberId', memberId);
    }

    formatTierName(tier) {
        const tierNames = {
            'basic': 'Consumer',
            'pro': 'Independent Caterer',
            'proplus': 'Caterer-Supplier',
            'enterprise': 'Organisation'
        };
        return tierNames[tier] || tier;
    }

    // Backend communication (for Wix integration)
    async callBackend(functionName, params) {
        // In Wix, this would use the actual backend functions
        // For now, simulate backend calls
        
        console.log(`🔧 Calling backend: ${functionName}`, params);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Return mock response based on function
        switch (functionName) {
            case 'getMemberProfile':
                return { success: true, data: this.getDemoMemberData() };
            case 'getCarbonImpactDashboard':
                return { success: true, data: this.getDemoCarbonData() };
            case 'getReferralStats':
                return { success: true, data: this.getDemoReferralData() };
            case 'getAllergenSettings':
                return { success: true, data: this.getDemoAllergenData() };
            case 'checkCookbookAccess':
                return { success: true, data: this.getDemoAccessData().cookbook };
            case 'checkBusinessSuiteAccess':
                return { success: true, data: this.getDemoAccessData().business };
            case 'redeemMeal':
                return { success: true, message: 'Meal redeemed successfully!' };
            case 'generateAllergenMatrixUrl':
                return { 
                    success: true, 
                    matrixUrl: 'https://greenafricahub.org.uk/allergen/demo',
                    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://greenafricahub.org.uk/allergen/demo'
                };
            case 'updateAllergenSettings':
                return { success: true, message: 'Allergen settings updated successfully!' };
            default:
                return { success: false, message: 'Unknown function' };
        }
    }

    // Demo data methods (for development)
    getDemoMemberData() {
        return {
            uniqueMemberId: 'GAH-B-26-PRO-2025-0001',
            email: 'demo@greenafricahub.org.uk',
            name: 'Demo Member',
            tier: 'pro',
            attendanceStatus: 'Available',
            monthlyMealCredits: 5,
            lifetimeCarbonSaved: 47.3,
            monthlyCarbonSaved: 8.7,
            trustScore: 95,
            referralCode: 'GAH-ABC123',
            walletBalance: 25.50,
            totalReferrals: 3,
            totalReferralEarnings: 15.00
        };
    }

    getDemoCarbonData() {
        return {
            lifetimeCarbonSaved: 47.3,
            monthlyCarbonSaved: 8.7,
            attendanceStatus: 'Available',
            activeGreenBadge: false
        };
    }

    getDemoReferralData() {
        return {
            referralCode: 'GAH-ABC123',
            referralLink: 'https://greenafricahub.org.uk/signup?ref=GAH-ABC123',
            walletBalance: 25.50,
            totalReferrals: 3,
            totalReferralEarnings: 15.00
        };
    }

    getDemoAllergenData() {
        const settings = {
            gluten: true,
            dairy: true,
            eggs: false,
            soy: true,
            peanuts: true,
            treeNuts: false,
            shellfish: true,
            fish: true,
            sesame: false,
            mustard: false,
            celery: false,
            lupin: false,
            molluscs: true,
            sulphites: true
        };
        
        return {
            memberId: this.memberId,
            tier: 'pro',
            settings: settings,
            lastUpdated: new Date(),
            registryCompliance: true
        };
    }

    getDemoAccessData() {
        return {
            cookbook: {
                allowed: true,
                memberId: this.memberId,
                tier: 'pro',
                message: 'Digital Cookbook access granted'
            },
            business: {
                allowed: true,
                memberId: this.memberId,
                tier: 'pro',
                message: 'Business Suite access granted'
            }
        };
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new GreenAfricaHubDashboard();
});

// Export for global access
window.GreenAfricaHubDashboard = GreenAfricaHubDashboard;
