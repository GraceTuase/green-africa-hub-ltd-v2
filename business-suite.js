// Green Africa Hub Business Suite JavaScript
class BusinessSuite {
    constructor() {
        this.memberId = null;
        this.memberData = null;
        this.currentTool = null;
        this.init();
    }

    async init() {
        console.log('💼 Green Africa Hub Business Suite - Initializing...');
        
        // Check authentication and access
        await this.checkAuthentication();
        
        if (this.memberId) {
            await this.initializeBusinessSuite();
        } else {
            this.redirectToLogin();
        }
        
        this.setupEventListeners();
        console.log('✅ Business Suite initialized successfully');
    }

    async checkAuthentication() {
        try {
            this.memberId = this.getCurrentMemberId();
            
            if (this.memberId) {
                // Check business suite access
                const accessCheck = await this.callBackend('checkBusinessSuiteAccess', { memberId: this.memberId });
                
                if (accessCheck.success && accessCheck.data.allowed) {
                    this.memberData = await this.fetchMemberData(this.memberId);
                    return true;
                } else {
                    this.showError(accessCheck.message || 'Business Suite access denied');
                    this.redirectToDashboard();
                    return false;
                }
            }
            
            return false;
        } catch (error) {
            console.error('❌ Authentication check failed:', error);
            return false;
        }
    }

    getCurrentMemberId() {
        return localStorage.getItem('gah_memberId') ||
               sessionStorage.getItem('gah_memberId') ||
               new URLSearchParams(window.location.search).get('memberId') ||
               null;
    }

    async initializeBusinessSuite() {
        try {
            this.showLoading(true);
            
            // Load business suite data
            await Promise.all([
                this.loadBusinessStats(),
                this.loadRecentActivity(),
                this.loadToolPermissions()
            ]);
            
            // Update UI
            this.updateBusinessUI();
            
            this.showLoading(false);
            
        } catch (error) {
            console.error('❌ Business Suite initialization failed:', error);
            this.showError('Failed to load business suite data');
            this.showLoading(false);
        }
    }

    async loadBusinessStats() {
        try {
            const response = await this.callBackend('getBusinessStats', { memberId: this.memberId });
            
            if (response.success) {
                this.businessStats = response.data;
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load business stats');
            }
        } catch (error) {
            console.error('❌ Error loading business stats:', error);
            return this.getDemoBusinessStats();
        }
    }

    async loadRecentActivity() {
        try {
            const response = await this.callBackend('getBusinessActivity', { memberId: this.memberId });
            
            if (response.success) {
                this.activityData = response.data;
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load activity data');
            }
        } catch (error) {
            console.error('❌ Error loading activity data:', error);
            return this.getDemoActivityData();
        }
    }

    async loadToolPermissions() {
        try {
            const response = await this.callBackend('getBusinessAccessProfile', { memberId: this.memberId });
            
            if (response.success) {
                this.toolPermissions = response.data;
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to load tool permissions');
            }
        } catch (error) {
            console.error('❌ Error loading tool permissions:', error);
            return this.getDemoToolPermissions();
        }
    }

    updateBusinessUI() {
        this.updateMemberInfo();
        this.updateBusinessStats();
        this.updateActivityFeed();
        this.updateToolAccess();
    }

    updateMemberInfo() {
        if (!this.memberData) return;
        
        this.updateElement('navMemberName', this.memberData.name || 'Member');
        this.updateElement('accessLevel', this.formatTierName(this.memberData.tier));
        this.updateElement('complianceScore', `${this.memberData.trustScore || 95}%`);
        this.updateElement('activeTools', '4/6'); // Based on available tools
    }

    updateBusinessStats() {
        if (!this.businessStats) return;
        
        // Update quick stats
        const statsElements = {
            smsSent: this.businessStats.smsSent || 125,
            qrScans: this.businessStats.qrScans || 89,
            carbonSaved: this.businessStats.carbonSaved || 47.3,
            complianceScore: this.businessStats.complianceScore || 95
        };
        
        // Update stat cards (these would have specific IDs in real implementation)
        Object.keys(statsElements).forEach(key => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                element.textContent = key === 'carbonSaved' ? `${statsElements[key]}kg` : statsElements[key];
            }
        });
    }

    updateActivityFeed() {
        if (!this.activityData) return;
        
        const feedContainer = document.querySelector('.space-y-4');
        if (!feedContainer) return;
        
        const activities = this.activityData.recentActivities || this.getDemoActivities();
        
        feedContainer.innerHTML = activities.map(activity => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                    <div class="${activity.iconBg} rounded-lg p-2 mr-4">
                        <i class="${activity.icon} ${activity.iconColor}"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${activity.title}</p>
                        <p class="text-sm text-gray-600">${activity.description}</p>
                    </div>
                </div>
                <span class="text-sm text-gray-500">${activity.timeAgo}</span>
            </div>
        `).join('');
    }

    updateToolAccess() {
        if (!this.toolPermissions) return;
        
        // Update tool cards based on permissions
        const tools = [
            { id: 'digital-sms', permission: 'businessSuiteAccess' },
            { id: 'allergen-pro', permission: 'businessSuiteAccess' },
            { id: 'supplier-ledger', permission: 'supplierAccess' },
            { id: 'audit-portal', permission: 'auditAccess' },
            { id: 'staff-management', permission: 'multiStaffAccess' },
            { id: 'analytics', permission: 'businessSuiteAccess' }
        ];
        
        tools.forEach(tool => {
            const card = document.querySelector(`[data-tool="${tool.id}"]`);
            if (card) {
                const hasAccess = this.toolPermissions[tool.permission]?.allowed || false;
                
                if (hasAccess) {
                    card.style.opacity = '1';
                    card.style.pointerEvents = 'auto';
                } else {
                    card.style.opacity = '0.5';
                    card.style.pointerEvents = 'none';
                    
                    // Add upgrade badge
                    if (!card.querySelector('.upgrade-badge')) {
                        const badge = document.createElement('div');
                        badge.className = 'upgrade-badge absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded';
                        badge.textContent = 'Upgrade';
                        card.style.position = 'relative';
                        card.appendChild(badge);
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // Close modal button
        const closeBtn = document.querySelector('[onclick="closeToolModal()"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeToolModal());
        }
        
        // Refresh button
        const refreshBtn = document.querySelector('button:has(.fa-sync-alt)');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
    }

    // Tool opening methods
    openDigitalSMS() {
        if (!this.checkToolAccess('businessSuiteAccess')) return;
        
        this.currentTool = 'digital-sms';
        this.showToolModal('Digital SMS', this.getDigitalSMSContent());
    }

    openAllergenPro() {
        if (!this.checkToolAccess('businessSuiteAccess')) return;
        
        this.currentTool = 'allergen-pro';
        this.showToolModal('Allergen Matrix Pro', this.getAllergenProContent());
    }

    openSupplierLedger() {
        if (!this.checkToolAccess('supplierAccess')) return;
        
        this.currentTool = 'supplier-ledger';
        this.showToolModal('Supplier Ledger', this.getSupplierLedgerContent());
    }

    openAuditPortal() {
        if (!this.checkToolAccess('auditAccess')) return;
        
        this.currentTool = 'audit-portal';
        this.showToolModal('Wholesale Audit Portal', this.getAuditPortalContent());
    }

    openStaffManagement() {
        if (!this.checkToolAccess('multiStaffAccess')) return;
        
        this.currentTool = 'staff-management';
        this.showToolModal('Multi-Staff Management', this.getStaffManagementContent());
    }

    openAnalytics() {
        if (!this.checkToolAccess('businessSuiteAccess')) return;
        
        this.currentTool = 'analytics';
        this.showToolModal('Analytics Dashboard', this.getAnalyticsContent());
    }

    checkToolAccess(permission) {
        const hasAccess = this.toolPermissions?.[permission]?.allowed || false;
        
        if (!hasAccess) {
            const message = this.toolPermissions?.[permission]?.message || 'Access denied. Upgrade your membership to access this tool.';
            this.showError(message);
            return false;
        }
        
        return true;
    }

    showToolModal(title, content) {
        const modal = document.getElementById('toolModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = title;
            modalContent.innerHTML = content;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    closeToolModal() {
        const modal = document.getElementById('toolModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            this.currentTool = null;
        }
    }

    // Tool content generators
    getDigitalSMSContent() {
        return `
            <div class="space-y-6">
                <div class="bg-purple-50 rounded-lg p-4">
                    <h4 class="font-semibold text-purple-800 mb-2">Send Compliance SMS</h4>
                    <p class="text-purple-600 text-sm mb-4">Send SMS notifications to customers about allergen updates, compliance notices, or business updates.</p>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option>All Customers</option>
                                <option>Active Members</option>
                                <option>Business Tier Only</option>
                                <option>Custom List</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option>Allergen Matrix Update</option>
                                <option>Compliance Notice</option>
                                <option>Business Update</option>
                                <option>Custom Message</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Custom Message</label>
                            <textarea class="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="4" placeholder="Enter your custom message here..."></textarea>
                        </div>
                        
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-500">Estimated recipients: 125</span>
                            <button onclick="businessSuite.sendSMS()" class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition">
                                <i class="fas fa-paper-plane mr-2"></i>
                                Send SMS
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-800 mb-2">Recent SMS Campaigns</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center p-2 bg-white rounded">
                            <span class="text-sm">Allergen Update</span>
                            <span class="text-xs text-gray-500">25 sent • 2h ago</span>
                        </div>
                        <div class="flex justify-between items-center p-2 bg-white rounded">
                            <span class="text-sm">Compliance Notice</span>
                            <span class="text-xs text-gray-500">50 sent • 1d ago</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getAllergenProContent() {
        return `
            <div class="space-y-6">
                <div class="bg-red-50 rounded-lg p-4">
                    <h4 class="font-semibold text-red-800 mb-2">Advanced Allergen Management</h4>
                    <p class="text-red-600 text-sm mb-4">Manage your allergen matrix with advanced features including QR codes, compliance reports, and customer display.</p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onclick="businessSuite.generateQRCode()" class="bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg transition">
                            <i class="fas fa-qrcode mr-2"></i>
                            Generate QR Code
                        </button>
                        
                        <button onclick="businessSuite.downloadReport()" class="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg transition">
                            <i class="fas fa-download mr-2"></i>
                            Download Report
                        </button>
                        
                        <button onclick="businessSuite.printMatrix()" class="bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg transition">
                            <i class="fas fa-print mr-2"></i>
                            Print Matrix
                        </button>
                        
                        <button onclick="businessSuite.updateSettings()" class="bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg transition">
                            <i class="fas fa-cog mr-2"></i>
                            Update Settings
                        </button>
                    </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-800 mb-2">QR Code Analytics</h4>
                    <div class="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p class="text-2xl font-bold text-red-600">89</p>
                            <p class="text-sm text-gray-600">Total Scans</p>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-blue-600">23</p>
                            <p class="text-sm text-gray-600">This Week</p>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-green-600">4.8</p>
                            <p class="text-sm text-gray-600">Avg Rating</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSupplierLedgerContent() {
        return `
            <div class="space-y-6">
                <div class="bg-green-50 rounded-lg p-4">
                    <h4 class="font-semibold text-green-800 mb-2">Supplier Carbon Tracking</h4>
                    <p class="text-green-600 text-sm mb-4">Track and manage supplier carbon impact data for comprehensive sustainability reporting.</p>
                    
                    <div class="supplier-ledger-table">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b">
                                    <th class="text-left py-2">Supplier</th>
                                    <th class="text-left py-2">Carbon Impact</th>
                                    <th class="text-left py-2">Status</th>
                                    <th class="text-left py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b">
                                    <td class="py-2">Fresh Produce Co</td>
                                    <td class="py-2">12.5 kg CO₂</td>
                                    <td class="py-2"><span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span></td>
                                    <td class="py-2">
                                        <button class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                    </td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2">Sustainable Seafood</td>
                                    <td class="py-2">8.3 kg CO₂</td>
                                    <td class="py-2"><span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span></td>
                                    <td class="py-2">
                                        <button class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                    </td>
                                </tr>
                                <tr class="border-b">
                                    <td class="py-2">Local Farms Ltd</td>
                                    <td class="py-2">5.7 kg CO₂</td>
                                    <td class="py-2"><span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pending</span></td>
                                    <td class="py-2">
                                        <button class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-4">
                        <button class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition">
                            <i class="fas fa-plus mr-2"></i>
                            Add Supplier
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getAuditPortalContent() {
        return `
            <div class="space-y-6">
                <div class="bg-yellow-50 rounded-lg p-4">
                    <h4 class="font-semibold text-yellow-800 mb-2">Compliance Audit Portal</h4>
                    <p class="text-yellow-600 text-sm mb-4">Comprehensive audit trails and compliance reporting for regulatory requirements.</p>
                    
                    <div class="audit-timeline">
                        <div class="audit-item">
                            <div class="bg-white rounded-lg p-4">
                                <h5 class="font-semibold text-gray-800">Monthly Compliance Audit</h5>
                                <p class="text-sm text-gray-600 mb-2">Completed with 95% compliance score</p>
                                <div class="flex justify-between items-center">
                                    <span class="text-xs text-gray-500">2 days ago</span>
                                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Passed</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="audit-item">
                            <div class="bg-white rounded-lg p-4">
                                <h5 class="font-semibold text-gray-800">Allergen Compliance Check</h5>
                                <p class="text-sm text-gray-600 mb-2">All 14 major allergens properly documented</p>
                                <div class="flex justify-between items-center">
                                    <span class="text-xs text-gray-500">1 week ago</span>
                                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Passed</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="audit-item">
                            <div class="bg-white rounded-lg p-4">
                                <h5 class="font-semibold text-gray-800">Carbon Impact Verification</h5>
                                <p class="text-sm text-gray-600 mb-2">Triple-Pillar calculations verified</p>
                                <div class="flex justify-between items-center">
                                    <span class="text-xs text-gray-500">2 weeks ago</span>
                                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Passed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6">
                        <button class="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg transition">
                            <i class="fas fa-download mr-2"></i>
                            Download Audit Report
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getStaffManagementContent() {
        return `
            <div class="space-y-6">
                <div class="bg-indigo-50 rounded-lg p-4">
                    <h4 class="font-semibold text-indigo-800 mb-2">Multi-Staff Management</h4>
                    <p class="text-indigo-600 text-sm mb-4">Manage team access, permissions, and activity across your business suite.</p>
                    
                    <div class="space-y-4">
                        <div class="bg-white rounded-lg p-4">
                            <div class="flex justify-between items-center mb-2">
                                <h5 class="font-semibold text-gray-800">Team Members</h5>
                                <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-plus mr-1"></i>
                                    Add Staff
                                </button>
                            </div>
                            
                            <div class="space-y-2">
                                <div class="flex justify-between items-center p-2 border rounded">
                                    <div>
                                        <p class="font-medium">John Smith</p>
                                        <p class="text-sm text-gray-600">Manager • Full Access</p>
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                        <button class="text-red-600 hover:text-red-800 text-sm">Remove</button>
                                    </div>
                                </div>
                                
                                <div class="flex justify-between items-center p-2 border rounded">
                                    <div>
                                        <p class="font-medium">Sarah Johnson</p>
                                        <p class="text-sm text-gray-600">Staff • Limited Access</p>
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                        <button class="text-red-600 hover:text-red-800 text-sm">Remove</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg p-4">
                            <h5 class="font-semibold text-gray-800 mb-2">Permission Templates</h5>
                            <div class="grid grid-cols-2 gap-2">
                                <button class="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm">Full Access</button>
                                <button class="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm">Manager</button>
                                <button class="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm">Staff</button>
                                <button class="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm">View Only</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getAnalyticsContent() {
        return `
            <div class="space-y-6">
                <div class="bg-blue-50 rounded-lg p-4">
                    <h4 class="font-semibold text-blue-800 mb-2">Business Analytics Dashboard</h4>
                    <p class="text-blue-600 text-sm mb-4">Comprehensive insights into your business performance and customer engagement.</p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white rounded-lg p-4">
                            <h5 class="font-semibold text-gray-800 mb-2">Customer Engagement</h5>
                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Active Customers</span>
                                    <span class="font-semibold">156</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Monthly Interactions</span>
                                    <span class="font-semibold">1,247</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Satisfaction Rate</span>
                                    <span class="font-semibold">94%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg p-4">
                            <h5 class="font-semibold text-gray-800 mb-2">Carbon Impact</h5>
                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Total CO₂ Saved</span>
                                    <span class="font-semibold">47.3 kg</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Monthly Average</span>
                                    <span class="font-semibold">8.7 kg</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-sm text-gray-600">Year Projection</span>
                                    <span class="font-semibold">104.4 kg</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition">
                            <i class="fas fa-download mr-2"></i>
                            Export Full Report
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Action methods
    async sendSMS() {
        try {
            this.showLoading(true);
            
            // Simulate SMS sending
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showSuccess('SMS campaign sent successfully to 125 recipients!');
            this.closeToolModal();
            await this.refreshData();
            
        } catch (error) {
            console.error('❌ Error sending SMS:', error);
            this.showError('Failed to send SMS. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async generateQRCode() {
        try {
            this.showLoading(true);
            
            const response = await this.callBackend('generateAllergenMatrixUrl', { memberId: this.memberId });
            
            if (response.success) {
                this.showSuccess('QR code generated successfully!');
                // Update QR code display
                this.updateQRCodeDisplay(response.qrCodeUrl);
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

    async refreshData() {
        try {
            this.showLoading(true);
            await this.initializeBusinessSuite();
            this.showSuccess('Business suite data refreshed!');
        } catch (error) {
            console.error('❌ Error refreshing data:', error);
            this.showError('Failed to refresh data');
        } finally {
            this.showLoading(false);
        }
    }

    // Helper methods (same as dashboard.js)
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
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `fixed top-20 right-4 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform translate-x-full`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Hide toast after 5 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 5000);
    }

    redirectToLogin() {
        window.location.href = '/login';
    }

    redirectToDashboard() {
        window.location.href = '/dashboard.html';
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

    // Backend communication
    async callBackend(functionName, params) {
        console.log(`🔧 Business Suite calling backend: ${functionName}`, params);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        switch (functionName) {
            case 'checkBusinessSuiteAccess':
                return { success: true, data: { allowed: true, message: 'Business Suite access granted' } };
            case 'getBusinessStats':
                return { success: true, data: this.getDemoBusinessStats() };
            case 'getBusinessActivity':
                return { success: true, data: this.getDemoActivityData() };
            case 'getBusinessAccessProfile':
                return { success: true, data: this.getDemoToolPermissions() };
            case 'generateAllergenMatrixUrl':
                return { 
                    success: true, 
                    matrixUrl: 'https://greenafricahub.org.uk/allergen/demo',
                    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://greenafricahub.org.uk/allergen/demo'
                };
            default:
                return { success: false, message: 'Unknown function' };
        }
    }

    // Demo data methods
    getDemoBusinessStats() {
        return {
            smsSent: 125,
            qrScans: 89,
            carbonSaved: 47.3,
            complianceScore: 95,
            activeCustomers: 156,
            monthlyInteractions: 1247,
            satisfactionRate: 94
        };
    }

    getDemoActivityData() {
        return {
            recentActivities: this.getDemoActivities()
        };
    }

    getDemoActivities() {
        return [
            {
                title: 'SMS Campaign Sent',
                description: '25 customers notified about new allergen matrix',
                timeAgo: '2 hours ago',
                icon: 'fas fa-sms',
                iconColor: 'text-purple-600',
                iconBg: 'bg-purple-100'
            },
            {
                title: 'QR Code Generated',
                description: 'New allergen matrix QR code created for display',
                timeAgo: '5 hours ago',
                icon: 'fas fa-qrcode',
                iconColor: 'text-red-600',
                iconBg: 'bg-red-100'
            },
            {
                title: 'Supplier Updated',
                description: 'Carbon impact data updated for 3 suppliers',
                timeAgo: '1 day ago',
                icon: 'fas fa-truck',
                iconColor: 'text-green-600',
                iconBg: 'bg-green-100'
            },
            {
                title: 'Audit Completed',
                description: 'Monthly compliance audit passed with 95% score',
                timeAgo: '2 days ago',
                icon: 'fas fa-clipboard-check',
                iconColor: 'text-yellow-600',
                iconBg: 'bg-yellow-100'
            }
        ];
    }

    getDemoToolPermissions() {
        return {
            businessSuiteAccess: { allowed: true, message: 'Business Suite access granted' },
            supplierAccess: { allowed: true, message: 'Supplier Ledger access granted' },
            auditAccess: { allowed: true, message: 'Audit Portal access granted' },
            multiStaffAccess: { allowed: true, message: 'Multi-Staff access granted' }
        };
    }

    async fetchMemberData(memberId) {
        // Simulate fetching member data
        return {
            uniqueMemberId: 'GAH-B-26-PRO-2025-0001',
            email: 'demo@greenafricahub.org.uk',
            name: 'Demo Business Member',
            tier: 'pro',
            trustScore: 95
        };
    }
}

// Global functions for onclick handlers
window.openDigitalSMS = () => window.businessSuite?.openDigitalSMS();
window.openAllergenPro = () => window.businessSuite?.openAllergenPro();
window.openSupplierLedger = () => window.businessSuite?.openSupplierLedger();
window.openAuditPortal = () => window.businessSuite?.openAuditPortal();
window.openStaffManagement = () => window.businessSuite?.openStaffManagement();
window.openAnalytics = () => window.businessSuite?.openAnalytics();
window.closeToolModal = () => window.businessSuite?.closeToolModal();

// Initialize business suite when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.businessSuite = new BusinessSuite();
});
