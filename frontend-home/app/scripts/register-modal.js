(() => {
    const modalContainer = document.getElementById("modalContainer");

    const openModal = () => {
        const modal = document.getElementById("registerModal");
        modal.classList.remove("hidden");
        modal.classList.add("show");
        modal.style.display = "block";
        const closeModalBtn = document.getElementById("closeModal");
        closeModalBtn.addEventListener("click", closeModal);
    };

    const closeModal = () => {
        const modal = document.getElementById("registerModal");
        if (!modal) return;
        modal.classList.remove("show");
        modal.classList.add("hidden");
        modal.style.display = "none";
    };

    const setupForm = () => {
        const registerForm = document.getElementById("registerForm");
        if (!registerForm) return;
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;
            const firstName = document.getElementById("firstName").value;
            const lastName = document.getElementById("lastName").value;

            const t = window.currentTranslations || {};

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert(t.invalid_email || "Invalid email format");
                return;
            }
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{10,30}$/;
            if (!passwordRegex.test(password)) {
                alert(t.invalid_password || "Password must contain at least one uppercase letter, one number, and one special character, and be 10-30 characters long.");
                return;
            }
            if (password !== confirmPassword) {
                alert(t.password_mismatch || "Passwords do not match");
                return;
            }

            try {
                const res = await fetch('https://localhost:4433/users/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        first_name: firstName,
                        last_name: lastName,
                        password
                    })
                });
                if (res.ok) {
                    alert(t.registration_success || 'User created successfully!');
                    closeModal();
                    window.location.href = '/';
                } else {
                    const data = await res.json();
                    alert(data.detail || t.registration_error || 'Error creating user');
                }
            } catch (err) {
                alert(t.connection_error || 'Connection error');
            }
        });
    };

    const loadAndOpenModal = async () => {
        if (!document.getElementById("registerModal")) {
            try {
                const response = await fetch("register-modal.html");
                const modalContent = await response.text();
                modalContainer.innerHTML = modalContent;
                setupForm();
                if (window.applyTranslations && window.currentTranslations) {
                    window.applyTranslations(window.currentTranslations);
                }
            } catch (error) {
                console.error("Erro ao carregar o modal:", error);
                return;
            }
        }
        openModal();
    };

    document.getElementById("openRegisterModal").addEventListener("click", (e) => {
        e.preventDefault();
        loadAndOpenModal();
    });
})();
