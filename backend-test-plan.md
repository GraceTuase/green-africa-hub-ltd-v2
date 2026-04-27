# 🧪 Wix Velo Backend Testing Plan

## **Backend Modules Reviewed ✅**

### **1. allergen.jsw** - Dynamic Allergen Matrix & QR System
**Functions Tested:**
- ✅ `getAllergenSettings(memberId)` - Get member allergen preferences
- ✅ `updateAllergenSettings(memberId, allergenData)` - Update allergen settings
- ✅ `generateAllergenMatrixUrl(memberId)` - Generate QR code URL
- ✅ `getPublicAllergenMatrix(memberId, hash, timestamp)` - Public display
- ✅ `createAllergenLightboxData(memberId)` - UI data preparation
- ✅ `logQRCodeScan(memberId, scanData)` - Analytics tracking
- ✅ `getAllergenComplianceReport(memberId, dateRange)` - Compliance reporting

**Database Collections Required:**
- `MembersProfile` - Member data and allergen settings
- `UsageLogs` - Allergen-related activity logs

---

### **2. carbon-impact.jsw** - Triple-Pillar Carbon Impact Engine
**Functions Tested:**
- ✅ `calculateTriplePillarSavings(memberId, dailyMenu)` - Core carbon calculation
- ✅ `updateMemberCarbonSaved(memberId, carbonSavings)` - Update lifetime savings
- ✅ `getCarbonImpactDashboard(memberId)` - Dashboard data
- ✅ `calculateDailyMenuImpact(dailyMenu, eventDate)` - Admin calculations
- ✅ `getSupplierCarbonImpact(supplierId, dateRange)` - Supplier analytics

**Database Collections Required:**
- `MembersProfile` - Carbon savings tracking
- `HeritageCookbook` - Recipe carbon data
- `UsageLogs` - Carbon savings logs
- `SupplierLedger` - Supplier carbon data

---

### **3. security.jsw** - Professional Tool Gating System
**Functions Tested:**
- ✅ `checkCookbookAccess(memberId)` - Cookbook access control
- ✅ `checkBusinessSuiteAccess(memberId)` - Business suite access
- ✅ `checkDownloadPermission(memberId, reportType)` - Download protection
- ✅ `protectRoute(memberId, requiredTier, toolName)` - Route protection
- ✅ `checkSupplierAccess(memberId)` - Supplier ledger access
- ✅ `checkMultiStaffAccess(memberId)` - Multi-staff access
- ✅ `checkAuditAccess(memberId)` - Audit portal access
- ✅ `checkTrustScore(memberId, minimumScore)` - Trust score validation
- ✅ `getMemberAccessProfile(memberId)` - Comprehensive access profile

**Database Collections Required:**
- `MembersProfile` - Member tiers and permissions
- `UsageLogs` - Compliance activity tracking

---

### **4. referral.jsw** - Referral System & Wallet Management
**Functions Tested:**
- ✅ `generateReferralCode(memberId)` - Generate unique codes
- ✅ `createReferralEntry(memberId)` - Setup referral system
- ✅ `processReferralSignup(referralCode, referredEmail, purchaseType, purchaseAmount)` - Process referrals
- ✅ `getReferralStats(memberId)` - Get referral statistics
- ✅ `getReferralHistory(memberId)` - Referral history
- ✅ `useWalletBalance(memberId, purchaseAmount)` - Wallet transactions
- ✅ `validateReferralCode(referralCode)` - Code validation

**Database Collections Required:**
- `MembersProfile` - Referral codes and wallet balance
- `ReferralLedger` - Referral transactions

---

## **Required Wix Database Schema**

### **MembersProfile Collection**
```javascript
{
  "_id": "string",
  "uniqueMemberId": "string",
  "email": "string",
  "name": "string",
  "tier": "string", // basic, pro, proplus, enterprise
  "attendanceStatus": "string", // CheckedIn, CheckedOut
  "allergenSettings": "string", // JSON string
  "allergenSettingsUpdated": "Date",
  "allergenMatrixVersion": "string",
  "allergenMatrixUrl": "string",
  "allergenMatrixGenerated": "Date",
  "qrScanCount": "number",
  "lastQRScan": "Date",
  "lifetimeCarbonSaved": "number",
  "monthlyCarbonSaved": "number",
  "lastCarbonCalculation": "Date",
  "referralCode": "string",
  "totalReferrals": "number",
  "totalReferralEarnings": "number",
  "walletBalance": "number",
  "trustScore": "number",
  "parentId": "string", // For multi-staff accounts
  "createdDate": "Date",
  "updatedDate": "Date"
}
```

### **UsageLogs Collection**
```javascript
{
  "_id": "string",
  "memberId": "string",
  "action": "string", // ALLERGEN_SETTINGS_UPDATE, QR_CODE_SCAN, CARBON_SAVINGS, etc.
  "timestamp": "Date",
  "compliance": "string", // FOOD_SAFETY, CUSTOMER_ENGAGEMENT, TRIPLE_PILLAR, etc.
  "registryTrust": "boolean",
  "carbonAmount": "number", // For carbon logs
  "allergenCount": "number", // For allergen logs
  "scanData": "string" // For QR scan logs
}
```

### **HeritageCookbook Collection**
```javascript
{
  "_id": "string",
  "recipeName": "string",
  "airFreightBaseline": "number", // kg CO2e per kg
  "seaFreightTotal": "number", // kg CO2e per kg
  "gasBaseline": "number", // kg CO2e per kg
  "inductionSavings": "number", // kg CO2e per kg
  "ingredients": "array",
  "instructions": "string",
  "category": "string"
}
```

### **ReferralLedger Collection**
```javascript
{
  "_id": "string",
  "referralId": "string",
  "referrerId": "string",
  "referredEmail": "string",
  "referralCode": "string",
  "referralDate": "Date",
  "signupDate": "Date",
  "purchaseType": "string", // membership, event_ticket
  "purchaseAmount": "number",
  "bonusAmount": "number",
  "status": "string", // completed, pending
  "walletCredited": "boolean",
  "walletCreditDate": "Date"
}
```

### **SupplierLedger Collection**
```javascript
{
  "_id": "string",
  "supplierId": "string",
  "date": "Date",
  "carbonImpact": "number",
  "transactionType": "string",
  "amount": "number",
  "description": "string"
}
```

---

## **Testing Checklist**

### **Phase 1: Database Setup**
- [ ] Create all required collections in Wix CMS
- [ ] Set up proper field types and permissions
- [ ] Add sample data for testing

### **Phase 2: Backend Function Testing**
- [ ] Test all allergen functions with sample member data
- [ ] Verify carbon impact calculations with known values
- [ ] Test security access controls for all tiers
- [ ] Validate referral system with test transactions

### **Phase 3: Integration Testing**
- [ ] Test frontend-backend communication
- [ ] Verify error handling and edge cases
- [ ] Test concurrent user scenarios
- [ ] Validate data consistency across collections

### **Phase 4: Performance Testing**
- [ ] Test with large datasets
- [ ] Verify query performance
- [ ] Test API response times
- [ ] Check memory usage

---

## **Next Steps**

1. **Set up Wix Database Collections** - Create the schema above
2. **Deploy Backend Code** - Push to Wix Dev Mode
3. **Run Function Tests** - Verify each backend module
4. **Test Frontend Integration** - Connect UI to backend
5. **Performance Validation** - Ensure scalability
6. **Go Live** - Deploy to production

---

**Status**: Backend code review complete ✅  
**Ready for**: Database setup and deployment testing 🚀
