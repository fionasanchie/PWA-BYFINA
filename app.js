// app.js – enables offline functionality with service worker

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('✅ Service Worker registered successfully:', reg.scope);
        
        // Optional: check for updates
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('🔄 New content available – refresh to update.');
                showToast('New version available! Refresh to update.', 'info');
              } else {
                console.log('📦 Offline support ready.');
                showToast('Site can now work offline.', 'success');
              }
            }
          };
        };
      })
      .catch(err => {
        console.error('❌ Service Worker registration failed:', err);
        showToast('Offline mode unavailable.', 'error');
      });
  });
}

// Online / Offline detection UI
let onlineStatus = navigator.onLine;

function updateOnlineStatus() {
  onlineStatus = navigator.onLine;
  const statusDiv = document.getElementById('offline-status');
  if (statusDiv) {
    if (onlineStatus) {
      statusDiv.textContent = '🟢 You are online';
      statusDiv.style.backgroundColor = '#d4edda';
      statusDiv.style.color = '#155724';
      setTimeout(() => {
        if (statusDiv) statusDiv.style.display = 'none';
      }, 3000);
    } else {
      statusDiv.textContent = '🔴 Offline mode – using cached content';
      statusDiv.style.backgroundColor = '#f8d7da';
      statusDiv.style.color = '#721c24';
      statusDiv.style.display = 'block';
    }
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Optional: show a small toast notification
function showToast(message, type = 'info') {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.fontFamily = 'sans-serif';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    document.body.appendChild(toast);
  }
  
  const colors = {
    success: '#28a745',
    error: '#dc3545',
    info: '#17a2b8'
  };
  toast.style.backgroundColor = colors[type] || colors.info;
  toast.style.color = 'white';
  toast.textContent = message;
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 4000);
}

// Optional: force refresh of cached assets (if needed)
function refreshCache() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ action: 'refresh' });
    showToast('Refreshing cache...', 'info');
  }
}

// Optional: display cache size (advanced)
async function getCacheSize() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    let total = 0;
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      total += keys.length;
    }
    console.log(`📦 Total cached items: ${total}`);
    return total;
  }
  return 0;
}

// Call on load to show initial status
window.addEventListener('DOMContentLoaded', () => {
  updateOnlineStatus();
  getCacheSize(); // just logs to console
});