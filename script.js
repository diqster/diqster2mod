/* script.js - handles local storage, rendering galleries and upload handling */

const STORAGE_KEY = 'diqster_mods_v1';

function getMods() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) { return []; }
}

function saveMods(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function addMod(mod) {
  const all = getMods();
  all.unshift(mod);
  saveMods(all);
  return mod;
}

function renderGallery(category = 'all', containerId = 'gallery') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const mods = getMods();
  let items = mods;
  if (category !== 'all') {
    // accept both 'truck' and 'truckskin' naming
    const catMap = { truck:'truck', truckskin:'truck', trailer:'trailer', bus:'bus', maps:'maps', sound:'sound', others:'others' };
    const c = catMap[category] || category;
    items = mods.filter(m => (m.category || '').toLowerCase() === c.toLowerCase());
  }

  if (!items || items.length === 0) {
    container.innerHTML = '<div class="empty">No items yet in this category.</div>';
    return;
  }

  container.innerHTML = items.map(m => {
    const preview = m.preview || m.image || 'assets/images/logo.png';
    return `
      <div class="card">
        <img src="${escapeHtml(preview)}" alt="${escapeHtml(m.name)} preview"/>
        <h3>${escapeHtml(m.name)}</h3>
        <p class="lead">${escapeHtml(m.desc || m.description || '')}</p>
        <div class="meta">
          <small>${escapeHtml(m.author || '')}</small>
          <a href="${escapeHtml(m.link)}" target="_blank" rel="noopener noreferrer">Download</a>
        </div>
      </div>
    `;
  }).join('');
}

// escape helper
function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g,function(s){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s];
  });
}

// Upload page logic
document.addEventListener('DOMContentLoaded', function(){
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const f = e.target;
      const name = f.name.value.trim();
      const author = f.author.value.trim();
      const category = f.category.value;
      const link = f.link.value.trim();
      const imgurl = f.imgurl.value.trim();
      const desc = f.description.value.trim();

      let preview = imgurl || '';
      const fileInput = document.getElementById('imgfile');
      if (!preview && fileInput && fileInput.files && fileInput.files[0]) {
        preview = await readFileAsDataURL(fileInput.files[0]);
      }

      const mod = { id: Date.now(), name, author, category: category.toLowerCase(), link, preview, desc, addedAt: new Date().toISOString() };
      addMod(mod);
      const msg = document.getElementById('upload-msg');
      if (msg) msg.innerText = 'Mod added locally — open its category page to see it.';
      f.reset();
    });

    const clearBtn = document.getElementById('clearStorage');
    if (clearBtn) clearBtn.addEventListener('click', function(){
      if (confirm('Clear all local mods data? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        alert('Local data cleared.');
      }
    });
  }

  // auto-render galleries on pages with #gallery or featured-grid
  renderGallery('all', 'featured-grid');
  const g = document.getElementById('gallery');
  if (g) {
    const cat = g.getAttribute('data-category') || g.dataset.category || 'all';
    renderGallery(cat, 'gallery');
  }
});

// read file to dataURL
function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej();
    r.readAsDataURL(file);
  });
}
