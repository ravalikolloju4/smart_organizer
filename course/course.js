// ✅ Define courseName first
const courseName = new URLSearchParams(window.location.search).get('course');
document.getElementById('course-title').innerText = `📚 ${courseName}`;

// ✅ Then load stored data
let notes = JSON.parse(localStorage.getItem(`${courseName}-notes`)) || [];
let links = JSON.parse(localStorage.getItem(`${courseName}-links`)) || [];
let media = JSON.parse(localStorage.getItem(`${courseName}-media`)) || [];
let voiceNotes = JSON.parse(localStorage.getItem(`${courseName}-voices`)) || [];

// ------------------------ NOTES ------------------------
function addNote() {
  const input = document.getElementById('note-input');
  const noteContent = input.value.trim();
  if (!noteContent) return;

  const now = new Date();
  const note = {
    content: noteContent,
    date: now.toDateString()
  };

  notes.push(note);
  localStorage.setItem(`${courseName}-notes`, JSON.stringify(notes));
  input.value = '';
  renderNotes();
}

function renderNotes() {
  const container = document.getElementById('note-list');
  container.innerHTML = '';

  notes.forEach((note, index) => {
    const box = document.createElement('div');
    box.className = 'note-box';
box.innerHTML = `
  <div class="note-header">
    <div class="note-options" onclick="toggleOptions(this)">⋯
      <div class="note-menu">
        <span onclick="startEditNote(${index}, this)">✏️ Edit</span>
        <span onclick="deleteNote(${index})">🗑️ Delete</span>
      </div>
    </div>
    <div class="note-date">${note.date}</div>
  </div>
  <div class="note-preview" onclick="toggleFullNote(this)">
    ${note.content.length > 80 ? note.content.slice(0, 80) + '...' : ''}
  </div>
  <div class="note-full ${note.content.length > 80 ? 'hidden' : ''}">${note.content}</div>
`;

    container.appendChild(box);
  });
}

function toggleFullNote(previewEl) {
  const fullNote = previewEl.nextElementSibling;
  fullNote.classList.toggle('hidden');
}

function toggleOptions(el) {
  const menu = el.querySelector('.note-menu');
  document.querySelectorAll('.note-menu.show').forEach(m => {
    if (m !== menu) m.classList.remove('show');
  });
  menu.classList.toggle('show');
}

function startEditNote(index, menuItem) {
  // ✅ Close menu first
  document.querySelectorAll('.note-menu').forEach(m => m.classList.remove('show'));

  const note = notes[index];
  const noteBox = menuItem.closest('.note-box');

  const newContent = `
    <textarea class="note-edit-text">${note.content}</textarea>
    <div class="edit-buttons">
      <button onclick="saveNoteEdit(${index}, this)">Save</button>
      <button onclick="cancelEdit()">Cancel</button>
    </div>
  `;

  noteBox.querySelector('.note-preview').outerHTML = `<div class="edit-area">${newContent}</div>`;
  noteBox.querySelector('.note-full').classList.add('hidden');
}


function saveNoteEdit(index, btn) {
  const newText = btn.closest('.edit-area').querySelector('.note-edit-text').value.trim();
  if (!newText) return;

  notes[index].content = newText;
  localStorage.setItem(`${courseName}-notes`, JSON.stringify(notes));
  renderNotes();
}

function cancelEdit() {
  renderNotes();
}

function deleteNote(index) {
  if (confirm("Delete this note?")) {
    notes.splice(index, 1);
    localStorage.setItem(`${courseName}-notes`, JSON.stringify(notes));
    renderNotes();
  }
}

// ------------------------ LINKS ------------------------
function addLink() {
  const title = document.getElementById('link-title').value.trim();
  const url = document.getElementById('link-url').value.trim();
  if (!title || !url) return;

  links.push({ title, url });
  localStorage.setItem(`${courseName}-links`, JSON.stringify(links));
  renderLinks();

  document.getElementById('link-title').value = '';
  document.getElementById('link-url').value = '';
}

function renderLinks() {
  const container = document.getElementById('link-list');
  container.innerHTML = '';
  links.forEach((link, index) => {
    const box = document.createElement('div');
    box.className = 'link-box';
    box.innerHTML = `
      <div class="link-header">
        <div class="link-options" onclick="toggleOptions(this)">⋯
          <div class="note-menu">
            <span onclick="editLink(${index}, this)">✏️ Edit</span>
            <span onclick="deleteLink(${index})">🗑️ Delete</span>
          </div>
        </div>
        <a href="${link.url}" target="_blank">${link.title}</a>
      </div>
    `;
    container.appendChild(box);
  });
}

function editLink(index, el) {
  toggleOptions(el.closest('.link-options')); // close menu

  const newTitle = prompt("Edit link title:", links[index].title);
  const newUrl = prompt("Edit link URL:", links[index].url);
  if (newTitle && newUrl) {
    links[index].title = newTitle;
    links[index].url = newUrl;
    localStorage.setItem(`${courseName}-links`, JSON.stringify(links));
    renderLinks();
  }
}

function deleteLink(index) {
  if (confirm("Delete this link?")) {
    links.splice(index, 1);
    localStorage.setItem(`${courseName}-links`, JSON.stringify(links));
    renderLinks();
  }
}

// ------------------------ MEDIA ------------------------

function uploadMedia() {
  const input = document.getElementById('media-input');
  const file = input.files[0];
  if (!file) {
    alert("Please select a media file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const base64Data = e.target.result;

    media.push({
      url: base64Data,
      type: file.type.startsWith('image') ? 'image' : 'video',
      date: now.toDateString(),
      month: monthKey
    });

    localStorage.setItem(`${courseName}-media`, JSON.stringify(media));
    renderMedia();
  };

  reader.readAsDataURL(file);

  // ✅ This must be after reader.readAsDataURL, not before
  input.value = '';
}

function renderMedia() {
  const container = document.getElementById('media-gallery');
  container.innerHTML = '';

  const grouped = {};
  media.forEach((item, index) => {
    if (!grouped[item.month]) grouped[item.month] = [];
    grouped[item.month].push({ ...item, index });
  });

  for (const month in grouped) {
    const section = document.createElement('div');
    section.className = 'month-section';

    const heading = document.createElement('h3');
    heading.textContent = formatMonth(month);
    heading.onclick = () => section.classList.toggle('expanded');

    const grid = document.createElement('div');
    grid.className = 'media-grid';

grouped[month].forEach(({ url, type, date, index }) => {
  const box = document.createElement('div');
  box.className = 'media-box';
  box.setAttribute('data-index', index);

  box.innerHTML = `
    <div class="note-options" onclick="toggleOptions(this)">⋯
      <div class="note-menu">
        <span onclick="editMedia(${index})">✏️ Edit</span>
        <span onclick="deleteMedia(${index})">🗑️ Delete</span>
      </div>
    </div>
    <small>${date}</small><br>
    ${type === 'image'
      ? `<img src="${url}" alt="media">`
      : `<video controls src="${url}"></video>`}
    ${media[index].label ? `<p>${media[index].label}</p>` : ''}
  `;
  grid.appendChild(box);
});



    section.appendChild(heading);
    section.appendChild(grid);
    container.appendChild(section);
  }
}


function formatMonth(str) {
  const [year, month] = str.split("-");
  const date = new Date(year, month - 1);
  return `${date.toLocaleString('default', { month: 'long' })} ${year}`;
}

function editMedia(index) {
  const newLabel = prompt("Enter a new caption or name:");
  if (!newLabel) return;
  media[index].label = newLabel;
  localStorage.setItem(`${courseName}-media`, JSON.stringify(media));
  renderMedia();
}

function deleteMedia(index) {
  if (confirm("Delete this media item?")) {
    media.splice(index, 1);
    localStorage.setItem(`${courseName}-media`, JSON.stringify(media));
    renderMedia();
  }
}

function toggleOptions(el) {
  const menu = el.querySelector('.note-menu');
  document.querySelectorAll('.note-menu.show').forEach(m => {
    if (m !== menu) m.classList.remove('show');
  });
  menu.classList.toggle('show');
}



// ------------------------ VOICE NOTES ------------------------
function uploadVoice() {
  const input = document.getElementById('voice-input');
  const file = input.files[0];
  if (!file) return;

  const now = new Date();
  const url = URL.createObjectURL(file);
  const date = now.toDateString();

  voiceNotes.push({ url, date });
  localStorage.setItem(`${courseName}-voices`, JSON.stringify(voiceNotes));
  renderVoiceNotes();
}

function renderVoiceNotes() {
  const container = document.getElementById('voice-list');
  container.innerHTML = '';

  voiceNotes.forEach(note => {
    const box = document.createElement('div');
    box.className = 'voice-box';
    box.innerHTML = `
      <small>${note.date}</small><br>
      <audio controls src="${note.url}"></audio>
      <p><i>Transcription coming soon...</i></p>
    `;
    container.appendChild(box);
  });
}

// ------------------------ UTILITY ------------------------
function goHome() {
  window.location.href = '/index.html';
}

// ------------------------ INIT ------------------------
renderNotes();
renderLinks();
renderMedia();
renderVoiceNotes();
// ✅ Attach media upload listener once DOM is loaded
document.getElementById('upload-media-btn').addEventListener('click', uploadMedia);


