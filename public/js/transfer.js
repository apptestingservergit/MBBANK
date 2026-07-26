document.addEventListener("DOMContentLoaded", async function () {
    const role = localStorage.getItem("role");
    if (role !== "user") {
        alert("Bạn cần đăng nhập để truy cập trang này!");
        window.location.href = "/";
        return;
    }

    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/";
    });

    try {
        const res = await fetch('/api/settings');
        const settings = await res.json();
        
        if (settings) {
            if (settings.staffName) {
                document.getElementById("transferStaffName").textContent = settings.staffName;
            }
            if (settings.accountNumber) {
                document.getElementById("transferAccountNumber").textContent = settings.accountNumber;
            }
        }
    } catch (error) {
        console.error("Lỗi tải thông tin cấu hình:", error);
    }
});