// Public: main.js - Member Dashboard Frontend Logic
import { redeemMeal, checkRedemptionStatus } from 'backend/redemption';
import { getCarbonImpactDashboard } from 'backend/carbon-impact';
import { checkCookbookAccess, checkBusinessSuiteAccess, checkDownloadPermission } from 'backend/security';
import { getAllergenSettings, generateAllergenMatrixUrl } from 'backend/allergen';
import { getResetStatus } from 'backend/jobs';

// Page load initialization
$w.onReady(function () {
    console.log('Green Africa Hub Registry of Trust - Dashboard Loading...');
    
    // Initialize member dashboard
    initializeMemberDashboard();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check authentication status
    checkAuthenticationStatus();
    
    // Load reset countdown
    loadResetCountdown();
});

// Initialize member dashboard
function initializeMemberDashboard() {
    // Get current member ID from session or login
    const memberId = getCurrentMemberId();
    
    if (!memberId) {
        // Redirect to login if not authenticated
        showLoginSection();
        return;
    }
    
    console.log(`Loading dashboard for member: ${memberId}`);
    
    // Load member data
    loadMemberData(memberId);
    
    // Update Green Badge visibility based on attendance status
    updateGreenBadge(memberId);
    
    // Load carbon impact data
    loadCarbonImpact(memberId);
    
    // Load redemption status
    loadRedemptionStatus(memberId);
    
    // Load access permissions
    loadAccessPermissions(memberId);
    
    // Load allergen settings (if business tier)
    loadAllergenSettings(memberId);
}

// Get current member ID
function getCurrentMemberId() {
    // In production, get from Wix session or authentication
    return $w('#memberIdInput').value || 
           wixUsers.currentUser.id || 
           localStorage.getItem('memberId') || 
           sessionStorage.getItem('memberId');
}

// Load member data
function loadMemberData(memberId) {
    wixData.query('MembersProfile')
        .eq('uniqueMemberId', memberId)
        .limit(1)
        .find()
        .then(results => {
            if (results.items.length === 0) {
                console.error('Member not found in Registry');
                showLoginSection();
                return;
            }
            
            const member = results.items[0];
            
            // Update UI with member data
            $w('#memberName').text = member.name || member.email;
            $w('#memberTier').text = formatTierName(member.tier);
            $w('#memberId').text = member.uniqueMemberId;
            $w('#creditsRemaining').text = member.monthlyMealCredits;
            $w('#lifetimeCarbonSaved').text = `${member.lifetimeCarbonSaved.toFixed(2)} kg CO₂`;
            $w('#trustScore').text = `${member.trustScore || 100}%`;
            
            // Store member data globally
            $w('#currentMemberData').value = member;
            
            console.log(`Member loaded: ${member.uniqueMemberId}, Tier: ${member.tier}`);
        })
        .catch(error => {
            console.error('Error loading member data:', error);
            showErrorMessage('Failed to load member data');
        });
}

// Update Green Badge visibility
function updateGreenBadge(memberId) {
    checkRedemptionStatus(memberId)
        .then(status => {
            const badgeContainer = $w('#activeBadgeContainer');
            const redeemButton = $w('#redeemButton');
            
            if (status.activeGreenBadge) {
                // Show active green badge
                badgeContainer.show();
                redeemButton.hide();
                
                // Update badge with carbon data
                loadActiveBadgeData(memberId);
            } else {
                // Hide green badge, show redeem button if credits available
                badgeContainer.hide();
                
                if (status.canRedeem) {
                    redeemButton.show();
                    redeemButton.label = `Redeem Monthly Buffet (${status.creditsRemaining} credits)`;
                } else {
                    redeemButton.hide();
                }
            }
        })
        .catch(error => {
            console.error('Error checking redemption status:', error);
        });
}

// Load active badge data
function loadActiveBadgeData(memberId) {
    getCarbonImpactDashboard(memberId)
        .then(carbonData => {
            if (carbonData.activeGreenBadge) {
                // Update badge with carbon savings
                $w('#badgeCarbonSaved').text = `${carbonData.monthlyCarbonSaved.toFixed(2)} kg CO₂`;
                $w('#badgePercentage').text = `-${calculateCarbonPercentage(carbonData.monthlyCarbonSaved)}%`;
                
                // Show badge animation
                $w('#activeBadgeContainer').style.animation = 'pulse 2s infinite';
            }
        })
        .catch(error => {
            console.error('Error loading badge data:', error);
        });
}

// Load carbon impact data
function loadCarbonImpact(memberId) {
    getCarbonImpactDashboard(memberId)
        .then(carbonData => {
            // Update carbon dashboard
            $w('#totalCarbonSaved').text = `${carbonData.lifetimeCarbonSaved.toFixed(2)} kg CO₂`;
            $w('#monthlyCarbonSaved').text = `${carbonData.monthlyCarbonSaved.toFixed(2)} kg CO₂`;
            
            // Update progress bar
            const targetSavings = 100; // kg CO₂ monthly target
            const percentage = Math.min((carbonData.monthlyCarbonSaved / targetSavings) * 100, 100);
            $w('#carbonProgressBar').value = percentage;
            $w('#carbonPercentage').text = `${percentage.toFixed(1)}%`;
            
            // Show impact message
            if (carbonData.monthlyCarbonSaved > 0) {
                $w('#impactMessage').text = `Great job! You've saved ${carbonData.monthlyCarbonSaved.toFixed(2)} kg CO₂ this month!`;
            } else {
                $w('#impactMessage').text = 'Check in at an event to start tracking your carbon impact!';
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
            $w('#creditsRemaining').text = status.creditsRemaining;
            $w('#lastRedemption').text = status.lastRedemption ? formatDate(status.lastRedemption) : 'Never';
            $w('#portionsActivated').text = status.portionsActivated || 0;
            
            // Update status indicator
            const statusText = status.status === 'CheckedIn' ? 'Checked In' : 'Available';
            const statusColor = status.status === 'CheckedIn' ? '#28a745' : '#ffc107';
            
            $w('#attendanceStatus').text = statusText;
            $w('#attendanceStatus').style.color = statusColor;
            
            // Show/hide redeem button
            const redeemButton = $w('#redeemButton');
            if (status.canRedeem) {
                redeemButton.show();
                redeemButton.label = `Redeem Monthly Buffet (${status.creditsRemaining} credits)`;
            } else {
                redeemButton.hide();
            }
        })
        .catch(error => {
            console.error('Error loading redemption status:', error);
        });
}

// Load access permissions
function loadAccessPermissions(memberId) {
    Promise.all([
        checkCookbookAccess(memberId),
        checkBusinessSuiteAccess(memberId)
    ]).then(([cookbookAccess, businessAccess]) => {
        // Update cookbook access
        const cookbookButton = $w('#cookbookButton');
        if (cookbookAccess.allowed) {
            cookbookButton.show();
            cookbookButton.label = 'Digital Cookbook';
        } else {
            cookbookButton.hide();
        }
        
        // Update business suite access
        const businessButton = $w('#businessButton');
        if (businessAccess.allowed) {
            businessButton.show();
            businessButton.label = 'Business Suite';
        } else {
            businessButton.hide();
        }
        
        // Store access permissions
        $w('#accessPermissions').value = {
            cookbook: cookbookAccess,
            business: businessAccess
        };
    })
    .catch(error => {
        console.error('Error loading access permissions:', error);
    });
}

// Load allergen settings (business tier only)
function loadAllergenSettings(memberId) {
    getAllergenSettings(memberId)
        .then(settings => {
            if (settings.tier !== 'basic') {
                // Show allergen section for business tiers
                $w('#allergenSection').show();
                
                // Update allergen matrix URL if exists
                if (settings.matrixUrl) {
                    $w('#allergenMatrixUrl').text = settings.matrixUrl;
                    $w('#qrCodeImage').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(settings.matrixUrl)}`;
                }
            }
        })
        .catch(error => {
            console.error('Error loading allergen settings:', error);
        });
}

// Load reset countdown
function loadResetCountdown() {
    getResetStatus()
        .then(status => {
            updateCountdownDisplay(status);
            
            // Update countdown every minute
            setInterval(() => {
                getResetStatus().then(updateCountdownDisplay);
            }, 60000);
        })
        .catch(error => {
            console.error('Error loading reset status:', error);
        });
}

// Update countdown display
function updateCountdownDisplay(status) {
    const countdownText = `${status.daysUntilReset}d ${status.hoursUntilReset}h ${status.minutesUntilReset}m`;
    $w('#resetCountdown').text = `Next reset: ${countdownText}`;
    
    // Show warning if reset is soon
    if (status.daysUntilReset === 0 && status.hoursUntilReset < 2) {
        $w('#resetWarning').show();
        $w('#resetWarning').text = 'Monthly reset coming soon! Use your credits before they reset.';
    } else {
        $w('#resetWarning').hide();
    }
}

// Set up event listeners
function setupEventListeners() {
    // Redeem button click
    $w('#redeemButton').onClick(() => {
        const memberId = getCurrentMemberId();
        if (!memberId) {
            showErrorMessage('Please log in to redeem credits');
            return;
        }
        
        redeemMeal(memberId)
            .then(result => {
                if (result.success) {
                    showSuccessMessage(result.message);
                    // Refresh dashboard
                    initializeMemberDashboard();
                } else {
                    showErrorMessage(result.message);
                }
            })
            .catch(error => {
                console.error('Redemption error:', error);
                showErrorMessage('Failed to redeem credits. Please try again.');
            });
    });
    
    // Cookbook button click
    $w('#cookbookButton').onClick(() => {
        const memberId = getCurrentMemberId();
        const access = $w('#accessPermissions').value?.cookbook;
        
        if (!access?.allowed) {
            showErrorMessage(access?.message || 'Access denied');
            return;
        }
        
        wixLocation.to('/digital-cookbook');
    });
    
    // Business button click
    $w('#businessButton').onClick(() => {
        const memberId = getCurrentMemberId();
        const access = $w('#accessPermissions').value?.business;
        
        if (!access?.allowed) {
            showErrorMessage(access?.message || 'Access denied');
            return;
        }
        
        wixLocation.to('/business-dashboard');
    });
    
    // Allergen settings click
    $w('#allergenSettingsButton').onClick(() => {
        wixWindow.openLightbox('AllergenSettings');
    });
    
    // Generate QR code click
    $w('#generateQRButton').onClick(() => {
        const memberId = getCurrentMemberId();
        
        generateAllergenMatrixUrl(memberId)
            .then(result => {
                if (result.success) {
                    $w('#qrCodeImage').src = result.qrCodeUrl;
                    $w('#allergenMatrixUrl').text = result.matrixUrl;
                    showSuccessMessage('QR code generated successfully');
                } else {
                    showErrorMessage('Failed to generate QR code');
                }
            })
            .catch(error => {
                console.error('QR generation error:', error);
                showErrorMessage('Failed to generate QR code');
            });
    });
}

// Helper functions
function formatTierName(tier) {
    const tierNames = {
        'basic': 'Consumer',
        'pro': 'Independent Caterer',
        'proplus': 'Caterer-Supplier',
        'enterprise': 'Organisation'
    };
    return tierNames[tier] || tier;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function calculateCarbonPercentage(carbonSaved) {
    const baseline = 50; // kg CO₂ baseline for comparison
    return ((carbonSaved / baseline) * 100).toFixed(1);
}

function showLoginSection() {
    $w('#dashboardSection').hide();
    $w('#loginSection').show();
}

function showSuccessMessage(message) {
    $w('#successMessage').text = message;
    $w('#successMessage').show();
    setTimeout(() => {
        $w('#successMessage').hide();
    }, 5000);
}

function showErrorMessage(message) {
    $w('#errorMessage').text = message;
    $w('#errorMessage').show();
    setTimeout(() => {
        $w('#errorMessage').hide();
    }, 5000);
}

function checkAuthenticationStatus() {
    wixUsers.currentUser
        .getCurrentUser()
        .then(user => {
            if (!user.loggedIn) {
                showLoginSection();
            }
        })
        .catch(error => {
            console.error('Authentication check failed:', error);
            showLoginSection();
        });
}
