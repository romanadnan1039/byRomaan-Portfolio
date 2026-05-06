// admin.js - Fully Functional Mini-CMS Dashboard

(function() {
  // Inject Dashboard Styles
  const style = document.createElement('style');
  style.innerHTML = `
    .cms-toggle-btn {
      position: fixed; bottom: 20px; right: 20px; z-index: 99999;
      background: var(--accent); color: #000;
      border: none; border-radius: 50px;
      padding: 12px 24px; font-weight: 700; cursor: pointer;
      box-shadow: 0 5px 20px rgba(255,94,0,0.4);
      transition: all 0.3s ease; font-family: 'DM Sans', sans-serif;
    }
    .cms-toggle-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(255,94,0,0.6); }

    .cms-dashboard {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(10,10,10,0.95); backdrop-filter: blur(20px);
      z-index: 99998; display: none; padding: 40px; overflow-y: auto;
      font-family: 'DM Sans', sans-serif; color: #fff;
    }
    .cms-dashboard.active { display: block; }
    
    .cms-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
    .cms-header h2 { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; color: var(--accent); letter-spacing: 0.05em; }
    
    .cms-section { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 25px; margin-bottom: 30px; }
    .cms-section h3 { font-size: 1.2rem; margin-bottom: 20px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
    
    .cms-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .cms-input-group { margin-bottom: 15px; }
    .cms-input-group label { display: block; font-size: 0.8rem; color: #aaa; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.05em; }
    .cms-input-group input, .cms-input-group textarea {
      width: 100%; padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
      color: #fff; border-radius: 4px; font-family: inherit; transition: border-color 0.3s;
    }
    .cms-input-group input:focus, .cms-input-group textarea:focus { border-color: var(--accent); outline: none; }
    
    .cms-card-edit { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 6px; margin-bottom: 15px; position: relative; }
    .cms-card-edit .del-btn { position: absolute; top: 15px; right: 15px; background: #ff4444; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
    
    .cms-btn { background: var(--accent); color: #000; border: none; padding: 10px 20px; border-radius: 4px; font-weight: 700; cursor: pointer; transition: opacity 0.3s; }
    .cms-btn:hover { opacity: 0.9; }
    .cms-btn.secondary { background: rgba(255,255,255,0.1); color: #fff; }
    
    .cms-upload-zone { border: 2px dashed rgba(255,255,255,0.2); padding: 20px; text-align: center; border-radius: 4px; cursor: pointer; transition: all 0.3s; margin-bottom: 15px; }
    .cms-upload-zone:hover { border-color: var(--accent); background: rgba(255,94,0,0.05); }
    .cms-upload-zone input { display: none; }
    .cms-preview-video { width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-top: 10px; border: 1px solid rgba(255,255,255,0.1); }
  `;
  document.head.appendChild(style);

  // Inject Toggle Button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'cms-toggle-btn';
  toggleBtn.innerText = '⚙ CMS Admin Dashboard';
  document.body.appendChild(toggleBtn);

  // Inject Dashboard Container
  const dashboard = document.createElement('div');
  dashboard.className = 'cms-dashboard';
  document.body.appendChild(dashboard);

  let tempState = null;

  toggleBtn.addEventListener('click', () => {
    if(dashboard.classList.contains('active')) {
      dashboard.classList.remove('active');
      toggleBtn.innerText = '⚙ CMS Admin Dashboard';
    } else {
      tempState = JSON.parse(JSON.stringify(window.ACTIVE_CMS_DATA || CMS_DATA));
      // Carry over blobs which aren't stringified
      tempState.demos.forEach((d, i) => d.videoBlob = (window.ACTIVE_CMS_DATA || CMS_DATA).demos[i]?.videoBlob);
      tempState.videoTestimonials.forEach((v, i) => v.videoBlob = (window.ACTIVE_CMS_DATA || CMS_DATA).videoTestimonials[i]?.videoBlob);
      renderDashboard();
      dashboard.classList.add('active');
      toggleBtn.innerText = '❌ Close Dashboard';
    }
  });

  function renderDashboard() {
    dashboard.innerHTML = `
      <div class="cms-header">
        <h2>PORTFOLIO CMS</h2>
        <div>
          <button class="cms-btn secondary" id="cms-cancel">Cancel</button>
          <button class="cms-btn" id="cms-save" style="margin-left: 10px;">💾 Save & Publish</button>
        </div>
      </div>
      
      <div class="cms-section">
        <h3>Social Links</h3>
        <div class="cms-grid">
          <div class="cms-input-group"><label>Email</label><input type="text" id="soc-email" value="${tempState.social.email}"></div>
          <div class="cms-input-group"><label>Calendly URL</label><input type="text" id="soc-cal" value="${tempState.social.calendly}"></div>
          <div class="cms-input-group"><label>LinkedIn URL</label><input type="text" id="soc-lin" value="${tempState.social.linkedin}"></div>
          <div class="cms-input-group"><label>Upwork URL</label><input type="text" id="soc-upw" value="${tempState.social.upwork}"></div>
        </div>
      </div>

      <div class="cms-section">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h3 style="margin:0; border:none; padding:0;">Live Demos</h3>
          <button class="cms-btn secondary" id="add-demo">+ Add Demo</button>
        </div>
        <div id="demo-list"></div>
      </div>

      <div class="cms-section">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h3 style="margin:0; border:none; padding:0;">Video Testimonials</h3>
          <button class="cms-btn secondary" id="add-vtest">+ Add Testimonial</button>
        </div>
        <div id="vtest-list"></div>
      </div>
    `;

    // Render Demos
    const demoList = document.getElementById('demo-list');
    tempState.demos.forEach((demo, i) => {
      const card = document.createElement('div');
      card.className = 'cms-card-edit';
      card.innerHTML = `
        <button class="del-btn" data-idx="${i}" data-type="demo">Delete</button>
        <div class="cms-grid">
          <div>
            <div class="cms-upload-zone" onclick="document.getElementById('demo-file-${i}').click()">
              Click to Upload Video (MP4/WebM)
              <input type="file" id="demo-file-${i}" accept="video/mp4,video/webm">
            </div>
            ${demo.videoBlob ? `<video class="cms-preview-video" src="${URL.createObjectURL(demo.videoBlob)}" autoplay loop muted></video>` : ''}
          </div>
          <div>
            <div class="cms-input-group"><label>Title</label><input type="text" class="demo-title" data-idx="${i}" value="${demo.title}"></div>
            <div class="cms-input-group"><label>Description</label><textarea class="demo-desc" data-idx="${i}" rows="3">${demo.description}</textarea></div>
          </div>
        </div>
      `;
      demoList.appendChild(card);

      // Upload Logic
      document.getElementById(`demo-file-${i}`).addEventListener('change', e => {
        if(e.target.files.length > 0) {
          tempState.demos[i].videoBlob = e.target.files[0];
          renderDashboard();
        }
      });
    });

    // Render Video Testimonials
    const vtestList = document.getElementById('vtest-list');
    tempState.videoTestimonials.forEach((vt, i) => {
      const card = document.createElement('div');
      card.className = 'cms-card-edit';
      card.innerHTML = `
        <button class="del-btn" data-idx="${i}" data-type="vtest">Delete</button>
        <div class="cms-grid">
          <div>
            <div class="cms-upload-zone" onclick="document.getElementById('vt-file-${i}').click()">
              Click to Upload Video (MP4/WebM)
              <input type="file" id="vt-file-${i}" accept="video/mp4,video/webm">
            </div>
            ${vt.videoBlob ? `<video class="cms-preview-video" src="${URL.createObjectURL(vt.videoBlob)}" autoplay loop muted></video>` : ''}
          </div>
          <div>
            <div class="cms-input-group"><label>Highlight Text (e.g. $15K+ Recovered)</label><input type="text" class="vt-high" data-idx="${i}" value="${vt.highlight}"></div>
          </div>
        </div>
      `;
      vtestList.appendChild(card);

      // Upload Logic
      document.getElementById(`vt-file-${i}`).addEventListener('change', e => {
        if(e.target.files.length > 0) {
          tempState.videoTestimonials[i].videoBlob = e.target.files[0];
          renderDashboard();
        }
      });
    });

    // Event Listeners for Inputs
    document.querySelectorAll('.demo-title').forEach(el => el.addEventListener('input', e => tempState.demos[e.target.dataset.idx].title = e.target.value));
    document.querySelectorAll('.demo-desc').forEach(el => el.addEventListener('input', e => tempState.demos[e.target.dataset.idx].description = e.target.value));
    document.querySelectorAll('.vt-high').forEach(el => el.addEventListener('input', e => tempState.videoTestimonials[e.target.dataset.idx].highlight = e.target.value));

    // Add / Delete Logic
    document.getElementById('add-demo').addEventListener('click', () => {
      tempState.demos.push({ title: "New Demo", description: "Description here", link: tempState.social.calendly });
      renderDashboard();
    });
    document.getElementById('add-vtest').addEventListener('click', () => {
      tempState.videoTestimonials.push({ highlight: "New Client Result" });
      renderDashboard();
    });
    document.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const type = e.target.dataset.type;
        const idx = e.target.dataset.idx;
        if(type === 'demo') tempState.demos.splice(idx, 1);
        if(type === 'vtest') tempState.videoTestimonials.splice(idx, 1);
        renderDashboard();
      });
    });

    // Save & Publish
    document.getElementById('cms-save').addEventListener('click', async () => {
      tempState.social.email = document.getElementById('soc-email').value;
      tempState.social.calendly = document.getElementById('soc-cal').value;
      tempState.social.linkedin = document.getElementById('soc-lin').value;
      tempState.social.upwork = document.getElementById('soc-upw').value;

      // Save to IndexedDB
      const db = await initDB();
      const tx = db.transaction('cms_store', 'readwrite');
      tx.objectStore('cms_store').put(tempState, 'CMS_DATA');
      
      tx.oncomplete = () => {
        dashboard.classList.remove('active');
        toggleBtn.innerText = '⚙ CMS Admin Dashboard';
        alert("Changes Saved & Published!");
        // Rerender actual site
        if(typeof renderSite === 'function') renderSite(tempState);
      };
    });

    document.getElementById('cms-cancel').addEventListener('click', () => {
      dashboard.classList.remove('active');
      toggleBtn.innerText = '⚙ CMS Admin Dashboard';
    });
  }
})();
