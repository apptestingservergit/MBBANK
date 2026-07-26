document.addEventListener("DOMContentLoaded", function () {
    // === 1. KIỂM TRA BẢO MẬT PHÂN QUYỀN ===
    const role = localStorage.getItem("role");
    if (role !== "user") {
        alert("Bạn cần đăng nhập với tư cách người dùng để truy cập trang này!");
        window.location.href = "/";
        return;
    }

    // Xử lý nút đăng xuất
    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/";
    });

    // === 2. HÀM TIỆN ÍCH ĐỊNH DẠNG ===
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    // === 3. TẢI DỮ LIỆU TỪ SERVER & MONGODB ===
    const loadUserData = async () => {
        try {
            const [loanRes, tranRes] = await Promise.all([
                fetch('/api/loans'),
                fetch('/api/transactions')
            ]);

            const loans = await loanRes.json();
            const transactions = await tranRes.json();

            renderUserLoans(loans);
            renderUserTransactions(transactions);

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu người dùng:", error);
        }
    };

    // === 4. RENDER BẢNG KHOẢN VAY VÀ TÍNH TỔNG ===
    const renderUserLoans = (loans) => {
        const tbody = document.getElementById("userLoanTableBody");
        
        let totalBorrowed = 0;
        let totalPaid = 0;

        if (loans.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Chưa có khoản vay nào được ghi nhận.</td></tr>`;
            updateStats(0, 0, 0);
            return;
        }

        tbody.innerHTML = loans.map(loan => {
            const remain = loan.amount - loan.paid;
            totalBorrowed += loan.amount;
            totalPaid += loan.paid;

            const statusBadge = loan.isOverdue 
                ? '<span class="badge bg-danger">Quá Hạn</span>' 
                : '<span class="badge bg-success">Đang Hạn</span>';

            return `
                <tr>
                    <td class="fw-bold">${loan.name}</td>
                    <td class="text-primary fw-semibold">${formatCurrency(loan.amount)}</td>
                    <td class="text-success">${formatCurrency(loan.paid)}</td>
                    <td class="text-danger fw-bold">${formatCurrency(remain)}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');

        const totalRemaining = totalBorrowed - totalPaid;
        updateStats(totalBorrowed, totalPaid, totalRemaining);
    };

    // Cập nhật lên các ô thống kê tổng tiền
    const updateStats = (borrowed, paid, remaining) => {
        document.getElementById("userTotalBorrowed").textContent = formatCurrency(borrowed);
        document.getElementById("userTotalPaid").textContent = formatCurrency(paid);
        document.getElementById("userTotalRemaining").textContent = formatCurrency(remaining);
    };

    // === 5. RENDER LỊCH SỬ CHUYỂN KHOẢN ===
    const renderUserTransactions = (transactions) => {
        const tbody = document.getElementById("userTranTableBody");

        if (transactions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">Chưa có lịch sử chuyển khoản nào.</td></tr>`;
            return;
        }

        tbody.innerHTML = transactions.map(tran => `
            <tr>
                <td class="text-success fw-bold">+${formatCurrency(tran.amount)}</td>
                <td class="small text-muted">${formatDate(tran.date)}</td>
                <td>${tran.description}</td>
            </tr>
        `).join('');
    };

    // Khởi chạy khi mở trang
    loadUserData();
});