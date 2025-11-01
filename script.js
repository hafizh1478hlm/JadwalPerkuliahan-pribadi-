// Contoh: klik baris untuk menampilkan alert detail
document.querySelectorAll(".jadwal-table tbody tr").forEach(row => {
  row.addEventListener("click", () => {
    const mataKuliah = row.cells[3]?.textContent;
    const dosen = row.cells[4]?.textContent;
    if (mataKuliah && dosen) {
      alert(`Mata Kuliah: ${mataKuliah}\nDosen: ${dosen}`);
    }
  });
});
