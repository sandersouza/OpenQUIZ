(() => {
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
            const emailSanitized = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailSanitized)) {
                alert(t.invalid_email || "Invalid email format");
                return;
            }

            const nameRegex = /^[A-Za-zÀ-ÿ' -]+$/;
            if (!nameRegex.test(firstName)) {
                alert(t.invalid_first_name || "Invalid first name");
                return;
            }
            if (!nameRegex.test(lastName)) {
                alert(t.invalid_last_name || "Invalid last name");
                return;
            }

            if (password.length < 8) {
                alert(t.invalid_password || "Password must be at least 8 characters");
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
                        email: emailSanitized,
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

    document.getElementById("openRegisterModal").addEventListener("click", (e) => {
        e.preventDefault();
        openModal();
    });

    setupForm();
})();
