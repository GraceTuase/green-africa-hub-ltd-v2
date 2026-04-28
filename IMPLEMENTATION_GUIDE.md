# 🚀 Wix Velo Implementation Guide

## **Phase 1: Wix Dev Mode Setup & GitHub Connection**

### **Step 1: Access Your Wix Site**
1. Go to [wix.com](https://www.wix.com) and log in
2. Open your Green Africa Hub site in the Editor
3. Click **"Dev Mode"** in the top toolbar
4. Click **"Enable Dev Mode"** if not already enabled
5. Wait for Dev Mode to initialize (2-3 minutes)

### **Step 2: Connect GitHub Repository**
1. In Dev Mode, click the **Git icon** in the left sidebar
2. Click **"Connect to GitHub"**
3. Authorize Wix to access your GitHub account
4. Select repository: **`GraceTuase/green-africa-hub-ltd-v2`**
5. Select branch: **`main`**
6. Click **"Connect Repository"**

### **Step 3: Configure Sync Settings**
1. Set sync direction: **"GitHub to Wix"**
2. Enable **"Auto-sync on push"**
3. Select folders to sync:
   - ✅ `backend/` (all .jsw files)
   - ✅ `public/` (main.js)
   - ✅ Root level files (events.js)
4. Click **"Save Configuration"**

### **Step 4: Initial Sync**
1. Click **"Sync Now"** to pull latest changes
2. Wait for sync to complete
3. Verify files appear in Wix Dev Mode file tree
4. Check for any sync errors

---

## **Phase 2: Database Collection Setup**

### **Create MembersProfile Collection**
1. In Dev Mode, click **"CMS"** → **"Collections"**
2. Click **"+ New Collection"**
3. Name: **`MembersProfile`**
4. Add fields with exact names:

| Field Name | Type | Required |
|------------|------|----------|
| uniqueMemberId | Text | ✅ |
| email | Text | ✅ |
| name | Text | ❌ |
| tier | Text | ✅ |
| attendanceStatus | Text | ❌ |
| monthlyMealCredits | Number | ❌ |
| lifetimeCarbonSaved | Number | ❌ |
| monthlyCarbonSaved | Number | ❌ |
| lastCarbonCalculation | Date | ❌ |
| allergenSettings | Text | ❌ |
| allergenSettingsUpdated | Date | ❌ |
| allergenMatrixVersion | Text | ❌ |
| allergenMatrixUrl | Text | ❌ |
| allergenMatrixGenerated | Date | ❌ |
| qrScanCount | Number | ❌ |
| lastQRScan | Date | ❌ |
| referralCode | Text | ❌ |
| totalReferrals | Number | ❌ |
| totalReferralEarnings | Number | ❌ |
| walletBalance | Number | ❌ |
| trustScore | Number | ❌ |
| parentId | Text | ❌ |
| createdDate | Date | ❌ |
| updatedDate | Date | ❌ |

### **Create UsageLogs Collection**
1. Click **"+ New Collection"**
2. Name: **`UsageLogs`**
3. Add fields:

| Field Name | Type | Required |
|------------|------|----------|
| memberId | Text | ✅ |
| action | Text | ✅ |
| timestamp | Date | ✅ |
| compliance | Text | ❌ |
| registryTrust | Boolean | ❌ |
| carbonAmount | Number | ❌ |
| allergenCount | Number | ❌ |
| scanData | Text | ❌ |

### **Create HeritageCookbook Collection**
1. Click **"+ New Collection"**
2. Name: **`HeritageCookbook`**
3. Add fields:

| Field Name | Type | Required |
|------------|------|----------|
| recipeName | Text | ✅ |
| airFreightBaseline | Number | ❌ |
| seaFreightTotal | Number | ❌ |
| gasBaseline | Number | ❌ |
| inductionSavings | Number | ❌ |
| ingredients | Text | ❌ |
| instructions | Text | ❌ |
| category | Text | ❌ |

### **Create ReferralLedger Collection**
1. Click **"+ New Collection"**
2. Name: **`ReferralLedger`**
3. Add fields:

| Field Name | Type | Required |
|------------|------|----------|
| referralId | Text | ✅ |
| referrerId | Text | ✅ |
| referredEmail | Text | ✅ |
| referralCode | Text | ✅ |
| referralDate | Date | ❌ |
| signupDate | Date | ❌ |
| purchaseType | Text | ❌ |
| purchaseAmount | Number | ❌ |
| bonusAmount | Number | ❌ |
| status | Text | ❌ |
| walletCredited | Boolean | ❌ |
| walletCreditDate | Date | ❌ |

### **Create SupplierLedger Collection**
1. Click **"+ New Collection"**
2. Name: **`SupplierLedger`**
3. Add fields:

| Field Name | Type | Required |
|------------|------|----------|
| supplierId | Text | ✅ |
| date | Date | ✅ |
| carbonImpact | Number | ❌ |
| transactionType | Text | ❌ |
| amount | Number | ❌ |
| description | Text | ❌ |

---

## **Phase 3: Backend Function Deployment**

### **Verify Backend Files**
1. In Dev Mode, click **"Backend"** in the sidebar
2. Verify these files are present:
   - ✅ `allergen.jsw`
   - ✅ `carbon-impact.jsw`
   - ✅ `security.jsw`
   - ✅ `referral.jsw`
   - ✅ `events.js`

### **Test Backend Functions**
1. Click **"Console"** at the bottom
2. Test each function:

```javascript
// Test allergen functions
import { getAllergenSettings } from 'backend/allergen';
getAllergenSettings("test-member-id")
  .then(result => console.log("Allergen test:", result))
  .catch(error => console.error("Allergen error:", error));

// Test carbon impact
import { getCarbonImpactDashboard } from 'backend/carbon-impact';
getCarbonImpactDashboard("test-member-id")
  .then(result => console.log("Carbon test:", result))
  .catch(error => console.error("Carbon error:", error));

// Test security
import { checkCookbookAccess } from 'backend/security';
checkCookbookAccess("test-member-id")
  .then(result => console.log("Security test:", result))
  .catch(error => console.error("Security error:", error));

// Test referral
import { getReferralStats } from 'backend/referral';
getReferralStats("test-member-id")
  .then(result => console.log("Referral test:", result))
  .catch(error => console.error("Referral error:", error));
```

---

## **Phase 4: Frontend Integration**

### **Deploy Frontend Files**
1. In Dev Mode, click **"Public"** in the sidebar
2. Verify `main.js` is present
3. If not, drag and drop from your local folder

### **Configure Page Elements**
1. Go to your main dashboard page
2. Add these elements with exact IDs:

| Element Type | ID | Purpose |
|--------------|----|---------|
| Text | memberName | Display member name |
| Text | memberTier | Display membership tier |
| Text | memberId | Display member ID |
| Text | creditsRemaining | Show remaining credits |
| Text | lifetimeCarbonSaved | Show lifetime carbon saved |
| Text | trustScore | Display trust score |
| Button | redeemButton | Redeem meal credits |
| Button | cookbookButton | Access digital cookbook |
| Button | businessButton | Access business suite |
| Button | allergenSettingsButton | Open allergen settings |
| Button | generateQRButton | Generate QR code |
| Image | qrCodeImage | Display QR code |
| Text | allergenMatrixUrl | Show matrix URL |
| Container | activeBadgeContainer | Green badge display |
| Text | badgeCarbonSaved | Badge carbon data |
| Text | badgePercentage | Carbon percentage |
| Text | totalCarbonSaved | Total carbon saved |
| Text | monthlyCarbonSaved | Monthly carbon saved |
| Progress Bar | carbonProgressBar | Carbon progress |
| Text | carbonPercentage | Carbon percentage |
| Text | impactMessage | Impact message |
| Text | attendanceStatus | Check-in status |
| Text | lastRedemption | Last redemption date |
| Text | portionsActivated | Portions count |
| Text | resetCountdown | Reset countdown |
| Text | resetWarning | Reset warning |
| Container | allergenSection | Allergen section |
| Container | dashboardSection | Main dashboard |
| Container | loginSection | Login section |
| Text | successMessage | Success notifications |
| Text | errorMessage | Error notifications |

### **Add Page Code**
1. Click the page code icon (</>)
2. Add this page code:

```javascript
import { redeemMeal, checkRedemptionStatus } from 'backend/redemption';
import { getCarbonImpactDashboard } from 'backend/carbon-impact';
import { checkCookbookAccess, checkBusinessSuiteAccess, checkDownloadPermission } from 'backend/security';
import { getAllergenSettings, generateAllergenMatrixUrl } from 'backend/allergen';
import { getResetStatus } from 'backend/jobs';

// Page initialization
$w.onReady(function () {
    console.log('Green Africa Hub - Dashboard Loading...');
    initializeMemberDashboard();
    setupEventListeners();
    checkAuthenticationStatus();
    loadResetCountdown();
});

// Copy the rest from public/main.js or import it
```

---

## **Phase 5: Testing & Verification**

### **Create Test Data**
1. In CMS, add sample member data:
```javascript
{
  "uniqueMemberId": "GAH-B-26-PRO-2025-0001",
  "email": "test@example.com",
  "name": "Test Member",
  "tier": "pro",
  "attendanceStatus": "Available",
  "monthlyMealCredits": 5,
  "lifetimeCarbonSaved": 12.5,
  "monthlyCarbonSaved": 2.3,
  "trustScore": 95,
  "referralCode": "GAH-ABC123",
  "walletBalance": 15.00,
  "totalReferrals": 2,
  "totalReferralEarnings": 10.00
}
```

### **Run Integration Tests**
1. Test member registration flow
2. Verify tier-based access controls
3. Test allergen matrix generation
4. Validate carbon impact calculations
5. Test referral system
6. Verify security permissions

---

## **Phase 6: Production Deployment**

### **Final Checks**
- [ ] All backend functions working
- [ ] Frontend elements properly connected
- [ ] Database collections created
- [ ] Test data working
- [ ] Error handling tested
- [ ] Performance acceptable

### **Go Live**
1. Click **"Publish"** in Wix Editor
2. Review site settings
3. Click **"Publish Site"**
4. Test live functionality
5. Monitor for errors

---

## **🎯 Success Metrics**

### **Deployment Success When:**
- ✅ Backend functions load without errors
- ✅ Frontend connects to backend successfully
- ✅ Member registration flow works
- ✅ Access controls function properly
- ✅ Carbon calculations display correctly
- ✅ Allergen matrix generates QR codes
- ✅ Referral system processes transactions
- ✅ Site loads quickly on mobile and desktop

---

## **🚨 Troubleshooting**

### **Common Issues & Solutions**

#### **Backend Function Errors**
- Check collection names match exactly
- Verify field names in database
- Ensure proper permissions set
- Look for syntax errors in console

#### **Frontend Integration Issues**
- Confirm element IDs match code
- Check backend import paths
- Verify user authentication flow
- Test element visibility

#### **Database Problems**
- Collection permissions too restrictive
- Missing required fields
- Incorrect data types
- No sample data for testing

---

**Your Wix Velo implementation is now ready! Follow this guide step-by-step to deploy your complete Green Africa Hub platform.** 🚀
