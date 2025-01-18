document.addEventListener("DOMContentLoaded", () => {
    const modalContainer = document.getElementById("modalContainer");

    // Função para abrir o modal
    const openModal = () => {
        const modal = document.getElementById("registerModal");
        modal.classList.remove("hidden");
        modal.classList.add("show");
        modal.style.display = "block";

        // Configura o botão para fechar o modal
        const closeModalBtn = document.getElementById("closeModal");
        closeModalBtn.addEventListener("click", closeModal);
    };

    // Função para fechar o modal
    const closeModal = () => {
        const modal = document.getElementById("registerModal");
        modal.classList.remove("show");
        modal.classList.add("hidden");
        modal.style.display = "none";
    };

    // Evento para abrir o modal ao clicar no botão
    document.getElementById("openRegisterModal").addEventListener("click", async (e) => {
        e.preventDefault();
        if (!document.getElementById("registerModal")) {
            try {
                const response = await fetch("register-modal.html");
                const modalContent = await response.text();
                modalContainer.innerHTML = modalContent;

                // Recarregar validação de formulário e eventos
                setupFormValidation();
                openModal();
            } catch (error) {
                console.error("Erro ao carregar o modal:", error);
            }
        } else {
            openModal();
        }
    });

    // Configuração da validação do formulário
    const setupFormValidation = () => {
        const registerForm = document.getElementById("registerForm");

        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;
            const firstName = document.getElementById("firstName").value;
            const lastName = document.getElementById("lastName").value;

            // Validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("%invalid_email%".replace('%invalid_email%', 'Invalid email format'));
                return;
            }

            // Validação de senha
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{10,30}$/;
            if (!passwordRegex.test(password)) {
                alert("%invalid_password%".replace('%invalid_password%', 'Password must contain at least one uppercase letter, one number, and one special character, and be 10-30 characters long.'));
                return;
            }

            if (password !== confirmPassword) {
                alert("%password_mismatch%".replace('%password_mismatch%', 'Passwords do not match'));
                return;
            }

            // Exibe mensagem de sucesso e fecha o modal
            alert("%registration_success%".replace('%registration_success%', 'Registration successful!'));
            closeModal();

            // Opcional: enviar os dados para o servidor aqui
            // fetch('/register', { method: 'POST', body: new FormData(registerForm) });
        });
    };
});
