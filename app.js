document.addEventListener("DOMContentLoaded", loadStokBarang);

const formBarang = document.getElementById("formBarang");
const namaBarangInput = document.getElementById("namaBarang");
const jumlahBarangInput = document.getElementById("jumlahBarang");
const stokBarangList = document.getElementById("stokBarangTableBody");
const totalBarangDisplay = document.getElementById("totalBarang");
const barangPilih = document.getElementById("barangPilih");
const transaksiTabel = document.getElementById("tabelRiwayatTransaksi");

// Menambahkan Barang ke dalam daftar
formBarang.addEventListener("submit", function (e) {
  e.preventDefault();

  const namaBarang = namaBarangInput.value;
  const jumlahBarang = parseInt(jumlahBarangInput.value);

  console.log("Adding Item:", { namaBarang, jumlahBarang });

  if (namaBarang && jumlahBarang) {
    const barang = {
      id: Date.now(), // Menggunakan timestamp sebagai ID unik
      nama: namaBarang,
      jumlah: jumlahBarang,
      riwayatTransaksi: [],
    };

    const stokBarang = getStokBarang();
    stokBarang.push(barang);
    localStorage.setItem("stokBarang", JSON.stringify(stokBarang));

    namaBarangInput.value = "";
    jumlahBarangInput.value = "";

    loadStokBarang(); // Memperbarui tampilan daftar barang setelah ditambahkan
  }
});

// Mengambil Data Stok Barang dari LocalStorage
function getStokBarang() {
  const stokBarang = localStorage.getItem("stokBarang");
  return stokBarang ? JSON.parse(stokBarang) : [];
}

// Menampilkan Daftar Stok Barang dan menghitung total barang
function loadStokBarang() {
  const stokBarang = getStokBarang();
  stokBarangList.innerHTML = "";
  barangPilih.innerHTML = '<option value="">Pilih Barang</option>'; // Reset pilihan barang

  let totalBarang = 0;

  stokBarang.forEach(function (barang, index) {
    totalBarang += barang.jumlah;

    const option = document.createElement("option");
    option.value = barang.id;
    option.textContent = `${barang.nama} - ${barang.jumlah}`;
    barangPilih.appendChild(option);

    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${index + 1}</td>
    <td>${barang.nama}</td>
    <td>${barang.jumlah}</td>
    <td>
      <button onclick="editBarang(${
        barang.id
      })"><i class="fas fa-edit fa-xs"></i></button>
      <button onclick="hapusBarang(${
        barang.id
      })"><i class="fas fa-trash fa-xs"></i></button>
    </td>
  `;

    stokBarangList.appendChild(row);
  });

  totalBarangDisplay.textContent = totalBarang;

  // Load transaction history
  loadRiwayatTransaksi();
}

// Menghapus Barang
function hapusBarang(id) {
  const stokBarang = getStokBarang();
  const updatedStokBarang = stokBarang.filter((barang) => barang.id !== id);
  localStorage.setItem("stokBarang", JSON.stringify(updatedStokBarang));
  loadStokBarang(); // Memperbarui tampilan setelah barang dihapus
}

// Mengedit Barang
function editBarang(id) {
  const stokBarang = getStokBarang();
  const barang = stokBarang.find((barang) => barang.id === id);

  namaBarangInput.value = barang.nama;
  jumlahBarangInput.value = barang.jumlah;

  hapusBarang(id); // Menghapus barang yang sedang diedit agar bisa disimpan ulang
}

// Rekap Barang Masuk dan Keluar
const formRekap = document.getElementById("formRekap");
const barangMasukKeluar = document.getElementById("barangMasukKeluar");
const jumlahRekapInput = document.getElementById("jumlahRekap");

formRekap.addEventListener("submit", function (e) {
  e.preventDefault();

  const barangId = parseInt(barangPilih.value);
  const jenisTransaksi = barangMasukKeluar.value;
  const jumlahRekap = parseInt(jumlahRekapInput.value);

  if (isNaN(jumlahRekap) || jumlahRekap <= 0) {
    alert("Jumlah harus lebih besar dari 0");
    return;
  }

  if (!barangId) {
    alert("Pilih barang terlebih dahulu");
    return;
  }

  const stokBarang = getStokBarang();
  const barang = stokBarang.find((b) => b.id === barangId);

  if (jenisTransaksi === "masuk") {
    tambahBarangMasuk(barang, jumlahRekap);
  } else {
    if (barang.jumlah < jumlahRekap) {
      alert("Jumlah barang keluar melebihi stok yang ada");
      return;
    }
    tambahBarangKeluar(barang, jumlahRekap);
  }

  jumlahRekapInput.value = "";
  loadStokBarang();
});

// Fungsi untuk menambah barang masuk
function tambahBarangMasuk(barang, jumlah) {
  const currentDate = new Date().toLocaleDateString();
  const stokAwal = barang.jumlah;
  barang.jumlah += jumlah;

  barang.riwayatTransaksi.push({
    tanggal: currentDate,
    stokAwal: stokAwal,
    barangMasuk: jumlah,
    barangKeluar: 0,
    stokAkhir: barang.jumlah,
  });

  const stokBarang = getStokBarang();
  const updatedStokBarang = stokBarang.map((b) =>
    b.id === barang.id ? barang : b
  );
  localStorage.setItem("stokBarang", JSON.stringify(updatedStokBarang));

  loadRiwayatTransaksi(); // Update transaction history table
}

// Fungsi untuk menambah barang keluar
function tambahBarangKeluar(barang, jumlah) {
  const currentDate = new Date().toLocaleDateString();
  const stokAwal = barang.jumlah;
  barang.jumlah -= jumlah;

  barang.riwayatTransaksi.push({
    tanggal: currentDate,
    stokAwal: stokAwal,
    barangMasuk: 0,
    barangKeluar: jumlah,
    stokAkhir: barang.jumlah,
  });

  const stokBarang = getStokBarang();
  const updatedStokBarang = stokBarang.map((b) =>
    b.id === barang.id ? barang : b
  );
  localStorage.setItem("stokBarang", JSON.stringify(updatedStokBarang));

  loadRiwayatTransaksi(); // Update transaction history table
}

// Load Riwayat Transaksi to table
function loadRiwayatTransaksi() {
  const stokBarang = getStokBarang();
  const transaksiTabelBody = document.getElementById("tabelRiwayatTransaksi");

  // Clear previous table rows
  transaksiTabelBody.innerHTML = "";

  // Loop through the stock and show the transaction history for each item
  stokBarang.forEach((barang, index) => {
    barang.riwayatTransaksi.forEach((transaksi, transaksiIndex) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${transaksiIndex + 1}</td>
        <td>${transaksi.tanggal}</td>
        <td>${barang.nama}</td>
        <td>${transaksi.stokAwal}</td>
        <td>${transaksi.barangMasuk}</td>
        <td>${transaksi.barangKeluar}</td>
        <td>${transaksi.stokAkhir}</td>
      `;
      transaksiTabelBody.appendChild(row); // Append row to the table
    });
  });
}
