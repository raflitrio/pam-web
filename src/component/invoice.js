import React, { useState, useEffect } from 'react';
import apiClient from '../utils/axiosConfig';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'bulma/css/bulma.min.css';
import { useAuth } from '../utils/AuthContext';
import { getAuthHeaders } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Invoice = () => { // eslint-disable-line no-unused-vars
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      if (!authToken) {
        setError("Autentikasi diperlukan. Silakan login kembali.");
        setLoading(false);
        return;
      }
      try {
        const response = await apiClient.get(`/pembayaran`); // Hapus headers eksplisit
        if (response.data && response.data.success) {
          setTransactions(response.data.data || []);
        } else {
          setError(response.data.message || 'Gagal mengambil data transaksi.');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengambil data transaksi.');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [authToken]);

  const handleViewInvoice = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleDownloadInvoice = (transaction) => {
    const doc = new jsPDF();
    if (!transaction || !transaction.items || !Array.isArray(transaction.items)) {
      console.error("Data transaksi tidak valid untuk membuat PDF.", transaction);
      alert("Tidak dapat membuat PDF, data transaksi tidak lengkap.");
      return;
    }

    doc.setFontSize(18);
    doc.text('Invoice', 14, 20);

    doc.setFontSize(12);
    doc.text(`Nama: ${transaction.nama_pelanggan || transaction.nama || 'N/A'}`, 14, 30);
    doc.text(`Tanggal: ${transaction.tanggal_transaksi || transaction.tanggal ? new Date(transaction.tanggal_transaksi || transaction.tanggal).toLocaleDateString('id-ID') : 'N/A'}`, 14, 40);
    doc.text(`Total: Rp ${(transaction.total_tagihan || transaction.total || 0).toLocaleString('id-ID')}`, 14, 50);

    const tableColumn = ['No', 'Deskripsi', 'Jumlah', 'Harga'];
    const tableRows = transaction.items.map((item, index) => [
      index + 1,
      item.deskripsi,
      item.jumlah,
      `Rp ${(item.harga_satuan || item.harga || 0).toLocaleString('id-ID')}`,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
    });

    doc.text('Terima kasih atas transaksi Anda!', 14, doc.lastAutoTable.finalY + 10);

    doc.save(`Invoice_${transaction.nama_pelanggan || transaction.nama || 'Pelanggan'}_${transaction.id_transaksi || transaction.id}.pdf`);
  };

  return (
    <section className="section">
      <div className="container is-fluid">
        <h1 className="title">Manajemen Invoice</h1>

        {loading && (
          <div className="has-text-centered">
            <progress className="progress is-small is-primary" max="100">Memuat...</progress>
            <p>Memuat data transaksi...</p>
          </div>
        )}

        {error && (
          <div className="notification is-danger is-light">
            <button className="delete" onClick={() => setError(null)}></button>
            {error}
          </div>
        )}

        {!loading && !error && transactions.length === 0 && (
          <div className="notification is-info is-light">
            Tidak ada data transaksi yang dapat ditampilkan untuk invoice.
          </div>
        )}

        {!loading && !error && transactions.length > 0 && (
          <div className="box">
            <h2 className="subtitle">Daftar Transaksi</h2>
            <div className="table-container">
              <table className="table is-fullwidth is-striped is-hoverable">
                <thead>
                  <tr>
                    <th>ID Transaksi</th>
                    <th>Nama Pelanggan</th>
                    <th>Tanggal</th>
                    <th>Total</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id_transaksi || transaction.id}>
                      <td>{transaction.id_transaksi || transaction.id}</td>
                      <td>{transaction.nama_pelanggan || transaction.nama || 'N/A'}</td>
                      <td>{transaction.tanggal_transaksi || transaction.tanggal ? new Date(transaction.tanggal_transaksi || transaction.tanggal).toLocaleDateString('id-ID') : 'N/A'}</td>
                      <td>Rp {(transaction.total_tagihan || transaction.total || 0).toLocaleString('id-ID')}</td>
                      <td>
                        <button
                          className="button is-small is-info mr-2"
                          onClick={() => handleViewInvoice(transaction)}
                        >
                          Lihat
                        </button>
                        <button
                          className="button is-small is-primary"
                          onClick={() => handleDownloadInvoice(transaction)}
                        >
                          Unduh PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      {selectedTransaction && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setSelectedTransaction(null)}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Invoice</p>
              <button
                className="delete"
                aria-label="close"
                onClick={() => setSelectedTransaction(null)}
              ></button>
            </header>
            <section className="modal-card-body">
              <p><strong>ID Transaksi:</strong> {selectedTransaction.id_transaksi || selectedTransaction.id}</p>
              <p><strong>Nama Pelanggan:</strong> {selectedTransaction.nama_pelanggan || selectedTransaction.nama || 'N/A'}</p>
              <p><strong>Tanggal:</strong> {selectedTransaction.tanggal_transaksi || selectedTransaction.tanggal ? new Date(selectedTransaction.tanggal_transaksi || selectedTransaction.tanggal).toLocaleDateString('id-ID') : 'N/A'}</p>
              <p><strong>Total:</strong> Rp {(selectedTransaction.total_tagihan || selectedTransaction.total || 0).toLocaleString('id-ID')}</p>

              <h3 className="subtitle is-6 mt-4">Detail Item:</h3>
              {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                <table className="table is-fullwidth is-striped is-narrow">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Deskripsi</th>
                      <th>Jumlah</th>
                      <th>Harga Satuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransaction.items.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.deskripsi}</td>
                      <td>{item.jumlah}</td>
                      <td>Rp {item.harga.toLocaleString()}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              ) : (
                <p>Tidak ada detail item untuk transaksi ini.</p>
              )}

            </section>
            <footer className="modal-card-foot">
              <button
                className="button"
                onClick={() => setSelectedTransaction(null)}
              >
                Tutup
              </button>
            </footer>
          </div>
        </div>
      )}
      </div>
    </section>
  );
};

export default Invoice;
