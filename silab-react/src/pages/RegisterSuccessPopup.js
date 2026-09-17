export default function RegisterSuccessPopup({ onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
                <h2 className="text-xl font-bold mb-3">Akun Berhasil Dibuat!</h2>
                <p className="mb-4">Klik tombol di bawah untuk pergi ke halaman Login.</p>

                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    OK
                </button>
            </div>
        </div>
    );
}