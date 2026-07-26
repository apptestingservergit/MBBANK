document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const alertBox = document.getElementById("loginAlert");
    const btnLogin = document.getElementById("btnLogin");

    // Xóa sạch thông tin cũ mỗi khi vào lại trang đăng nhập
    localStorage.removeItem("role");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Chặn việc tự động load lại trang khi ấn submit

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        // Ẩn bảng thông báo lỗi (nếu nó đang hiện)
        alertBox.classList.add("d-none");
        
        // Hiệu ứng Loading cho nút đăng nhập
        btnLogin.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang xử lý...';
        btnLogin.disabled = true;

        try {
            // Gọi API kiểm tra đăng nhập trên server.js
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                // Đăng nhập thành công -> Lưu quyền (admin hoặc user) vào trình duyệt
                localStorage.setItem("role", data.role);

                // Chuyển hướng người dùng tới trang tương ứng
                if (data.role === "admin") {
                    window.location.href = "/admin";
                } else if (data.role === "user") {
                    window.location.href = "/user";
                }
            } else {
                // Đăng nhập thất bại -> Hiện lỗi từ máy chủ
                alertBox.textContent = data.message; // "Sai tài khoản hoặc mật khẩu"
                alertBox.classList.remove("d-none");
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error);
            alertBox.textContent = "Không thể kết nối đến máy chủ. Vui lòng thử lại!";
            alertBox.classList.remove("d-none");
        } finally {
            // Trả lại trạng thái bình thường cho nút bấm
            btnLogin.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Đăng Nhập';
            btnLogin.disabled = false;
        }
    });
});