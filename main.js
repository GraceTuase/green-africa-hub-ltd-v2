// Public: main.js
import { redeemMeal, checkRedemptionStatus } from 'backend/redemption';
import { getCarbonImpactDashboard } from 'backend/carbon-impact';
import { checkToolAccess, protectRoute, checkCookbookAccess, checkBusinessSuiteAccess, checkDownloadPermission } from 'backend/security';
import { getAllergenSettings, createAllergenLightboxData } from 'backend/allergen';
import { loginUser, registerUser } from 'backend/auth';

// Page load initialization
$w.onReady(function () {
    // Initialize member dashboard
    initializeMemberDashboard();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check authentication status
    checkAuthenticationStatus();
});

// Initialize member dashboard
function initializeMemberDashboard() {
    // Get current member ID (from session or login)
    const memberId = getCurrentMemberId();
    
    if (!memberId) {
        // Redirect to login if not authenticated
        $w('#loginSection').show();
        $w('#dashboardSection').hide();
        return;
    }
    
    // Load member data
    loadMemberData(memberId);
    
    // Update Green Badge visibility based on attendance status
    updateGreenBadge(memberId);
    
    // Load carbon impact data
    loadCarbonImpact(memberId);
    
    // Load redemption status
    loadRedemptionStatus(memberId);
}

// Get current member ID
function getCurrentMemberId() {
    // In production, get from session storage or authentication
    return $w('#memberIdInput').value || localStorage.getItem('memberId');
}

// Load member data
function loadMemberData(memberId) {
    // This would typically call a backend function to get member data
    // For now, we'll simulate with the MembersProfile CMS
    $w('#memberIdDisplay').text = memberId;
    $w('#welcomeMessage').text = `Welcome back, Member ${memberId}`;
}

// Update Green Badge visibility
function updateGreenBadge(memberId) {
    getCarbonImpactDashboard(memberId)
        .then(impactData => {
            // Show Green Badge only when attendanceStatus == 'CheckedIn'
            if (impactData.isActive) {
                $w('#activeBadge').show();
                $w('#badgeStatus').text = 'Active Member';
                $w('#badgeMessage').text = 'Your carbon impact is being tracked today';
            } else {
                $w('#activeBadge').hide();
            }
        })
        .catch(error => {
            console.error('Error loading carbon impact:', error);
            $w('#activeBadge').hide();
        });
}

// Load carbon impact data
function loadCarbonImpact(memberId) {
    getCarbonImpactDashboard(memberId)
        .then(impactData => {
            // Update dashboard with carbon data
            $w('#lifetimeCarbonSaved').text = `${impactData.lifetimeCarbonSaved} kg CO2`;
            $w('#equivalentTrees').text = `${impactData.equivalentTo.treesNeeded} trees`;
            $w('#equivalentKm').text = `${impactData.equivalentTo.kmDriven} km`;
            
            // Update progress bar
            const percentage = Math.min((impactData.lifetimeCarbonSaved / 10) * 100, 100);
            $w('#carbonProgressBar').value = percentage;
            
            // Show/hide Green Badge based on attendance status
            if (impactData.isActive) {
                $w('#activeBadge').show();
            } else {
                $w('#activeBadge').hide();
            }
        })
        .catch(error => {
            console.error('Error loading carbon impact:', error);
        });
}

// Load redemption status
function loadRedemptionStatus(memberId) {
    checkRedemptionStatus(memberId)
        .then(status => {
            // Update redemption UI
            $w('#monthlyCredits').text = `${status.monthlyCredits} credits remaining`;
            $w('#attendanceStatus').text = status.attendanceStatus;
            
            // Show/hide redeem button based on status
            if (status.canRedeem) {
                $w('#redeemButton').show();
                $w('#redeemButton').enable();
                $w('#redeemMessage').text = 'Ready to redeem your monthly buffet!';
            } else {
                $w('#redeemButton').hide();
                if (status.attendanceStatus === 'CheckedIn') {
                    $w('#redeemMessage').text = 'Monthly buffet already redeemed. Enjoy your meal!';
                } else {
                    $w('#redeemMessage').text = 'No credits available';
                }
            }
        })
        .catch(error => {
            console.error('Error loading redemption status:', error);
            $w('#redeemButton').hide();
        });
}

// Set up event listeners
function setupEventListeners() {
    // Redemption button click
    $w('#redeemButton').onClick(() => {
        handleRedemption();
    });
    
    // Tool access buttons
    $w('#cookbookButton').onClick(() => {
        handleToolAccess('digital-cookbook');
    });
    
    $w('#smsButton').onClick(() => {
        handleToolAccess('digital-sms');
    });
    
    $w('#allergenButton').onClick(() => {
        handleToolAccess('allergen-matrix');
    });
    
    $w('#supplierButton').onClick(() => {
        handleToolAccess('supplier-ledger');
    });
    
    $w('#auditButton').onClick(() => {
        handleToolAccess('wholesale-audit');
    });
    
    // Allergen settings button
    $w('#allergenSettingsButton').onClick(() => {
        openAllergenSettings();
    });
    
    // Download buttons with compliance check
    $w('#downloadReportButton').onClick(() => {
        handleDownload('monthly-report');
    });
    
    $w('#downloadAllergenButton').onClick(() => {
        handleDownload('allergen-matrix');
    });
}

// Handle meal redemption
function handleRedemption() {
    const memberId = getCurrentMemberId();
    
    if (!memberId) {
        $w('#errorMessage').text = 'Please log in first';
        $w('#errorMessage').show();
        return;
    }
    
    // Show loading state
    $w('#redeemButton').disable();
    $w('#redeemButton').label = 'Processing...';
    
    // Simulate daily menu ingredients (in production, get from actual menu)
    const dailyMenuIngredients = [
        { name: 'rice', amount: 200, unit: 'g' },
        { name: 'chicken', amount: 150, unit: 'g' },
        { name: 'vegetables', amount: 100, unit: 'g' }
    ];
    
    redeemMeal(memberId, dailyMenuIngredients)
        .then(result => {
            // Show success message
            $w('#successMessage').text = result.message;
            $w('#successMessage').show();
            
            // Update carbon impact display
            $w('#carbonSavedToday').text = `${result.carbonImpact.totalCarbon} kg CO2 saved`;
            
            // Update redemption status
            loadRedemptionStatus(memberId);
            
            // Update Green Badge
            updateGreenBadge(memberId);
            
            // Hide redeem button
            $w('#redeemButton').hide();
        })
        .catch(error => {
            $w('#errorMessage').text = error.message;
            $w('#errorMessage').show();
            $w('#redeemButton').enable();
            $w('#redeemButton').label = 'Redeem Buffet';
        });
}

// Handle tool access with security checks
function handleToolAccess(toolName) {
    const memberId = getCurrentMemberId();
    
    if (!memberId) {
        $w('#errorMessage').text = 'Please log in first';
        $w('#errorMessage').show();
        return;
    }
    
    checkToolAccess(memberId, toolName)
        .then(() => {
            // Route to appropriate tool
            routeToTool(toolName);
        })
        .catch(error => {
            $w('#errorMessage').text = error.message;
            $w('#errorMessage').show();
            
            // Show upgrade prompt if applicable
            if (error.message.includes('higher membership tier')) {
                $w('#upgradePrompt').show();
            }
        });
}

// Route to specific tool
function routeToTool(toolName) {
    const routes = {
        'digital-cookbook': '/digital-cookbook',
        'digital-sms': '/business-suite/sms',
        'allergen-matrix': '/business-suite/allergen',
        'supplier-ledger': '/business-suite/supplier',
        'wholesale-audit': '/business-suite/audit'
    };
    
    const route = routes[toolName];
    if (route) {
        wixLocation.to(route);
    }
}

// Open allergen settings lightbox
function openAllergenSettings() {
    const memberId = getCurrentMemberId();
    
    if (!memberId) {
        $w('#errorMessage').text = 'Please log in first';
        $w('#errorMessage').show();
        return;
    }
    
    createAllergenLightboxData(memberId)
        .then(lightboxData => {
            // Open allergen settings lightbox
            wixWindow.openLightbox('Allergen Settings', lightboxData);
        })
        .catch(error => {
            $w('#errorMessage').text = error.message;
            $w('#errorMessage').show();
        });
}

// Handle download with compliance check
function handleDownload(documentType) {
    const memberId = getCurrentMemberId();
    
    if (!memberId) {
        $w('#errorMessage').text = 'Please log in first';
        $w('#errorMessage').show();
        return;
    }
    
    // Check download permissions
    
    checkDownloadPermission(memberId, documentType)
        .then(permission => {
            if (permission.allowed) {
                // Initiate download
                initiateDownload(permission.downloadUrl, documentType);
            } else {
                $w('#errorMessage').text = permission.message;
                $w('#errorMessage').show();
                $w('#complianceWarning').show();
            }
        })
        .catch(error => {
            $w('#errorMessage').text = error.message;
            $w('#errorMessage').show();
        });
}

// Initiate file download
function initiateDownload(downloadUrl, documentType) {
    // Create download link
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${documentType}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    $w('#successMessage').text = `${documentType} downloaded successfully`;
    $w('#successMessage').show();
}

// Check authentication status
function checkAuthenticationStatus() {
    const memberId = getCurrentMemberId();
    
    if (memberId) {
        // User is authenticated
        $w('#loginSection').hide();
        $w('#dashboardSection').show();
    } else {
        // User needs to log in
        $w('#loginSection').show();
        $w('#dashboardSection').hide();
    }
}

// Handle login form submission
export function handleLogin(event) {
    const email = $w('#emailInput').value;
    const password = $w('#passwordInput').value;
    
    // Show loading state
    $w('#loginButton').disable();
    $w('#loginButton').label = 'Logging in...';
    
    loginUser(email, password)
        .then(result => {
            // Store member ID
            localStorage.setItem('memberId', result.memberId);
            $w('#memberIdInput').value = result.memberId;
            
            // Reload dashboard
            initializeMemberDashboard();
            
            // Show success message
            $w('#successMessage').text = 'Login successful!';
            $w('#successMessage').show();
        })
        .catch(error => {
            $w('#errorMessage').text = error.message;
            $w('#errorMessage').show();
            $w('#loginButton').enable();
            $w('#loginButton').label = 'Login';
        });
}

// Handle registration form submission
export function handleRegistration(event) {
    const email = $w('#regEmailInput').value;
    const password = $w('#regPasswordInput').value;
    const name = $w('#regNameInput').value;
    const tier = $w('#tierSelect').value;
    
    // Show loading state
    $w('#registerButton').disable();
    $w('#registerButton').label = 'Creating account...';
    
    registerUser(email, password, { name: name, tier: tier })
        .then(result => {
            // Store member ID
            localStorage.setItem('memberId', result.memberId);
            $w('#memberIdInput').value = result.memberId;
            
            // Reload dashboard
            initializeMemberDashboard();
            
            // Show success message
            $w('#successMessage').text = 'Registration successful! Welcome to Green Africa Hub!';
            $w('#successMessage').show();
        })
        .catch(error => {
            $w('#errorMessage').text = error.message;
            $w('#errorMessage').show();
            $w('#registerButton').enable();
            $w('#registerButton').label = 'Register';
        });
}

// Handle logout
export function handleLogout() {
    // Clear session
    localStorage.removeItem('memberId');
    $w('#memberIdInput').value = '';
    
    // Reset UI
    $w('#loginSection').show();
    $w('#dashboardSection').hide();
    $w('#activeBadge').hide();
    
    // Show message
    $w('#successMessage').text = 'Logged out successfully';
    $w('#successMessage').show();
}

// Update UI based on member tier
function updateUIForTier(tier) {
    const tierFeatures = {
        'basic': {
            showCookbook: false,
            showBusinessSuite: false,
            showSupplierTools: false,
            showAllergenSettings: false
        },
        'pro': {
            showCookbook: true,
            showBusinessSuite: true,
            showSupplierTools: false,
            showAllergenSettings: true
        },
        'proplus': {
            showCookbook: true,
            showBusinessSuite: true,
            showSupplierTools: true,
            showAllergenSettings: true
        },
        'enterprise': {
            showCookbook: true,
            showBusinessSuite: true,
            showSupplierTools: true,
            showAllergenSettings: true,
            showStaffManagement: true
        }
    };
    
    const features = tierFeatures[tier] || tierFeatures['basic'];
    
    // Show/hide UI elements based on tier
    $w('#cookbookButton').collapse = !features.showCookbook;
    $w('#businessSuiteSection').collapse = !features.showBusinessSuite;
    $w('#supplierToolsSection').collapse = !features.showSupplierTools;
    $w('#allergenSettingsButton').collapse = !features.showAllergenSettings;
    $w('#staffManagementSection').collapse = !features.showStaffManagement;
}

// Export functions for use in page code
export {
    initializeMemberDashboard,
    handleRedemption,
    handleToolAccess,
    openAllergenSettings,
    handleDownload,
    updateUIForTier
};
