// === Navbar Popup Logic ===
const menuIcon = document.querySelector('.menu-icon');
const userIcon = document.querySelector('.user-icon');
const menuPopup = document.getElementById('menuPopup');
const userPopup = document.getElementById('userPopup');

menuIcon.addEventListener('click', () => {
  menuPopup.style.display = menuPopup.style.display === 'block' ? 'none' : 'block';
  userPopup.style.display = 'none';
});

userIcon.addEventListener('click', () => {
  userPopup.style.display = userPopup.style.display === 'block' ? 'none' : 'block';
  menuPopup.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (
    !menuPopup.contains(e.target) &&
    !menuIcon.contains(e.target) &&
    !userPopup.contains(e.target) &&
    !userIcon.contains(e.target)
  ) {
    menuPopup.style.display = 'none';
    userPopup.style.display = 'none';
  }
});

// =================================================================
// === Calendar & Local Storage Logic ===
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
  const calendarGrid = document.querySelector('.calendar-grid');
  const currentMonthYear = document.getElementById('currentMonthYear');
  const prevMonth = document.getElementById('prevMonth');
  const nextMonth = document.getElementById('nextMonth');
  const jadwalInputPopup = document.getElementById('jadwalInputPopup');
  const kirimBtn = document.getElementById('kirimJadwal');
  const batalBtn = document.getElementById('batalJadwal');
  const mainNotesTable = document.getElementById('mainNotesTable');
  const saveMainNotesBtn = document.getElementById('saveMainNotes');

  let currentDate = new Date();
  let activeDay = null;

  // 1. FUNGSI SIMPAN KE LOCAL STORAGE
  function saveSchedules() {
    const rows = Array.from(mainNotesTable.querySelectorAll('.notes-row:not(.header-row)'));
    const schedules = rows.map(row => {
      // Ambil data dari setiap kolom
      const dataId = row.getAttribute('data-id'); 
      return {
        id: dataId,
        tanggal: row.querySelector('.notes-col:nth-child(1)').textContent,
        waktu: row.querySelector('.notes-col:nth-child(2)').textContent,
        ruangan: row.querySelector('.notes-col:nth-child(3)').textContent,
        matkul: row.querySelector('.notes-col:nth-child(4)').textContent,
        dosen: row.querySelector('.notes-col:nth-child(5)').textContent,
        // Ambil teks dari elemen catatan yang bisa diedit (contenteditable)
        catatan: row.querySelector('.notes-col.catatan').textContent, 
      };
    });
    // Menyimpan array objek ke localStorage setelah diubah menjadi string JSON
    localStorage.setItem('studentSchedules', JSON.stringify(schedules));
    console.log('Jadwal disimpan ke Local Storage.');
  }
  
  // 2. FUNGSI RENDER SATU BARIS JADWAL
  function renderScheduleRow(schedule) {
    const newRow = document.createElement('div');
    newRow.classList.add('notes-row', 'editable-row');
    // Tambahkan data-id agar baris dapat diidentifikasi saat dihapus/disimpan
    newRow.setAttribute('data-id', schedule.id); 
    newRow.innerHTML = `
      <div class="notes-col">${schedule.tanggal}</div>
      <div class="notes-col">${schedule.waktu}</div>
      <div class="notes-col">${schedule.ruangan}</div>
      <div class="notes-col">${schedule.matkul}</div>
      <div class="notes-col">${schedule.dosen}</div>
      <div class="notes-col catatan" contenteditable="true">${schedule.catatan}</div>
      <div class="notes-col delete-btn" style="text-align:center; cursor:pointer;">🗑️</div>
    `;

    // Event listener untuk hapus
    newRow.querySelector('.delete-btn').addEventListener('click', () => {
      newRow.remove();
      saveSchedules(); // Simpan perubahan setelah penghapusan
    });
    
    // Event listener untuk menyimpan catatan saat selesai diedit (blur)
    newRow.querySelector('.notes-col.catatan').addEventListener('blur', () => {
        saveSchedules();
    });
    
    mainNotesTable.appendChild(newRow);
  }

  // 3. FUNGSI MUAT DARI LOCAL STORAGE
  function loadSchedules() {
    const storedSchedules = localStorage.getItem('studentSchedules');
    if (storedSchedules) {
      // Mengubah string JSON menjadi array objek
      const schedules = JSON.parse(storedSchedules); 
      schedules.forEach(renderScheduleRow);
    }
  }

  // Panggil saat DOMContentLoaded untuk memuat data saat halaman dibuka
  loadSchedules();
  
  // =================================================================
  // === Kalender & Logic Lainnya ===
  // =================================================================
  
  function renderCalendar(date) {
    calendarGrid.innerHTML = `
      <div class="day-name">SUN</div>
      <div class="day-name">MON</div>
      <div class="day-name">TUE</div>
      <div class="day-name">WED</div>
      <div class="day-name">THU</div>
      <div class="day-name">FRI</div>
      <div class="day-name">SAT</div>
    `;

    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    currentMonthYear.textContent = `${date.toLocaleString('id-ID', { month: 'long' })} ${year}`;

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.classList.add('calendar-day', 'empty');
      calendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = document.createElement('div');
      d.classList.add('calendar-day');
      d.textContent = day;
      d.addEventListener('click', () => {
        if (activeDay) activeDay.classList.remove('active');
        d.classList.add('active');
        activeDay = d;
        jadwalInputPopup.style.display = 'flex';
      });
      calendarGrid.appendChild(d);
    }
  }

  renderCalendar(currentDate);

  prevMonth.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  // Update jam real-time
  function updateTime() {
    const now = new Date();
    const formatted = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('timeLabel').textContent = formatted;
  }
  setInterval(updateTime, 1000);
  updateTime();


  nextMonth.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  // === Popup Logic ===
  batalJadwal.addEventListener('click', () => {
    jadwalInputPopup.style.display = 'none';
  });

  // LOGIKA KIRIM JADWAL (DITAMBAH LOCAL STORAGE)
  kirimJadwal.addEventListener('click', () => {
    const matkul = document.getElementById('mataKuliahSelect').value;
    const dosen = document.getElementById('dosenSelect').value;
    const ruangan = document.getElementById('ruanganSelect').value;
    const waktu = document.getElementById('waktuSelect').value;
    const catatan = document.getElementById('catatanInput').value || '-';

    if (!matkul || !dosen || !ruangan || !waktu) {
      alert('Lengkapi semua field (Mata Kuliah, Dosen, Ruangan, Waktu) sebelum mengirim.');
      return;
    }

    const tanggalText = activeDay ? `${activeDay.textContent} ${currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}` : 'Tanggal Tidak Dipilih';
    
    // Buat objek data baru dengan ID unik
    const newSchedule = {
        id: Date.now().toString(), // ID unik
        tanggal: tanggalText,
        waktu: waktu,
        ruangan: ruangan,
        matkul: matkul,
        dosen: dosen,
        catatan: catatan,
    };
    
    // Render baris baru dan tambahkan ke tabel
    renderScheduleRow(newSchedule);

    // 🌟 Simpan ke Local Storage setelah baris baru ditambahkan
    saveSchedules();

    // Reset input dan tutup popup
    document.getElementById('mataKuliahSelect').value = '';
    document.getElementById('dosenSelect').value = '';
    document.getElementById('ruanganSelect').value = '';
    document.getElementById('waktuSelect').value = '';
    document.getElementById('catatanInput').value = '';
    if(activeDay) activeDay.classList.remove('active');
    activeDay = null;

    jadwalInputPopup.style.display = 'none';
    alert('Jadwal berhasil ditambahkan dan disimpan!');
  });

  // Close popup when clicking outside
  jadwalInputPopup.addEventListener('click', (e) => {
    if (e.target === jadwalInputPopup) jadwalInputPopup.style.display = 'none';
  });

  // LOGIKA SIMPAN CATATAN (MEMASTIKAN INLINE EDIT TERSIMPAN)
  document.getElementById('saveMainNotes').addEventListener('click', () => {
    saveSchedules(); // Panggil fungsi simpan
    alert('Catatan berhasil disimpan!');
  });

});