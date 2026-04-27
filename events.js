// Backend: events.js
import wixData from 'wix-data';
import wixUsers from 'wix-users';

// Tier configurations
const TIER_CONFIG = {
    'basic': {
        code: 'GAH-C-26',
        price: 30,
        credits: 3,
        name: 'Consumer'
    },
    'pro': {
        code: 'GAH-B-26-PRO',
        price: 50,
        credits: 5,
        name: 'Independent Caterer'
    },
    'proplus': {
        code: 'GAH-S-26-SUP',
        price: 100,
        credits: 5,
        name: 'Caterer-Supplier'
    },
    'enterprise': {
        code: 'GAH-E-26-ORG',
        price: 299,
        credits: 0,
        name: 'Organisations'
    }
};

// Generate unique member ID
export function generateMemberId(tier, isChild = false) {
    const config = TIER_CONFIG[tier];
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    if (tier === 'enterprise' && isChild) {
        return `${config.code}-${year}-CHILD-${random}`;
    }
    
    return `${config.code}-${year}-${random}`;
}

// Handle user registration event
export function onUserRegistered(event) {
    const { email, tier, parentId } = event;
    
    // Generate unique ID
    const isChild = tier === 'enterprise' && parentId;
    const uniqueMemberId = generateMemberId(tier, isChild);
    
    // Create member profile
    return wixData.insert('MembersProfile', {
        uniqueMemberId: uniqueMemberId,
        tier: tier,
        monthlyMealCredits: TIER_CONFIG[tier].credits,
        lifetimeCarbonSaved: 0,
        attendanceStatus: 'Available',
        checkInDate: null,
        usageLogs: 0,
        parentId: parentId || null,
        allergenSettings: JSON.stringify(getDefaultAllergenSettings()),
        qrCodeUrl: generateQRCodeUrl(uniqueMemberId),
        createdAt: new Date()
    }).then(result => {
        console.log(`Member registered: ${uniqueMemberId}`);
        return result;
    });
}

// Get default allergen settings (all 14 major allergens)
function getDefaultAllergenSettings() {
    return {
        cereals: true,
        crustaceans: true,
        eggs: true,
        fish: true,
        peanuts: true,
        soybeans: true,
        milk: true,
        nuts: true,
        celery: true,
        mustard: true,
        sesame: true,
        sulphites: true,
        lupin: true,
        molluscs: true
    };
}

// Generate QR code URL for allergen matrix
function generateQRCodeUrl(memberId) {
    return `https://greenafricahub.org.uk/allergen/${memberId}`;
}

// Verify member access to professional tools
export function verifyProfessionalAccess(memberId, requiredTool) {
    return wixData.query('MembersProfile')
        .eq('uniqueMemberId', memberId)
        .limit(1)
        .find()
        .then(results => {
            if (results.items.length === 0) {
                throw new Error('Member not found');
            }
            
            const member = results.items[0];
            const tier = member.tier;
            
            // Define tool access matrix
            const toolAccess = {
                'digital-cookbook': ['pro', 'proplus', 'enterprise'],
                'digital-sms': ['pro', 'proplus', 'enterprise'],
                'allergen-matrix': ['pro', 'proplus', 'enterprise'],
                'supplier-ledger': ['proplus', 'enterprise'],
                'wholesale-audit': ['proplus', 'enterprise'],
                'multi-staff': ['enterprise']
            };
            
            if (requiredTool === 'basic-dashboard') {
                return true; // All tiers have basic dashboard
            }
            
            const allowedTiers = toolAccess[requiredTool] || [];
            return allowedTiers.includes(tier);
        });
}

// Check compliance for download permissions
export function checkDownloadCompliance(memberId) {
    return wixData.query('MembersProfile')
        .eq('uniqueMemberId', memberId)
        .limit(1)
        .find()
        .then(results => {
            if (results.items.length === 0) {
                throw new Error('Member not found');
            }
            
            const member = results.items[0];
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            // Check if usage logs meet minimum requirement (20 entries)
            return member.usageLogs >= 20;
        });
}
