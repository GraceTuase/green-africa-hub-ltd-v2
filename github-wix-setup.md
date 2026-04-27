# 🔗 GitHub-Wix Automated Deployment Setup

## **Connect Your Wix Site to GitHub**

### **Step 1: Enable Wix Dev Mode**
1. Go to your Wix Editor
2. Click "Dev Mode" in the top bar
3. Enable Dev Mode for your site
4. Wait for Dev Mode to initialize

### **Step 2: Connect GitHub Repository**
1. In Dev Mode, click the "Git" icon in the sidebar
2. Click "Connect to GitHub"
3. Authorize Wix to access your GitHub account
4. Select repository: `GraceTuase/green-africa-hub-ltd-v2`
5. Select branch: `main`
6. Click "Connect"

### **Step 3: Configure Sync Settings**
1. Set sync direction: "GitHub to Wix" (recommended)
2. Enable auto-sync: ✓
3. Set sync frequency: "On every push"
4. Select folders to sync:
   - `backend/` (all .jsw files)
   - `public/` (main.js)
   - `src/` (if exists)
5. Click "Save Configuration"

### **Step 4: Initial Sync**
1. Click "Sync Now" to pull latest changes from GitHub
2. Wait for sync to complete
3. Verify all files appear in Wix Dev Mode
4. Test backend functions in Wix console

---

## **🚀 Automated Deployment Workflow**

### **Development Workflow**
```bash
# Make changes to your code
git add .
git commit -m "Your changes"
git push origin main
# Wix automatically syncs and deploys!
```

### **What Gets Auto-Deployed**
- All backend `.jsw` files
- Frontend JavaScript files
- Configuration changes
- Database schema updates

### **Manual Override (if needed)**
1. In Wix Dev Mode, click "Git"
2. Click "Pull Changes"
3. Review changes
4. Click "Deploy to Site"

---

## **📊 Deployment Status Monitoring**

### **Check Sync Status**
- Green dot: ✅ Synced and deployed
- Yellow dot: 🔄 Syncing...
- Red dot: ❌ Sync error

### **View Deployment Logs**
1. In Dev Mode, click "Git"
2. Click "View Logs"
3. Check for any errors
4. Fix issues and push again

---

## **🔧 Troubleshooting**

### **Common Issues**

#### **Sync Not Working**
- Check GitHub repository connection
- Verify branch name matches
- Ensure internet connection stable
- Re-authorize GitHub access

#### **Backend Functions Not Loading**
- Check file names match exactly
- Verify `.jsw` extension
- Look for syntax errors in Wix console
- Check import statements

#### **Database Issues**
- Collections not created yet
- Field names don't match schema
- Permissions too restrictive
- Missing required fields

### **Quick Fixes**
1. **Re-sync**: Click "Force Sync" in Git panel
2. **Clear Cache**: Refresh Wix Editor
3. **Check Logs**: Review error messages
4. **Test Manually**: Use Wix console to test functions

---

## **✅ Verification Checklist**

### **After Each Deployment**
- [ ] Backend functions load without errors
- [ ] Frontend connects to backend
- [ ] Member registration works
- [ ] Access controls function
- [ ] Carbon calculations display
- [ ] Allergen matrix generates
- [ ] Referral system processes

### **Weekly Maintenance**
- [ ] Check GitHub repository status
- [ ] Review deployment logs
- [ ] Test all critical functions
- [ ] Update documentation
- [ ] Backup database

---

## **🎯 Production Deployment**

### **Go-Live Checklist**
- [ ] All tests passing in development
- [ ] Database schema finalized
- [ ] Security permissions set
- [ ] Performance optimized
- [ ] Error handling tested
- [ ] User acceptance tested
- [ ] Documentation complete

### **Post-Launch**
- [ ] Monitor error logs
- [ ] Check user feedback
- [ ] Performance monitoring
- [ ] Regular backups
- [ ] Security updates

---

## **📞 Support Resources**

### **Wix Dev Mode Documentation**
- https://dev.wix.com/docs
- https://dev.wix.com/docs/velo-backend-functions

### **GitHub Integration Help**
- https://support.wix.com/article/using-git-in-wix-dev-mode
- https://docs.github.com/en/webhooks

### **Community Support**
- Wix Velo Forum
- GitHub Issues Repository
- Stack Overflow tags: [wix][velo]

---

## **🚀 You're Ready!**

**Your GitHub-Wix automated deployment is now configured!**

**Repository**: https://github.com/GraceTuase/green-africa-hub-ltd-v2.git  
**Wix Site**: Connected and ready for auto-deployment  
**Next Steps**: Test deployment and go live! 🎯

---

**Every push to GitHub will now automatically sync to your Wix site and deploy the changes!**
