// Backend: events.js - Green Africa Hub Registry of Trust
import wixData from 'wix-data';
import wixUsers from 'wix-users';

// Tier Configuration Matrix - 5-Tier System
const TIER_CONFIG = {
    'basic': {
        code: 'GAH-C-26',
        price: 30,
        credits: 1,
        name: 'Consumer',
        features: ['buffet_access', 'impact_dashboard', 'flagship_discount_10'],
        restrictions: ['no_cookbook', 'no_business_tools'],
        serviceCharge: 0,
        flagshipDiscount: 10
    },
    'pro': {
        code: 'GAH-B-26-PRO',
        price: 50,
        credits: 3,
        name: 'Independent Caterer',
        features: ['buffet_access', 'impact_dashboard', 'ai_dashboard', 'digital_sms_basic', 'allergen_matrix', 'digital_cookbook'],
        restrictions: [],
        serviceCharge: 0,
        flagshipDiscount: 50
    },
    'proplus': {
        code: 'GAH-S-26-SUP',
        price: 100,
        credits: 5,
        name: 'Caterer-Supplier',
        features: ['buffet_access', 'impact_dashboard', 'ai_dashboard', 'digital_sms_basic', 'allergen_matrix', 'digital_cookbook', 'supplier_ledger', 'wholesale_audit', 'esg_scope1_3'],
        restrictions: [],
        serviceCharge: 0,
        flagshipDiscount: 50
    },
    'enterprise': {
        code: 'GAH-E-26-ORG',
        price: 299,
        credits: 5,
        name: 'Organisation',
        features: ['buffet_access', 'impact_dashboard', 'ai_dashboard', 'digital_sms_basic', 'allergen_matrix', 'digital_cookbook', 'supplier_ledger', 'wholesale_audit', 'multi_staff', 'custom_sustainability_ui', 'ai_smart_prep_esg', 'corporate_esg_reports'],
        restrictions: [],
        serviceCharge: 0,
        flagshipDiscount: 50,
        minBillingCycle: 3,
        maxStaffSubIds: 5
    }
};

// Generate Unique Member ID with Registry of Trust compliance
export function generateMemberId(tier, isChild = false, parentId = null) {
    const config = TIER_CONFIG[tier];
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    if (tier === 'enterprise' && isChild && parentId) {
        // Child ID for Enterprise multi-staff
        return `${config.code}-${year}-CHILD-${sequence}`;
    }
    
    return `${config.code}-${year}-${sequence}`;
}

// Handle user registration with tier assignment
export function onUserRegistered(event) {
    const { email, tier, parentId, profile } = event;
    
    // Generate Registry of Trust compliant ID
    const uniqueMemberId = generateMemberId(tier, !!parentId, parentId);
    
    // Create member profile in CMS
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
        createdAt: new Date(),
        email: email,
        name: profile.name || '',
        registryCompliance: true,
        trustScore: 100, // Start with perfect trust score
        walletBalance: 0,
        referralCode: null,
        totalReferrals: 0,
        totalReferralEarnings: 0
    })
    .then(result => {
        console.log(`Registry Member Created: ${uniqueMemberId}`);
        return {
            success: true,
            memberId: uniqueMemberId,
            tier: tier,
            trustScore: 100,
            message: 'Registry of Trust member created successfully'
        };
    });
}

// Get tier credits for monthly reset
export function getTierCredits(tier) {
    return TIER_CONFIG[tier].credits;
}

// Check if member has access to specific feature
export function checkFeatureAccess(memberId, feature) {
    return wixData.query('MembersProfile')
        .eq('uniqueMemberId', memberId)
        .limit(1)
        .find()
        .then(results => {
            if (results.items.length === 0) {
                return { hasAccess: false, reason: 'Member not found' };
            }
            
            const member = results.items[0];
            const tierFeatures = TIER_CONFIG[member.tier].features;
            
            return {
                hasAccess: tierFeatures.includes(feature),
                tier: member.tier,
                restrictions: TIER_CONFIG[member.tier].restrictions
            };
        });
}

// Generate QR Code URL for member
export function generateQRCodeUrl(memberId) {
    return `https://www.greenafricahub.org/registry/${memberId}`;
}

// Default allergen settings for new members
function getDefaultAllergenSettings() {
    return {
        gluten: false,
        dairy: false,
        eggs: false,
        soy: false,
        peanuts: false,
        treeNuts: false,
        shellfish: false,
        fish: false,
        sesame: false,
        mustard: false,
        celery: false,
        lupin: false,
        molluscs: false,
        sulphites: false
    };
}

// Validate Registry of Trust compliance
export function validateRegistryCompliance(memberId) {
    return wixData.query('MembersProfile')
        .eq('uniqueMemberId', memberId)
        .limit(1)
        .find()
        .then(results => {
            if (results.items.length === 0) {
                return { compliant: false, reason: 'Member not found' };
            }
            
            const member = results.items[0];
            return {
                compliant: member.registryCompliance,
                trustScore: member.trustScore,
                tier: member.tier,
                lastValidation: new Date()
            };
        });
}
