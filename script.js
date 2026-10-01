/**
 * Dr. Vardhman Jain - Digital Visiting Card
 * Optimized Script: Event Tracking, vCard Generator & Admin Dashboard
 */

const contact = {
    firstName: "Vardhman",
    lastName: "Jain",
    fullName: "Dr. Vardhman Jain",
    title: "Consultant Orthopedic and Arthroscopic Surgeon",
    clinic: "Delhi Hospital & Temple Nursing Home",
    phone: "+919810103230",
    landline: "01141502511",
    email: "dr.vardhmanjain02@gmail.com",
    website: "https://nw.drvardhmanjain.in/",
    address: "1, Ansari Road, Daryaganj, New Delhi - 110002",
};

// Analytics Storage Key
const ANALYTICS_KEY = "dr_vardhman_analytics";

function getAnalytics() {
    const data = localStorage.getItem(ANALYTICS_KEY);
    return data ? JSON.parse(data) : {
        clicks: { call: 0, whatsapp: 0, email: 0, website: 0, location: 0, save: 0 },
        devices: { mobile: 0, tablet: 0, desktop: 0 },
        totalVisitors: 0,
        lastUpdated: null
    };
}

function saveAnalytics(data) {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
}

function getDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
    return "desktop";
}

function trackClick(actionType) {
    const analytics = getAnalytics();
    analytics.clicks[actionType] = (analytics.clicks[actionType] || 0) + 1;
    
    const deviceType = getDeviceType();
    analytics.devices[deviceType] = (analytics.devices[deviceType] || 0) + 1;
    
    analytics.totalVisitors = Object.values(analytics.clicks).reduce((a, b) => a + b, 0);
    saveAnalytics(analytics);
    
    // Background cloud sync
    sendToBackend(analytics);
}

function sendToBackend(analytics) {
    const endpoint = "https://formspree.io/f/dr.fontkw2019@gmail.com";
    const data = {
        action: 'analytics_update',
        timestamp: new Date().toISOString(),
        clicks: analytics.clicks,
        devices: analytics.devices,
        totalVisitors: analytics.totalVisitors
    };
    
    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).catch(() => {
        // Safe offline degradation
    });
}

// Generate & Download vCard (.vcf)
function saveContact() {
    const vcard = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${contact.lastName};${contact.firstName};;;Dr.`,
        `FN:${contact.fullName}`,
        `ORG:${contact.clinic}`,
        `TITLE:${contact.title}`,
        `TEL;TYPE=CELL:${contact.phone}`,
        `TEL;TYPE=WORK,VOICE:${contact.landline}`,
        `EMAIL;TYPE=INTERNET:${contact.email}`,
        `URL:${contact.website}`,
        `ADR;TYPE=WORK:;;${contact.address};New Delhi;Delhi;110002;India`,
        "END:VCARD",
    ].join("\n");

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Dr-Vardhman-Jain.vcf";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 400);
}

// Copy Address Helper
function setupCopyAddress() {
    const copyCard = document.getElementById("copyAddressBtn");
    const toast = document.getElementById("copyToast");
    if (!copyCard || !toast) return;

    copyCard.addEventListener("click", () => {
        const fullAddress = `${contact.clinic}, ${contact.address}`;
        navigator.clipboard.writeText(fullAddress).then(() => {
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 2000);
        });
    });
}

// Admin Modal Logic
function showAdminPanel() {
    const analytics = getAnalytics();
    
    document.getElementById("totalInteractions").textContent = analytics.totalVisitors;
    document.getElementById("mobileCount").textContent = analytics.devices.mobile || 0;
    document.getElementById("desktopCount").textContent = analytics.devices.desktop || 0;
    document.getElementById("tabletCount").textContent = analytics.devices.tablet || 0;
    
    document.getElementById("callCount").textContent = analytics.clicks.call || 0;
    document.getElementById("whatsappCount").textContent = analytics.clicks.whatsapp || 0;
    document.getElementById("emailCount").textContent = analytics.clicks.email || 0;
    document.getElementById("websiteCount").textContent = analytics.clicks.website || 0;
    document.getElementById("locationCount").textContent = analytics.clicks.location || 0;
    document.getElementById("saveCount").textContent = analytics.clicks.save || 0;
    
    document.getElementById("adminModal").style.display = "flex";
}

function clearAnalytics() {
    if (confirm("Are you sure you want to clear all analytics data?")) {
        localStorage.removeItem(ANALYTICS_KEY);
        showAdminPanel();
    }
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Action tracking listeners
    const btnCall = document.querySelector(".btn-call");
    const btnWa = document.querySelector(".btn-whatsapp");
    const btnEmail = document.querySelector(".btn-email");
    const btnWeb = document.querySelector(".btn-website");
    const btnLoc = document.querySelector(".btn-location");
    const btnSave = document.getElementById("saveContact");

    if (btnCall) btnCall.addEventListener("click", () => trackClick("call"));
    if (btnWa) btnWa.addEventListener("click", () => trackClick("whatsapp"));
    if (btnEmail) btnEmail.addEventListener("click", () => trackClick("email"));
    if (btnWeb) btnWeb.addEventListener("click", () => trackClick("website"));
    if (btnLoc) btnLoc.addEventListener("click", () => trackClick("location"));
    if (btnSave) {
        btnSave.addEventListener("click", () => {
            trackClick("save");
            saveContact();
        });
    }

    // Address copy setup
    setupCopyAddress();

    // Admin trigger
    const adminTrigger = document.getElementById("adminTrigger");
    const adminClose = document.querySelector(".admin-close");
    const adminModal = document.getElementById("adminModal");

    if (adminTrigger) adminTrigger.addEventListener("click", showAdminPanel);
    if (adminClose) adminClose.addEventListener("click", () => adminModal.style.display = "none");
    window.addEventListener("click", (e) => {
        if (e.target === adminModal) adminModal.style.display = "none";
    });
});