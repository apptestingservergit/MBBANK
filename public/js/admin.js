document.addEventListener("DOMContentLoaded", function () {
    // === 1. KIỂM TRA ĐĂNG NHẬP ===
    // Dựa theo code login.js của bạn, role được lưu vào localStorage
    const role = localStorage.getItem("role");
    if (role !== "admin") {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "/";
        return;
    }

    // Đăng xuất
    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/";
    });

    // Toggle Menu Sidebar
    const el = document.getElementById("wrapper");
    const toggleButton = document.getElementById("menu-toggle");
    toggleButton.onclick = function () {
        el.classList.toggle("toggled");
    };

    // === 2. HÀM TIỆN ÍCH ===
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    const showToast = (message, isSuccess = true) => {
        const toastEl = document.getElementById('liveToast');
        const toastHeader = document.getElementById('toastHeader');
        const toastMessage = document.getElementById('toastMessage');
        
        toastHeader.className = `toast-header text-white ${isSuccess ? 'bg-success' : 'bg-danger'}`;
        toastMessage.textContent = message;
        
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    };

    // Modal instances
    const addLoanModal = new bootstrap.Modal(document.getElementById('addLoanModal'));
    const editLoanModal = new bootstrap.Modal(document.getElementById('editLoanModal'));
    const addTranModal = new bootstrap.Modal(document.getElementById('addTranModal'));

    // Biến lưu dữ liệu
    let currentLoans = [];
    let currentTrans = [];

    // === 3. LOAD & RENDER DỮ LIỆU ===
    const loadData = async () => {
        try {
            const [loanRes, tranRes] = await Promise.all([
                fetch('/api/loans'),
                fetch('/api/transactions')
            ]);
            currentLoans = await loanRes.json();
            currentTrans = await tranRes.json();
            
            renderDashboard();
            renderLoans();
            renderTrans();
        } catch (error) {
            console.error("Lỗi tải dữ liệu", error);
            showToast("Lỗi tải dữ liệu từ server!", false);
        }
    };

    const renderDashboard = () => {
        let totalLoan = 0, totalPaid = 0;
        currentLoans.forEach(loan => {
            totalLoan += loan.amount;
            totalPaid += loan.paid;
        });
        
        document.getElementById('stat-total-loan').textContent = formatCurrency(totalLoan);
        document.getElementById('stat-total-paid').textContent = formatCurrency(totalPaid);
        document.getElementById('stat-total-remain').textContent = formatCurrency(totalLoan - totalPaid);
    };

    const renderLoans = () => {
        const tbody = document.getElementById('loanTableBody');
        tbody.innerHTML = currentLoans.map((loan, index) => {
            const remain = loan.amount - loan.paid;
            const statusBadge = loan.isOverdue 
                ? '<span class="badge bg-danger">Quá Hạn</span>' 
                : '<span class="badge bg-success">Đang Hạn</span>';
            
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td class="fw-bold">${loan.name}</td>
                    <td class="text-primary fw-bold">${formatCurrency(loan.amount)}</td>
                    <td class="text-success">${formatCurrency(loan.paid)}</td>
                    <td class="text-danger fw-bold">${formatCurrency(remain)}</td>
                    <td>${statusBadge}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-warning text-dark me-1" onclick="openEditLoan('${loan._id}')" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteLoan('${loan._id}')" title="Xóa">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    };

    const renderTrans = () => {
        const tbody = document.getElementById('tranTableBody');
        tbody.innerHTML = currentTrans.map((tran, index) => `
            <tr>
                <td>${index + 1}</td>
                <td class="text-success fw-bold">+${formatCurrency(tran.amount)}</td>
                <td>${formatDate(tran.date)}</td>
                <td>${tran.description}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-danger" onclick="deleteTran('${tran._id}')" title="Xóa">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    };

    // === 4. CRUD KHOẢN VAY ===
    document.getElementById('addLoanForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('addLoanName').value,
            amount: Number(document.getElementById('addLoanAmount').value),
            paid: Number(document.getElementById('addLoanPaid').value),
            isOverdue: document.getElementById('addLoanStatus').value === 'true'
        };

        const res = await fetch('/api/loans', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            addLoanModal.hide();
            document.getElementById('addLoanForm').reset();
            showToast("Thêm khoản vay thành công!");
            loadData();
        }
    });

    window.openEditLoan = (id) => {
        const loan = currentLoans.find(l => l._id === id);
        if(!loan) return;

        document.getElementById('editLoanId').value = loan._id;
        document.getElementById('editLoanName').value = loan.name;
        document.getElementById('editLoanAmount').value = loan.amount;
        document.getElementById('editLoanPaid').value = loan.paid;
        document.getElementById('editLoanStatus').value = loan.isOverdue.toString();
        
        editLoanModal.show();
    };

    document.getElementById('editLoanForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editLoanId').value;
        const data = {
            name: document.getElementById('editLoanName').value,
            amount: Number(document.getElementById('editLoanAmount').value),
            paid: Number(document.getElementById('editLoanPaid').value),
            isOverdue: document.getElementById('editLoanStatus').value === 'true'
        };

        const res = await fetch(`/api/loans/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (res.ok) {
            editLoanModal.hide();
            showToast("Cập nhật thành công!");
            loadData();
        }
    });

    window.deleteLoan = async (id) => {
        if (confirm("Bạn có chắc chắn muốn xóa khoản vay này không?")) {
            const res = await fetch(`/api/loans/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("Đã xóa khoản vay!");
                loadData();
            }
        }
    };

    // === 5. CRUD LỊCH SỬ CHUYỂN KHOẢN ===
    // Tự động gán giờ hiện tại khi mở form thêm giao dịch
    document.getElementById('addTranModal').addEventListener('show.bs.modal', () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('addTranDate').value = now.toISOString().slice(0, 16);
    });

    document.getElementById('addTranForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            amount: Number(document.getElementById('addTranAmount').value),
            date: document.getElementById('addTranDate').value,
            description: document.getElementById('addTranDesc').value
        };

        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            addTranModal.hide();
            document.getElementById('addTranForm').reset();
            showToast("Đã lưu lịch sử chuyển khoản!");
            loadData();
        }
    });

    window.deleteTran = async (id) => {
        if (confirm("Xóa lịch sử chuyển khoản này?")) {
            const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("Đã xóa thành công!");
                loadData();
            }
        }
    };

    // Khởi chạy khi load trang
    loadData();
});